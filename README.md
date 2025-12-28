# 🚀 Spring Boot Mikroservis Projesi

Kubernetes üzerinde çalışan, JWT authentication, API Gateway, CI/CD ve monitoring stack içeren kapsamlı mikroservis mimarisi.

[![CI/CD](https://github.com/Teknowm3/Spring-Boot-Mikroservis-Projesi/actions/workflows/ci.yml/badge.svg)](https://github.com/Teknowm3/Spring-Boot-Mikroservis-Projesi/actions)

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Mimari](#-mimari)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [API Endpoints](#-api-endpoints)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [Monitoring](#-monitoring)
- [UML Diyagramları](#-uml-diyagramları)

---

## ✨ Özellikler

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| REST API | ✅ | GET, POST, PUT, PATCH, DELETE endpoints |
| JWT Authentication | ✅ | Token tabanlı kimlik doğrulama |
| API Gateway | ✅ | Spring Cloud Gateway ile routing |
| Rate Limiting | ✅ | Login/Register rate limiting |
| Service Discovery | ✅ | Netflix Eureka |
| Load Balancing | ✅ | Kubernetes Service + Gateway |
| Containerization | ✅ | Docker + Kubernetes |
| CI/CD | ✅ | GitHub Actions |
| Monitoring | ✅ | Prometheus + Grafana |
| Logging | ✅ | Loki + Promtail |
| Cloud Deployment | ✅ | Google Cloud Platform |

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                         KUBERNETES CLUSTER                       │
├─────────────────┬─────────────────────┬─────────────────────────┤
│   Worker-1      │      Worker-2       │       Worker-3          │
│   (Monitoring)  │   (Database/Core)   │    (Application)        │
├─────────────────┼─────────────────────┼─────────────────────────┤
│  • Prometheus   │  • MySQL            │  • API Gateway          │
│  • Loki         │  • Eureka Server    │  • User Service         │
│  • Grafana      │  • Auth Service     │  • Frontend             │
│  • Promtail     │  • Promtail         │  • Promtail             │
└─────────────────┴─────────────────────┴─────────────────────────┘
```

### Request Flow
```
User → Frontend (React) → Nginx → API Gateway → Microservices → MySQL
                                      ↓
                              Eureka (Service Discovery)
```

---

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **API Gateway** | Spring Cloud Gateway |
| **Backend** | Spring Boot 3.x, Java 17 |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT (JSON Web Token) |
| **Container** | Docker, containerd |
| **Orchestration** | Kubernetes |
| **Service Discovery** | Netflix Eureka |
| **Monitoring** | Prometheus, Grafana |
| **Logging** | Loki, Promtail |
| **CI/CD** | GitHub Actions |
| **Cloud** | Google Cloud Platform |

---

## 🚀 Kurulum

### Gereksinimler
- Java 17+
- Maven 3.8+
- Docker
- Kubernetes cluster (veya Docker Desktop K8s)

### Local Development
```bash
# 1. Repo'yu klonla
git clone https://github.com/Teknowm3/Spring-Boot-Mikroservis-Projesi.git
cd Spring-Boot-Mikroservis-Projesi

# 2. Backend servisleri build et
cd projeOdevi
./mvnw -B clean package -DskipTests -f eureka-server/pom.xml
./mvnw -B clean package -DskipTests -f auth-service/pom.xml
./mvnw -B clean package -DskipTests -f user-service/pom.xml
./mvnw -B clean package -DskipTests -f api-gateway/pom.xml

# 3. Docker Compose ile çalıştır
docker-compose up -d

# 4. Frontend
cd ../ystFrontend
npm install
npm run dev
```

### Kubernetes Deployment
```bash
# Namespace oluştur
kubectl apply -f projeOdevi/k8s/namespace.yaml

# Tüm servisleri deploy et
kubectl apply -f projeOdevi/k8s/
```

---

## 📡 API Endpoints

### Auth Service (Port: 8081)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/auth/login` | Kullanıcı girişi | ❌ |
| POST | `/api/auth/register` | Yeni kayıt | ❌ |
| GET | `/api/auth/me` | Mevcut kullanıcı | ✅ |
| PATCH | `/api/auth/users/{username}/role` | Rol değiştir | ✅ Admin |

### User Service (Port: 8082)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/api/users` | Tüm kullanıcılar | ✅ Admin |
| GET | `/api/users/username/{username}` | Kullanıcı detay | ✅ |
| GET | `/api/users/search?keyword=` | Kullanıcı ara | ✅ Admin |
| PUT | `/api/users/username/{username}` | Profil güncelle | ✅ |
| DELETE | `/api/users/username/{username}` | Kullanıcı sil | ✅ Admin |

---

## ☸️ Kubernetes Deployment

### Pod Dağılımı
| Node | Servisler | NodePort |
|------|-----------|----------|
| **k8s-worker-1** | Prometheus, Loki, Grafana | 30300 |
| **k8s-worker-2** | MySQL, Eureka, Auth Service | - |
| **k8s-worker-3** | API Gateway, User Service, Frontend | 30080, 31720 |

### Erişim Noktaları
```
Frontend:    http://<WORKER-3-IP>:30080
API Gateway: http://<WORKER-3-IP>:31720
Grafana:     http://<WORKER-1-IP>:30300 (admin/admin)
```

---

## 📊 Monitoring

### Grafana Dashboard
- **URL:** `http://<WORKER-1-IP>:30300`
- **User:** `admin`
- **Password:** `admin`

### Özellikler
- Service UP/DOWN durumu
- HTTP RPS ve Latency
- JVM Memory & CPU
- Application Logs (Loki)
- HTTP Endpoint Requests tablosu

---

## 📐 UML Diyagramları

Tüm diyagramlar `docs/` klasöründe Mermaid formatında bulunmaktadır:

| Diyagram | Dosya |
|----------|-------|
| Sistem Mimarisi | [01-system-architecture.md](docs/01-system-architecture.md) |
| Use Case (Kapsamlı) | [02-use-case-comprehensive.md](docs/02-use-case-comprehensive.md) |
| Kubernetes Deployment | [03-kubernetes-deployment.md](docs/03-kubernetes-deployment.md) |
| Sequence (Login) | [04-sequence-login.md](docs/04-sequence-login.md) |
| CI/CD Pipeline | [05-cicd-pipeline.md](docs/05-cicd-pipeline.md) |
| State Diagrams | [06-09 state files](docs/) |
| Class Diagram | [10-class-diagram.md](docs/10-class-diagram.md) |
| Object Diagram | [11-object-diagram.md](docs/11-object-diagram.md) |
| Sequence (Detaylı) | [12-sequence-diagrams.md](docs/12-sequence-diagrams.md) |

---

## 📁 Proje Yapısı

```
Spring-Boot-Mikroservis-Projesi/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── projeOdevi/
│   ├── eureka-server/          # Service Discovery
│   ├── api-gateway/            # API Gateway
│   ├── auth-service/           # Authentication Service
│   ├── user-service/           # User Management Service
│   ├── k8s/                    # Kubernetes manifests
│   └── observability/          # Monitoring configs
├── ystFrontend/                # React Frontend
├── docs/                       # UML Diyagramları
└── README.md
```

---

## 👥 Katkıda Bulunanlar

- **Olcay Alkan** - Developer

---

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

## 🔗 Linkler

- [GitHub Repository](https://github.com/Teknowm3/Spring-Boot-Mikroservis-Projesi)
- [Grafana Dashboard](http://<WORKER-1-IP>:30300)
