# Mikroservis Projesi - Yazılım Mimarisi Diyagramları

## 1. Sistem Mimarisi (Component Diagram)

```mermaid
graph TB
    subgraph "Kullanıcı Katmanı"
        U[("👤 Kullanıcı")]
        A[("👑 Admin")]
    end

    subgraph "Frontend Layer"
        FE["🌐 React Frontend<br/>Port: 30080"]
        NGINX["Nginx Reverse Proxy"]
    end

    subgraph "API Gateway Layer"
        GW["🚪 API Gateway<br/>Spring Cloud Gateway<br/>Port: 8080"]
    end

    subgraph "Service Discovery"
        EU["📍 Eureka Server<br/>Port: 8761"]
    end

    subgraph "Microservices Layer"
        AUTH["🔐 Auth Service<br/>Port: 8081<br/>JWT Authentication"]
        USER["👥 User Service<br/>Port: 8082<br/>User Management"]
    end

    subgraph "Data Layer"
        MYSQL[("🗄️ MySQL<br/>Port: 3306<br/>authdb / userdb")]
    end

    subgraph "Monitoring Stack"
        PROM["📊 Prometheus<br/>Port: 9090"]
        LOKI["📝 Loki<br/>Port: 3100"]
        GRAF["📈 Grafana<br/>Port: 30300"]
        TAIL["🔍 Promtail"]
    end

    U --> FE
    A --> FE
    FE --> NGINX
    NGINX --> GW
    GW --> EU
    GW --> AUTH
    GW --> USER
    AUTH --> EU
    USER --> EU
    AUTH --> MYSQL
    USER --> MYSQL
    AUTH -.-> PROM
    USER -.-> PROM
    GW -.-> PROM
    TAIL --> LOKI
    PROM --> GRAF
    LOKI --> GRAF
```

## 2. Use Case Diyagramı

```mermaid
graph LR
    subgraph Aktörler
        U[("👤 Kullanıcı")]
        A[("👑 Admin")]
    end

    subgraph "Kimlik Doğrulama"
        UC1["🔑 Giriş Yap"]
        UC2["📝 Kayıt Ol"]
        UC3["🚪 Çıkış Yap"]
    end

    subgraph "Kullanıcı İşlemleri"
        UC4["👁️ Profil Görüntüle"]
        UC5["✏️ Profil Güncelle"]
    end

    subgraph "Admin İşlemleri"
        UC6["📋 Kullanıcıları Listele"]
        UC7["🔍 Kullanıcı Ara"]
        UC8["🎭 Rol Değiştir"]
        UC9["❌ Kullanıcı Sil"]
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5

    A --> UC1
    A --> UC3
    A --> UC6
    A --> UC7
    A --> UC8
    A --> UC9
```

## 3. Kubernetes Deployment Diyagramı

```mermaid
graph TB
    subgraph "GCP Kubernetes Cluster"
        subgraph "k8s-worker-1 [Monitoring]"
            P1["Prometheus Pod"]
            L1["Loki Pod"]
            G1["Grafana Pod"]
            PT1["Promtail Pod"]
        end

        subgraph "k8s-worker-2 [Database & Core]"
            M1["MySQL Pod"]
            E1["Eureka Pod"]
            AU1["Auth Service Pod"]
            PT2["Promtail Pod"]
        end

        subgraph "k8s-worker-3 [Application]"
            GW1["API Gateway Pod"]
            US1["User Service Pod"]
            FE1["Frontend Pod"]
            PT3["Promtail Pod"]
        end
    end

    subgraph "Services"
        S1["LoadBalancer<br/>:31720"]
        S2["NodePort<br/>:30080"]
        S3["NodePort<br/>:30300"]
        S4["ClusterIP"]
    end

    GW1 --> S1
    FE1 --> S2
    G1 --> S3
    M1 --> S4
    E1 --> S4
    AU1 --> S4
    US1 --> S4
```

## 4. Sequence Diagram - Login Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🌐 Frontend
    participant GW as 🚪 API Gateway
    participant AU as 🔐 Auth Service
    participant DB as 🗄️ MySQL

    U->>FE: 1. Enter credentials
    FE->>GW: 2. POST /api/auth/login
    GW->>GW: 3. Rate Limit Check
    GW->>AU: 4. Forward request
    AU->>DB: 5. Query user
    DB-->>AU: 6. User data
    AU->>AU: 7. Verify password
    AU->>AU: 8. Generate JWT
    AU-->>GW: 9. Return JWT token
    GW-->>FE: 10. Return response
    FE->>FE: 11. Store token
    FE-->>U: 12. Redirect to Dashboard
```

## 5. CI/CD Pipeline Flow

```mermaid
graph LR
    subgraph "GitHub"
        GH["📦 Push to Main"]
    end

    subgraph "GitHub Actions"
        B1["🔨 Build Services<br/>(Parallel)"]
        B2["🐳 Build Docker Images"]
        D1["📤 Distribute to Worker-2"]
        D2["📤 Distribute to Worker-3"]
        K1["☸️ Deploy Infrastructure"]
        K2["☸️ Deploy Monitoring"]
        K3["☸️ Deploy Services"]
        V["✅ Verify"]
    end

    subgraph "Kubernetes"
        CL["🌐 Live Cluster"]
    end

    GH --> B1
    B1 --> B2
    B2 --> D1
    B2 --> D2
    D1 --> K1
    D2 --> K1
    K1 --> K2
    K1 --> K3
    K2 --> V
    K3 --> V
    V --> CL
