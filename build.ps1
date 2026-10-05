Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Building MD India Enrollment System Services" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

mvn clean package -DskipTests
$mvnStatus = $LASTEXITCODE

Write-Host "`nBuilding Frontend React + Vite + Tailwind UI..." -ForegroundColor Cyan
Push-Location -Path "$PSScriptRoot\enrollment-ui"
npm run build
$uiStatus = $LASTEXITCODE
Pop-Location

if ($mvnStatus -eq 0 -and $uiStatus -eq 0) {
    Write-Host "`n[SUCCESS] All MD India Enrollment System microservices and React UI built successfully!" -ForegroundColor Green
} else {
    Write-Host "`n[FAILURE] Build failed. Please inspect logs." -ForegroundColor Red
}
