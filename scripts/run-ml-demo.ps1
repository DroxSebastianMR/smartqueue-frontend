[CmdletBinding()]
param(
  [ValidateRange(1, 1000)]
  [int]$Clients = 200,

  [ValidateRange(30, 600)]
  [int]$DurationSeconds = 60,

  [ValidateSet('NORMAL', 'BURST', 'SUSTAINED_PEAK')]
  [string]$Scenario = 'BURST',

  [ValidateSet('PREDICTIVE', 'FIXED,REACTIVE,PREDICTIVE')]
  [string]$Modes = 'PREDICTIVE',

  [ValidateSet('BOOTSTRAP', 'AZURE_REAL')]
  [string]$ModelProfile = 'BOOTSTRAP',

  [int]$Seed = 42,

  [switch]$Rebuild
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot 'smartqueue-backend'
$pythonPath = Join-Path $projectRoot 'smartqueue-ai\.venv\Scripts\python.exe'
$azureModelPath = Join-Path $projectRoot 'smartqueue-ai\artifacts\azure-real-v1\saturation_pipeline.joblib'
$azureMetadataPath = Join-Path $projectRoot 'smartqueue-ai\artifacts\azure-real-v1\model_metadata.json'

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker Desktop no está instalado o no está disponible en PATH.'
}

try {
  docker info *> $null
} catch {
  throw 'Docker Desktop no está iniciado. Ábrelo y espera a que indique que Docker Engine está listo.'
}

if (-not (Test-Path $pythonPath)) {
  throw "No se encontró el entorno Python requerido: $pythonPath"
}

if ($ModelProfile -eq 'AZURE_REAL') {
  if (-not (Test-Path $azureModelPath) -or -not (Test-Path $azureMetadataPath)) {
    throw 'No se encontró el artefacto azure-real-v1. Ejecuta primero la preparación del dataset real documentada en smartqueue-ai/DATASET.md.'
  }
  $env:AI_MODEL_PATH = 'artifacts/azure-real-v1/saturation_pipeline.joblib'
  $env:AI_MODEL_METADATA_PATH = 'artifacts/azure-real-v1/model_metadata.json'
}

Push-Location $projectRoot
try {
  $composeArguments = @('compose', '-f', 'compose.experiments.yml', 'up', '-d', '--wait')
  if ($Rebuild -or $ModelProfile -eq 'AZURE_REAL') { $composeArguments += '--build' }
  Write-Host "Iniciando PostgreSQL, Redis, API, modelo ML ($ModelProfile) y monitor aislados…" -ForegroundColor Cyan
  & docker @composeArguments
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar el laboratorio Docker.' }

  $health = Invoke-RestMethod 'http://127.0.0.1:5001/health' -TimeoutSec 15
  if (-not $health.model_loaded) { throw 'El servicio ML inició sin un modelo cargado.' }

  $env:DATABASE_URL = 'postgresql://smartqueue:local-experiment-only@127.0.0.1:55432/smartqueue_experiments'
  $env:DIRECT_URL = $env:DATABASE_URL
  $env:AUTH_ADMIN_EMAIL = 'admin@cinetrux.test'
  $env:AUTH_ADMIN_PASSWORD = 'CinetruxAdmin2026!'
  $env:AUTH_DEMO_EMAIL = 'demo@cinetrux.test'
  $env:AUTH_DEMO_PASSWORD = 'CinetruxDemo2026!'
  $env:PILOT_API_URL = 'http://127.0.0.1:3001/api/v1'
  $env:PILOT_MODES = $Modes

  Push-Location $backendPath
  try {
    Write-Host "Inyectando $Clients clientes simulados en escenario $Scenario…" -ForegroundColor Cyan
    node prisma/run-http-pilot.mjs --simulate-clients --clients $Clients --duration $DurationSeconds --scenario $Scenario --seed $Seed
    if ($LASTEXITCODE -ne 0) { throw 'El simulador finalizó con error. Revisa la evidencia generada en smartqueue-ai/data/generated/http-pilot.' }
  } finally {
    Pop-Location
  }

  Write-Host ''
  Write-Host 'Demostración finalizada. Abre el monitor para revisar predicciones y decisiones:' -ForegroundColor Green
  Write-Host 'http://127.0.0.1:5175/monitoring' -ForegroundColor Green
  Write-Host 'Credenciales: admin@cinetrux.test / CinetruxAdmin2026!' -ForegroundColor DarkGray
  Write-Host 'El script usa solo el laboratorio local Docker (puertos 3001, 5001, 5175, 55432 y 56379); no escribe en Supabase.' -ForegroundColor DarkGray
} finally {
  Pop-Location
}
