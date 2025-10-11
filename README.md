# E-Vote Blockchain Project

Sistem voting menggunakan blockchain dengan arsitektur full-stack yang terdiri dari frontend Next.js, backend Go API, dan blockchain validators.

## 🏗️ Arsitektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Go)          │◄──►│   Validators    │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 26657   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Services

1. **Frontend** (Next.js 15.5.4)

    - Interface untuk voting
    - Port: 3000
    - Hot reload dalam development

2. **Backend API** (Go)

    - REST API server
    - Port: 8080
    - Komunikasi dengan blockchain

3. **Blockchain Validators** (CometBFT)
    - Validator 1: Port 26657, 26656, 26658
    - Validator 2: Port 26667, 26666, 26668
    - Consensus dan penyimpanan data voting

## 🚀 Quick Start

### Menjalankan Semua Services

```bash
# Menggunakan script manager (recommended)
./manage.sh start

# Atau manual dengan docker-compose
docker-compose up -d
```

### Mengakses Aplikasi

-   **Frontend**: http://localhost:3000
-   **Backend API**: http://localhost:8080
-   **Blockchain RPC**: http://localhost:26657

## 📋 Commands

### Script Manager

```bash
# Mulai semua services
./manage.sh start

# Hentikan semua services
./manage.sh stop

# Restart semua services
./manage.sh restart

# Lihat status services
./manage.sh status

# Lihat logs semua services
./manage.sh logs

# Lihat logs service tertentu
./manage.sh logs frontend
./manage.sh logs backend

# Build ulang images
./manage.sh build

# Cleanup semua containers dan images
./manage.sh clean
```

### Docker Compose Manual

```bash
# Build dan start
docker-compose up -d

# Stop
docker-compose down

# Lihat logs
docker-compose logs -f

# Rebuild specific service
docker-compose build frontend
docker-compose up -d frontend
```

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend/api
go run main.go
```

## 📁 Struktur Project

```
e-vote/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.mjs
│   └── src/
├── backend/
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── main.go
│   │   └── routes.go
│   └── chain/
│       ├── Dockerfile
│       ├── main.go
│       └── app/
├── scripts/
│   ├── entrypoint-node.sh
│   └── init-validators.sh
├── docker-compose.yml
├── manage.sh
└── README.md
```

## 🔧 Configuration

### Environment Variables

Konfigurasi dapat disesuaikan melalui docker-compose.yml:

```yaml
environment:
    - COMET_RPC=http://validator1:26657
    - HOME_DIR=/root/.cometbft
    - NODE_ENV=production
```

### Network Configuration

Semua services berjalan dalam network `evote-net` untuk komunikasi internal.

### Ports

-   Frontend: 3000
-   Backend API: 8080
-   Validator 1: 26657 (RPC), 26656 (P2P), 26658 (ABCI)
-   Validator 2: 26667 (RPC), 26666 (P2P), 26668 (ABCI)

## 🐛 Troubleshooting

### Port Conflicts

Jika ada konflik port:

```bash
# Cek port yang digunakan
lsof -i :3000
lsof -i :8080

# Hentikan process yang menggunakan port
kill -9 <PID>
```

### Service Tidak Berjalan

```bash
# Cek status containers
docker-compose ps

# Lihat logs untuk debugging
./manage.sh logs

# Restart service tertentu
docker-compose restart frontend
```

### Build Issues

```bash
# Clean build
./manage.sh clean
./manage.sh build
./manage.sh start
```

## 📊 Monitoring

### Health Checks

```bash
# Frontend
curl http://localhost:3000

# Backend API
curl http://localhost:8080

# Blockchain Status
curl http://localhost:26657/status
```

### Logs

```bash
# Real-time logs
docker-compose logs -f

# Specific service logs
docker-compose logs frontend
```

## 🔐 Security Notes

-   Frontend menggunakan non-root user dalam container
-   Multi-stage builds untuk optimasi ukuran image
-   Volumes untuk persistent data blockchain
-   Network isolation untuk services

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test dengan `./manage.sh start`
5. Submit pull request

## 📝 License

[Sesuaikan dengan license project Anda]
