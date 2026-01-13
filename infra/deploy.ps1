# Deployment script for Intent Healthcare Platform (PowerShell)

Write-Host "🚀 Deploying Intent Healthcare Platform..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Navigate to infra directory
Set-Location $PSScriptRoot

# Build and start services
Write-Host "📦 Building and starting services..." -ForegroundColor Yellow
docker-compose up -d --build

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check service status
Write-Host "📊 Service status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Services available at:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3001"
Write-Host "   - Backend API: http://localhost:8000"
Write-Host "   - API Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "📝 View logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop services: docker-compose down" -ForegroundColor Yellow

