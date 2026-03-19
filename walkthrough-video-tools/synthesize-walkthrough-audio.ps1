param(
  [Parameter(Mandatory = $true)][string]$ManifestPath,
  [Parameter(Mandatory = $true)][string]$OutputDir,
  [string]$VoiceName = "Microsoft Zira Desktop",
  [int]$Rate = -1
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Speech

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

$segments = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$installedVoices = $synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }

if ($installedVoices -contains $VoiceName) {
  $synth.SelectVoice($VoiceName)
}

$synth.Volume = 100
$synth.Rate = $Rate

foreach ($segment in $segments) {
  $wavPath = Join-Path $OutputDir ("segment-{0:D2}.wav" -f ([int]$segment.index))
  $synth.SetOutputToWaveFile($wavPath)
  $synth.Speak([string]$segment.speech)
  $synth.SetOutputToNull()
}

$synth.Dispose()