```

## 6. Teknoloji Stack Özeti

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React, Vite, TailwindCSS |
| API Gateway | Spring Cloud Gateway |
| Backend | Spring Boot 3.x |
| Database | MySQL 8.0 |
| Auth | JWT (JSON Web Token) |
| Containerization | Docker, Kubernetes |
| Service Discovery | Netflix Eureka |
| Monitoring | Prometheus, Grafana |
| Logging | Loki, Promtail |
| CI/CD | GitHub Actions |
| Cloud | Google Cloud Platform |

## 7. State Diagram - Kullanıcı Oturum Durumu

```mermaid
stateDiagram-v2
    [*] --> Anonim: Uygulamaya Giriş

    Anonim --> GirişYapılıyor: Login Tıkla
    GirişYapılıyor --> Doğrulanıyor: Credentials Gönder
    
    Doğrulanıyor --> Hata: Yanlış Şifre
    Doğrulanıyor --> RateLimited: Çok Fazla Deneme
    Doğrulanıyor --> Authenticated: Başarılı
    
    Hata --> GirişYapılıyor: Tekrar Dene
    RateLimited --> Bekliyor: 1 Dakika Bekle
    Bekliyor --> GirişYapılıyor: Timeout
    
    Authenticated --> Dashboard: JWT Token Alındı
    Dashboard --> Authenticated: Token Geçerli
    Dashboard --> TokenExpired: Token Süresi Doldu
    
    TokenExpired --> Anonim: Logout
    Dashboard --> Anonim: Manuel Logout
    
    Anonim --> KayıtOluyor: Register Tıkla
    KayıtOluyor --> Doğrulanıyor: Kayıt Başarılı
    KayıtOluyor --> Hata: Validation Error
```

## 8. State Diagram - Kullanıcı Hesap Yaşam Döngüsü

```mermaid
stateDiagram-v2
    [*] --> Kayıtsız

    Kayıtsız --> KayıtBekliyor: Register İsteği
    KayıtBekliyor --> Aktif: Kayıt Onaylandı
    KayıtBekliyor --> Kayıtsız: Validation Hatası

    Aktif --> Aktif: Login/Logout
    Aktif --> ProfilGüncelleniyor: Profil Düzenle
    ProfilGüncelleniyor --> Aktif: Güncelleme Başarılı
    ProfilGüncelleniyor --> Aktif: İptal

    Aktif --> RolDeğişiyor: Admin Rol Değiştir
    RolDeğişiyor --> AdminUser: Role = ADMIN
    RolDeğişiyor --> NormalUser: Role = USER
    AdminUser --> Aktif: Rol Atandı
    NormalUser --> Aktif: Rol Atandı

    Aktif --> Siliniyor: Admin Sil
    Siliniyor --> Silindi: Onay
    Siliniyor --> Aktif: İptal
    
    Silindi --> [*]
```

## 9. State Diagram - API Request Yaşam Döngüsü

```mermaid
stateDiagram-v2
    [*] --> RequestAlındı: HTTP Request

    RequestAlındı --> NginxProxy: Frontend'den Geldi
    NginxProxy --> APIGateway: /api/* Route
    
    APIGateway --> RateLimitCheck: Request İşleniyor
    RateLimitCheck --> Rejected: Limit Aşıldı
    RateLimitCheck --> JWTValidation: Limit OK
    
    JWTValidation --> Unauthorized: Token Geçersiz
    JWTValidation --> ServiceRouting: Token Geçerli
    JWTValidation --> ServiceRouting: Public Endpoint
    
    ServiceRouting --> AuthService: /api/auth/**
    ServiceRouting --> UserService: /api/users/**
    
    AuthService --> DBQuery: Veritabanı İşlemi
    UserService --> DBQuery: Veritabanı İşlemi
    
    DBQuery --> ResponseHazır: Başarılı
    DBQuery --> Error500: DB Hatası
    
    ResponseHazır --> [*]: 200 OK
    Rejected --> [*]: 429 Too Many Requests
    Unauthorized --> [*]: 401 Unauthorized
    Error500 --> [*]: 500 Internal Server Error
```

## 10. State Diagram - Pod Yaşam Döngüsü (Kubernetes)

```mermaid
stateDiagram-v2
    [*] --> Pending: kubectl apply

    Pending --> ContainerCreating: Scheduler Atadı
    ContainerCreating --> InitContainers: Image Pulled
    
    InitContainers --> WaitingMySQL: wait-for-mysql
    WaitingMySQL --> InitContainers: MySQL Hazır
    InitContainers --> Running: Init Tamamlandı
    
    Running --> Ready: Readiness Probe OK
    Ready --> Running: Probe Failed
    
    Running --> CrashLoopBackOff: Container Crashed
    CrashLoopBackOff --> Running: Restart
    CrashLoopBackOff --> Failed: Max Retries
    
    Ready --> Terminating: Delete/Update
    Terminating --> [*]: Graceful Shutdown
    
    Failed --> [*]: Pod Removed
```
