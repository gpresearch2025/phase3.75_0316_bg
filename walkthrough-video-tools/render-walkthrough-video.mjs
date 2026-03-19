import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ffmpegPath from "ffmpeg-static";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prototypeDir = path.resolve(__dirname, "..", "prototype");
const scriptPath = path.join(prototypeDir, "script.js");
const outputDir = path.join(prototypeDir, "assets", "walkthrough-video");
const tempDir = path.join(__dirname, ".tmp");
const audioDir = path.join(tempDir, "audio");
const imageDir = path.join(tempDir, "images");
const segmentDir = path.join(tempDir, "segments");
const manifestPath = path.join(tempDir, "walkthrough-segments.json");
const concatPath = path.join(tempDir, "concat.txt");
const srtPath = path.join(tempDir, "consentext-boss-walkthrough.srt");
const intermediateVideoPath = path.join(tempDir, "consentext-boss-walkthrough-nocaptions.mp4");
const finalVideoPath = path.join(outputDir, "consentext-boss-walkthrough.mp4");
const finalSrtPath = path.join(outputDir, "consentext-boss-walkthrough.srt");
const voiceName = "Microsoft Zira Desktop";
const fps = 30;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  ensureCleanDirectory(tempDir);
  ensureDirectory(outputDir);
  ensureDirectory(audioDir);
  ensureDirectory(imageDir);
  ensureDirectory(segmentDir);

  const segments = loadWalkthroughSegments();
  writeJson(manifestPath, segments.map((segment, index) => ({
    index,
    speech: segment.speech
  })));

  synthesizeAudio();
  const segmentDurations = segments.map((_, index) => getWavDurationSeconds(path.join(audioDir, `segment-${String(index).padStart(2, "0")}.wav`)));
  await renderImages(segments);
  encodeSegmentVideos(segmentDurations);
  writeConcatFile(segments.length);
  concatSegmentVideos();
  writeSrt(segments, segmentDurations, srtPath);
  burnSubtitles();
  fs.copyFileSync(srtPath, finalSrtPath);

  const totalSeconds = segmentDurations.reduce((sum, duration) => sum + duration, 0);
  console.log(`Created ${finalVideoPath}`);
  console.log(`Created ${finalSrtPath}`);
  console.log(`Approximate runtime: ${formatClock(totalSeconds)}`);
}

function loadWalkthroughSegments() {
  const source = fs.readFileSync(scriptPath, "utf8");
  const match = source.match(/const walkthroughSegments = (\[[\s\S]*?\n\]);/);
  if (!match) {
    throw new Error("Could not locate walkthroughSegments in script.js");
  }

  return Function(`"use strict"; return (${match[1]});`)();
}

function synthesizeAudio() {
  const scriptFile = path.join(__dirname, "synthesize-walkthrough-audio.ps1");
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptFile,
      "-ManifestPath",
      manifestPath,
      "-OutputDir",
      audioDir,
      "-VoiceName",
      voiceName,
      "-Rate",
      "-1"
    ],
    { stdio: "inherit" }
  );
}

async function renderImages(segments) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  await page.goto(pathToFileURL(path.join(prototypeDir, "index.html")).href, {
    waitUntil: "networkidle"
  });
  await page.addStyleTag({ content: exportStyles() });
  await page.evaluate(() => {
    document.body.classList.add("video-export-mode");
    window.scrollTo(0, 0);
  });
  await page.evaluate(async () => {
    if (document.fonts && "ready" in document.fonts) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(500);

  for (let index = 0; index < segments.length; index += 1) {
    await page.evaluate((chapterIndex) => {
      const button = document.querySelector(`[data-walkthrough-index="${chapterIndex}"]`);
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`Missing walkthrough chapter ${chapterIndex + 1}`);
      }
      button.click();
    }, index);
    await page.waitForTimeout(140);
    await page.screenshot({
      path: path.join(imageDir, `segment-${String(index).padStart(2, "0")}.png`),
      type: "png"
    });
  }

  await browser.close();
}

