# Wait a bit for server to start
Start-Sleep -Seconds 2

# Login to get token
$body = @{ email = 'demo@example.com'; password = 'DemoPass123!' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $response.token
Write-Host "Login token: $token"

# Call /api/auth/me with Bearer token
$headers = @{ Authorization = "Bearer $token" }
$me = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/me' -Headers $headers -Method Get
$me | ConvertTo-Json -Depth 5 | Write-Output
