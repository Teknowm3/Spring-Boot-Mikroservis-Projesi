# Object Diagram

Çalışma zamanında nesnelerin durumunu gösteren diyagram.

## Senaryo: Admin Kullanıcı Login Sonrası

```mermaid
graph TB
    subgraph "Auth Service Objects"
        user1["user1: User<br/>---<br/>id = 1<br/>username = 'admin'<br/>password = '$2a...(hashed)'<br/>email = 'admin@admin.local'<br/>role = ADMIN"]
        
        authService1["authService: AuthService<br/>---<br/>userRepository = repo<br/>passwordEncoder = bcrypt<br/>jwtUtil = jwtUtil"]
        
        jwtUtil1["jwtUtil: JwtUtil<br/>---<br/>secret = 'yazilim...'<br/>expiration = 86400000"]
        
        authResponse1["response: AuthResponse<br/>---<br/>token = 'eyJhbG...'<br/>username = 'admin'<br/>role = 'ADMIN'<br/>message = 'Login successful'"]
    end

    subgraph "User Service Objects"
        userProfile1["userProfile1: UserProfile<br/>---<br/>id = 1<br/>username = 'admin'<br/>email = 'admin@admin.local'<br/>role = 'ADMIN'<br/>firstName = null<br/>lastName = null<br/>createdAt = 2025-12-28T15:00:00"]
    end

    subgraph "API Gateway Objects"
        jwtFilter["filter: JwtAuthFilter<br/>---<br/>jwtUtil = jwtUtil<br/>validToken = true"]
        
        rateLimiter["limiter: RateLimiter<br/>---<br/>maxRequests = 5<br/>windowSeconds = 60<br/>currentCount = 1"]
    end

    authService1 --> user1 : loads
    authService1 --> jwtUtil1 : uses
    authService1 --> authResponse1 : creates
    jwtFilter --> jwtUtil1 : validates with
```

## Senaryo: Normal Kullanıcı Kayıt Sonrası

```mermaid
graph TB
    subgraph "Auth Service Objects"
        newUser["newUser: User<br/>---<br/>id = 5<br/>username = 'john_doe'<br/>password = '$2a...(hashed)'<br/>email = 'john@email.com'<br/>role = USER"]
        
        registerReq["request: RegisterRequest<br/>---<br/>username = 'john_doe'<br/>email = 'john@email.com'<br/>password = 'secret123'"]
    end

    subgraph "User Service Objects"
        newProfile["newProfile: UserProfile<br/>---<br/>id = 5<br/>username = 'john_doe'<br/>email = 'john@email.com'<br/>role = 'USER'<br/>firstName = null<br/>lastName = null<br/>phone = null<br/>address = null<br/>createdAt = 2025-12-28T18:30:00<br/>updatedAt = 2025-12-28T18:30:00"]
    end

    subgraph "Database Objects"
        authDb["authdb: Database<br/>---<br/>tables = [users]<br/>connection = active"]
        
        userDb["userdb: Database<br/>---<br/>tables = [user_profiles]<br/>connection = active"]
    end

    registerReq --> newUser : creates
    newUser --> authDb : persisted to
    newProfile --> userDb : persisted to
```

## Senaryo: Kubernetes Pod Durumu

```mermaid
graph TB
    subgraph "Worker-1 Pod Objects"
        promPod["prometheus-pod: Pod<br/>---<br/>name = 'prometheus-xxx'<br/>namespace = 'mikroservis'<br/>status = Running<br/>restarts = 0<br/>node = 'k8s-worker-1'"]
        
        grafanaPod["grafana-pod: Pod<br/>---<br/>name = 'grafana-xxx'<br/>namespace = 'mikroservis'<br/>status = Running<br/>restarts = 0<br/>node = 'k8s-worker-1'"]
    end

    subgraph "Worker-2 Pod Objects"
        mysqlPod["mysql-pod: Pod<br/>---<br/>name = 'mysql-xxx'<br/>namespace = 'mikroservis'<br/>status = Running<br/>restarts = 0<br/>node = 'k8s-worker-2'"]
        
        authPod["auth-pod: Pod<br/>---<br/>name = 'auth-service-xxx'<br/>namespace = 'mikroservis'<br/>status = Running<br/>restarts = 0<br/>ready = 1/1"]
    end

    subgraph "Worker-3 Pod Objects"
        gatewayPod["gateway-pod: Pod<br/>---<br/>name = 'api-gateway-xxx'<br/>namespace = 'mikroservis'<br/>status = Running<br/>endpoints = 192.168.69.211:8080"]
        
        frontendPod["frontend-pod: Pod<br/>---<br/>name = 'frontend-xxx'<br/>namespace = 'mikroservis'<br/>status = Running<br/>endpoints = 192.168.69.212:80"]
    end

    subgraph "Service Objects"
        gatewaySvc["gateway-svc: Service<br/>---<br/>type = LoadBalancer<br/>port = 8080<br/>nodePort = 31720<br/>clusterIP = 10.109.12.160"]
        
        frontendSvc["frontend-svc: Service<br/>---<br/>type = NodePort<br/>port = 80<br/>nodePort = 30080"]
    end

    gatewayPod --> gatewaySvc : exposes
    frontendPod --> frontendSvc : exposes
    authPod --> mysqlPod : connects to
```