function encodeSegmentVideos(segmentDurations) {
  for (let index = 0; index < segmentDurations.length; index += 1) {
    const duration = Math.max(segmentDurations[index] + 0.15, 1);
    const imagePath = path.join(imageDir, `segment-${String(index).padStart(2, "0")}.png`);
    const audioPath = path.join(audioDir, `segment-${String(index).padStart(2, "0")}.wav`);
    const videoPath = path.join(segmentDir, `segment-${String(index).padStart(2, "0")}.mp4`);

    execFfmpeg([
      "-y",
      "-loop",
      "1",
      "-framerate",
      String(fps),
      "-t",
      duration.toFixed(3),
      "-i",
      imagePath,
      "-i",
      audioPath,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-pix_fmt",
      "yuv420p",
      "-vf",
      "scale=1920:1080,format=yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      "-shortest",
      videoPath
    ]);
  }
}

function writeConcatFile(segmentCount) {
  const entries = [];
  for (let index = 0; index < segmentCount; index += 1) {
    const filePath = path.join(segmentDir, `segment-${String(index).padStart(2, "0")}.mp4`).replace(/\\/g, "/");
    entries.push(`file '${filePath}'`);
  }
  fs.writeFileSync(concatPath, `${entries.join("\n")}\n`, "utf8");
}

function concatSegmentVideos() {
  execFfmpeg([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatPath,
    "-c",
    "copy",
    intermediateVideoPath
  ]);
}

function burnSubtitles() {
  execFfmpeg(
    [
      "-y",
      "-i",
      intermediateVideoPath,
      "-vf",
      subtitleFilter(path.basename(srtPath)),
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "22",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "copy",
      "-movflags",
      "+faststart",
      finalVideoPath
    ],
    tempDir
  );
}

function writeSrt(segments, segmentDurations, outputPath) {
  const blocks = [];
  let currentStart = 0;
  let cueIndex = 1;

  segments.forEach((segment, segmentIndex) => {
    const duration = segmentDurations[segmentIndex];
    const chunks = chunkSpeech(segment.speech);
    const totalChars = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    let chunkStart = currentStart;

    chunks.forEach((chunk, chunkIndex) => {
      const isLastChunk = chunkIndex === chunks.length - 1;
      const portion = totalChars > 0 ? chunk.length / totalChars : 1 / chunks.length;
      const chunkDuration = isLastChunk ? currentStart + duration - chunkStart : Math.max(duration * portion, 1.25);
      const chunkEnd = isLastChunk ? currentStart + duration : Math.min(chunkStart + chunkDuration, currentStart + duration);
      blocks.push(`${cueIndex}\n${formatSrtTime(chunkStart)} --> ${formatSrtTime(chunkEnd)}\n${chunk}\n`);
      cueIndex += 1;
      chunkStart = chunkEnd;
    });

    currentStart += duration;
  });

  fs.writeFileSync(outputPath, `${blocks.join("\n")}\n`, "utf8");
}

function chunkSpeech(text) {
  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const chunks = [];
  let currentChunk = "";

  sentences.forEach((sentence) => {
    const next = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    if (next.length > 130 && currentChunk) {
      chunks.push(currentChunk);
      currentChunk = sentence;
      return;
    }

    currentChunk = next;
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length ? chunks : [text.trim()];
}

function subtitleFilter(srtFileName) {
  const style = [
    "FontName=Segoe UI",
    "FontSize=20",
    "PrimaryColour=&H00FFFFFF",
    "OutlineColour=&H00302118",
    "BackColour=&H90000000",
    "BorderStyle=3",
    "Outline=1",
    "Shadow=0",
    "MarginV=36",
    "Alignment=2"
  ].join(",");

  return `subtitles=${escapeForSubtitleFilter(srtFileName)}:force_style='${style}'`;
}

function escapeForSubtitleFilter(value) {
  return value.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/,/g, "\\,").replace(/'/g, "\\'");
}

function getWavDurationSeconds(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`Unsupported WAV format: ${filePath}`);
  }

  let offset = 12;
  let byteRate = 0;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkDataStart = offset + 8;

    if (chunkId === "fmt ") {
      byteRate = buffer.readUInt32LE(chunkDataStart + 8);
    }

    if (chunkId === "data") {
      dataSize = chunkSize;
      break;
    }

    offset = chunkDataStart + chunkSize + (chunkSize % 2);
  }

  if (!byteRate || !dataSize) {
    throw new Error(`Could not read WAV duration: ${filePath}`);
  }

  return dataSize / byteRate;
}

