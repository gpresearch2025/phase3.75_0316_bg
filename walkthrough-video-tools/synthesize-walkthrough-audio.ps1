param(
  [Parameter(Mandatory = $true)][string]$ManifestPath,
  [Parameter(Mandatory = $true)][string]$OutputDir,
  [string]$VoiceName = "en-US-AndrewMultilingualNeural",
  [string]$Rate = "-4%",
  [int]$FallbackRate = -1
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

$segments = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
Get-ChildItem -LiteralPath $OutputDir -Filter "segment-*.*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

$python = Get-Command python -ErrorAction SilentlyContinue
$usedEdgeTts = $false

if ($python) {
  try {
    & $python.Source -m edge_tts --version | Out-Null

    foreach ($segment in $segments) {
      $mediaPath = Join-Path $OutputDir ("segment-{0:D2}.mp3" -f ([int]$segment.index))
      $args = @(
        "-m",
        "edge_tts",
        "-t",
        [string]$segment.speech,
        "-v",
        $VoiceName,
        "--rate",
        $Rate,
        "--write-media",
        $mediaPath
      )

      & $python.Source @args

      if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $mediaPath)) {
        throw "edge-tts failed to render segment $($segment.index)."
      }
    }

    $usedEdgeTts = $true
  } catch {
    Write-Warning "Falling back to System.Speech voices because edge-tts failed: $($_.Exception.Message)"
    Get-ChildItem -LiteralPath $OutputDir -Filter "segment-*.*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  }
}

if ($usedEdgeTts) {
  return
}

Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$installedVoices = $synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }

if ($installedVoices -contains $VoiceName) {
  $synth.SelectVoice($VoiceName)
}

$synth.Volume = 100
$synth.Rate = $FallbackRate

foreach ($segment in $segments) {
  $wavPath = Join-Path $OutputDir ("segment-{0:D2}.wav" -f ([int]$segment.index))
  $synth.SetOutputToWaveFile($wavPath)
  $synth.Speak([string]$segment.speech)
  $synth.SetOutputToNull()
}

$synth.Dispose()
