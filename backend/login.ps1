Param()

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bodyPath = Join-Path $scriptDir 'login.json'
$json = Get-Content -Raw -Path $bodyPath

$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body $json
$response | ConvertTo-Json -Depth 5


