# Intent-Based Healthcare Platform – Full Monorepo

This repository contains a FULLY DEVELOPED healthcare platform:
- Intent Engine Backend (FastAPI)
- SMART-on-FHIR Auth (OAuth2 scopes)
- FHIR Persistence
- Hospital Command Center
- Epic SMART Embedded UI
- Patient Web + Mobile Apps
- AI Triage
- Government & Insurance
- Kubernetes + Helm
- FDA SaMD + Epic Submission Docs

## Quick Start

### Deploy with Docker Compose

```bash
cd infra
docker-compose up -d
```

Access the services:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Windows (PowerShell)

```powershell
cd infra
.\deploy.ps1
```

### Linux/Mac

```bash
cd infra
chmod +x deploy.sh
./deploy.sh
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
