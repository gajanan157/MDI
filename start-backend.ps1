# MD India Enrollment System - Backend Microservices Runner
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting MD India Enrollment Backend Services" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseDir = $PSScriptRoot
$logsDir = Join-Path $baseDir "logs"
if (!(Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

$services = @(
    @{ Name = "workflow-service"; Port = 8084; Jar = "workflow-service\target\workflow-service-1.0.0-SNAPSHOT.jar" },
    @{ Name = "policy-service";   Port = 8083; Jar = "policy-service\target\policy-service-1.0.0-SNAPSHOT.jar" },
    @{ Name = "inward-service";   Port = 8082; Jar = "inward-service\target\inward-service-1.0.0-SNAPSHOT.jar" },
    @{ Name = "member-service";   Port = 8085; Jar = "member-service\target\member-service-1.0.0-SNAPSHOT.jar" },
    @{ Name = "master-service";   Port = 8081; Jar = "master-service\target\master-service-1.0.0-SNAPSHOT.jar" },
    @{ Name = "ecard-service";    Port = 8086; Jar = "ecard-service\target\ecard-service-1.0.0-SNAPSHOT.jar" },
    @{ Name = "tpa-service";      Port = 8087; Jar = "tpa-service\target\tpa-service-1.0.0-SNAPSHOT.jar" },
    @{ Name = "insurer-service";  Port = 8088; Jar = "insurer-service\target\insurer-service-1.0.0-SNAPSHOT.jar" },
    @{ Name = "provider-service"; Port = 8089; Jar = "provider-service\target\provider-service-1.0.0-SNAPSHOT.jar" }
)

foreach ($svc in $services) {
    $jarPath = Join-Path $baseDir $svc.Jar
    $logOut = Join-Path $logsDir "$($svc.Name).log"
    $logErr = Join-Path $logsDir "$($svc.Name).err.log"
    
    Write-Host "Starting $($svc.Name) on port $($svc.Port)..." -ForegroundColor Yellow
    Start-Process -FilePath "java" `
        -ArgumentList "-Xms128m -Xmx256m -jar `"$jarPath`"" `
        -RedirectStandardOutput $logOut `
        -RedirectStandardError $logErr `
        -NoNewWindow
}

Write-Host "`nAll 9 microservices launched in background!" -ForegroundColor Green
Write-Host "Logs are located in: $logsDir" -ForegroundColor Cyan
Write-Host "WebSocket endpoint: ws://localhost:8084/ws/notifications" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
