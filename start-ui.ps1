# Launch MD India Enrollment React UI from "New folder"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting MD India Enrollment React UI (New folder)..." -ForegroundColor Cyan
Write-Host "WebSocket Notifications: ws://localhost:8084/ws/notifications" -ForegroundColor Yellow
Write-Host "UI will be accessible at: http://localhost:3000" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\enrollment-ui\New folder"
npm run dev