function execFfmpeg(args, cwd = process.cwd()) {
  execFileSync(ffmpegPath, args, {
    cwd,
    stdio: "inherit"
  });
}

function ensureCleanDirectory(directoryPath) {
  fs.rmSync(directoryPath, { recursive: true, force: true });
  ensureDirectory(directoryPath);
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function formatSrtTime(totalSeconds) {
  const wholeMilliseconds = Math.max(Math.round(totalSeconds * 1000), 0);
  const hours = Math.floor(wholeMilliseconds / 3_600_000);
  const minutes = Math.floor((wholeMilliseconds % 3_600_000) / 60_000);
  const seconds = Math.floor((wholeMilliseconds % 60_000) / 1000);
  const milliseconds = wholeMilliseconds % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

function formatClock(totalSeconds) {
  const roundedSeconds = Math.round(totalSeconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function exportStyles() {
  return `
    html, body {
      width: 1920px;
      height: 1080px;
      margin: 0;
      overflow: hidden;
      background: #08120f;
    }

    body.video-export-mode header,
    body.video-export-mode nav,
    body.video-export-mode .main-stack > :not(#walkthrough) {
      display: none !important;
    }

    body.video-export-mode main {
      padding: 0 !important;
      display: block !important;
    }

    body.video-export-mode .main-stack {
      margin: 0 !important;
      gap: 0 !important;
      display: block !important;
    }

    body.video-export-mode #walkthrough {
      min-height: 100vh;
      height: 100vh;
      margin: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      padding: 42px 46px !important;
      background:
        radial-gradient(circle at top left, rgba(105, 189, 162, 0.16), transparent 36%),
        linear-gradient(180deg, #eff7f2, #e9f0ec);
    }

    body.video-export-mode .walkthrough-header,
    body.video-export-mode .walkthrough-controls,
    body.video-export-mode .walkthrough-progress-block,
    body.video-export-mode .walkthrough-fallback {
      display: none !important;
    }

    body.video-export-mode .walkthrough-layout {
      width: 100%;
      height: 100%;
      display: grid !important;
      grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.55fr);
      gap: 28px;
      align-items: stretch;
    }

    body.video-export-mode .walkthrough-sidebar,
    body.video-export-mode .walkthrough-stage {
      min-height: 0 !important;
      height: 100%;
    }

    body.video-export-mode .walkthrough-stage {
      padding: 34px !important;
      border-radius: 28px !important;
    }

    body.video-export-mode .walkthrough-stage-head {
      gap: 20px;
    }

    body.video-export-mode .walkthrough-stage-head h3 {
      font-size: 2.3rem !important;
    }

    body.video-export-mode .walkthrough-summary {
      max-width: 64ch;
      font-size: 1.08rem !important;
    }

    body.video-export-mode .walkthrough-screen {
      min-height: 660px;
      margin-top: 22px !important;
      padding: 34px !important;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    body.video-export-mode .walkthrough-kicker {
      font-size: 0.86rem !important;
      margin-bottom: 14px !important;
    }

    body.video-export-mode .walkthrough-story-card {
      gap: 16px !important;
    }

    body.video-export-mode .walkthrough-step {
      font-size: 0.92rem !important;
      padding: 8px 14px !important;
    }

    body.video-export-mode .walkthrough-story-card strong {
      font-size: clamp(3.6rem, 5vw, 5rem) !important;
      max-width: 13ch !important;
    }

    body.video-export-mode .walkthrough-caption {
      max-width: 68ch !important;
      font-size: 1.3rem !important;
      line-height: 1.65 !important;
    }

    body.video-export-mode .walkthrough-pill-row {
      margin-top: 24px !important;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)) !important;
    }

    body.video-export-mode .walkthrough-pill {
      font-size: 0.92rem !important;
      padding: 10px 14px !important;
    }

    body.video-export-mode .walkthrough-sidebar {
      gap: 18px !important;
    }

    body.video-export-mode .preview-card {
      padding: 22px !important;
      border-radius: 22px !important;
    }

    body.video-export-mode .preview-card h3 {
      font-size: 1.5rem !important;
    }

    body.video-export-mode .walkthrough-chapter {
      padding: 16px !important;
      gap: 8px !important;
    }
  `;
}
