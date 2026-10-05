# Stop all MD India Enrollment System Java backend services
Write-Host "Stopping MD India Enrollment Backend Services..." -ForegroundColor Yellow

Get-CimInstance Win32_Process | Where-Object { 
    $_.Name -eq "java.exe" -and $_.CommandLine -match "enrollment"
} | ForEach-Object {
    Write-Host "Terminating process ID: $($_.ProcessId)" -ForegroundColor Red
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Host "All MD India backend services stopped." -ForegroundColor Green
