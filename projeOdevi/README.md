# Mikroservis Projesi - Spring Boot

## 📋 Proje Özeti

JWT authentication, API Gateway ve Kubernetes deployment içeren mikroservis mimarisi projesi.

### Teknolojiler
- Spring Boot 3.5.9
- Spring Cloud Gateway
- Spring Security + JWT
- MySQL 8.0
- Docker & Kubernetes
- Eureka Service Discovery
- Prometheus (metrics)
- Grafana (dashboards)
- Loki + Promtail (logs)

---

## 🏗️ Proje Yapısı

```
projeOdevi/
├── eureka-server/      # Service Discovery (Port: 8761)
├── api-gateway/        # API Gateway (Port: 8080)
├── auth-service/       # JWT Authentication (Port: 8081)
├── user-service/       # User CRUD (Port: 8082)
├── k8s/                # Kubernetes manifests
├── docs/               # UML diyagramları
├── observability/      # Prometheus/Grafana/Loki/Promtail config + dashboards
└── docker-compose.yml  # Lokal development
```

---

## 🚀 Çalıştırma

### Ön Koşullar
- Java 17+
- Maven 3.8+
- Docker Desktop
- MySQL 8.0 (veya Docker ile)

### 1. Lokal Çalıştırma (Docker Compose)

```bash
# Proje kök dizininde (projeOdevi/) çalıştır

# Servisleri build et ve başlat
docker compose up -d --build

# Logları izle
docker compose logs -f
```

### Geliştirme Modu (Hot Reload)

Bu projede `docker compose watch` ile kaynak kod değişikliklerinde container restart edilerek hızlı geliştirme amaçlanır.

```bash
docker compose watch
```

### 2. Manuel Çalıştırma

```bash
# 1. MySQL başlat
# MySQL'de authdb ve userdb veritabanlarını oluştur

# 2. Eureka Server
cd eureka-server
mvnw spring-boot:run

# 3. API Gateway (yeni terminal)
cd api-gateway
mvnw spring-boot:run

# 4. Auth Service (yeni terminal)
cd auth-service
mvnw spring-boot:run

# 5. User Service (yeni terminal)
cd user-service
mvnw spring-boot:run
```

---

## 🔐 API Endpoints

### Auth Service
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/auth/register | Yeni kullanıcı kaydı |
| POST | /api/auth/login | JWT token al |
| GET | /api/auth/validate | Token doğrula |
| GET | /api/auth/me | Token ile oturum bilgisi (Gateway üzerinden) |

### User Service
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/users | Tüm kullanıcıları listele |
| GET | /api/users/{id} | Tek kullanıcı getir |
| POST | /api/users | Yeni kullanıcı ekle |
| PUT | /api/users/{id} | Kullanıcı güncelle |
| DELETE | /api/users/{id} | Kullanıcı sil |

---

## 🧪 API Test Örnekleri

### 1. Kayıt Ol
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@test.com"}'
```

### 2. Giriş Yap
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### 3. Korumalı Endpoint (JWT ile)
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. /api/auth/me (Auth-service restart sonrası doğrulama)

`auth-service` restart olduktan sonra token ile tekrar doğrulamak için:

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

Beklenen: `200 OK`.

---

## ☸️ Kubernetes Deployment

### Minikube ile Lokal Test

```bash
# 1. Minikube başlat
minikube start

# 2. Docker image'larını build et
docker build -t eureka-server:latest ./eureka-server
docker build -t api-gateway:latest ./api-gateway
docker build -t auth-service:latest ./auth-service
docker build -t user-service:latest ./user-service

# 3. Image'ları Minikube'a yükle
minikube image load eureka-server:latest
minikube image load api-gateway:latest
minikube image load auth-service:latest
minikube image load user-service:latest

# 4. Kubernetes manifests uygula
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/eureka-deployment.yaml
kubectl apply -f k8s/gateway-deployment.yaml
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/user-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# 5. Pod durumlarını kontrol et
kubectl get pods -n mikroservis

# 6. Servislere eriş
minikube service api-gateway -n mikroservis
```

---

## ☁️ Bulut Deployment (Oracle Cloud - Ücretsiz)

### 1. Oracle Cloud Hesabı Oluştur
https://cloud.oracle.com adresinden ücretsiz hesap oluştur

### 2. OKE (Oracle Kubernetes Engine) Cluster Oluştur
- OCI Console > Developer Services > Kubernetes Clusters
- Quick Create ile cluster oluştur

### 3. kubectl Yapılandır
```bash
oci ce cluster create-kubeconfig --cluster-id <cluster-id>
```

### 4. Deployment
```bash
kubectl apply -f k8s/
```

---

## 📊 Servis Portları

| Servis | Port | URL |
|--------|------|-----|
| Eureka Dashboard | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080 |
| Auth Service | 8081 | http://localhost:8081 |
| User Service | 8082 | http://localhost:8082 |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3001 | http://localhost:3001 |
| Loki | 3100 | http://localhost:3100 |

Not: Docker Compose bazı servisleri host'ta farklı portlara map edebilir (örn. `auth-service` bazen 50xxx portuna map olur). En doğrusu `docker compose ps` ile bakmaktır.

---

## 🔭 Observability (Metrics + Logs)

Bu proje, Docker Compose ile aşağıdaki observability stack'i ayağa kaldırır:

- Prometheus: Spring Boot Actuator `/actuator/prometheus` endpointlerinden metrik toplar.
- Grafana: Dashboard ve data source provisioning ile otomatik hazır gelir.
- Loki: Log depolama.
- Promtail: Docker container loglarını okuyup Loki'ye gönderir.

### 1) Prometheus

- URL: `http://localhost:9090`
- Target kontrol: `http://localhost:9090/targets`

### 2) Grafana

- URL: `http://localhost:3001`
- Kullanıcı: `admin`
- Şifre: `admin`

#### Dashboard

`Microservices Overview (Spring Boot)` dashboard'u otomatik provision edilir.

- Üst KPI kartları: UP, RPS, p95, CPU, Memory
- Trend grafikler: RPS/p95/CPU/Heap/Top URI
- Loglar: Logs/sec ve tail

#### Filtreleme (Service / Instance)

Dashboard değişkenleri:

- `Service`: Prometheus `job` label'ı
- `Instance`: `instanceName` label'ı

Prometheus scrape config'inde her target'a `instanceName` label'ı eklenmiştir; Grafana'da instance bazlı filtreleme buradan gelir.

### 3) Loki + Promtail (Logs)

- Loki URL: `http://localhost:3100`

Grafana Explore > Loki ile hızlı test:

```logql
{job="docker"}
```

### Promtail için kritik not (Windows/Docker Desktop)

Eğer loglar Grafana'da görünmüyorsa en sık sebep Promtail'ın Docker API versiyon uyumsuzluğudur.

Belirti:

```text
client version 1.42 is too old. Minimum supported API version is 1.44
```

Çözüm:

1) `docker-compose.yml` içindeki promtail image'ının güncel olduğundan emin ol.
2) Promtail container'ını yeniden oluştur:

```bash
docker compose pull promtail
docker compose up -d --force-recreate promtail
```

Kontrol:

```bash
docker compose logs --tail=200 promtail
```

---

## 🛠️ Troubleshooting

### Grafana panelleri boş / PromQL parse error

- Grafana panel sorgularında gereksiz escape karakterleri (`\\`) olursa Prometheus `bad_data` döndürebilir.
- Dashboard query'leri PromQL uyumlu olacak şekilde düzenlenmiştir.

### Loglar gelmiyor

- `promtail` loglarını kontrol et:

```bash
docker compose logs --tail=200 promtail
```

- Loki'nin sorgu döndürdüğünü kontrol et (Grafana Explore):

```logql
{job="docker"}
```

### Hangi port nereye map oldu?

```bash
docker compose ps
```

---

## 📁 UML Diyagramları

- `docs/architecture.puml` - Sistem mimarisi diyagramı
- `docs/use-case.puml` - Use Case diyagramı

PlantUML ile görüntülemek için: https://www.plantuml.com/plantuml/uml/

---

## 👤 Geliştirici

Olcay ALKAN

Seyfullah TAŞ

Yazılım Sistem Tasarım Projesi - 2024
