# UML Diyagramları

Mikroservis Projesi için kapsamlı UML diyagramları.

## Teknoloji Stack

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

---

## Diyagram İndeksi

| # | Dosya | Tür | Açıklama |
|---|-------|-----|----------|
| 1 | [01-system-architecture.md](./01-system-architecture.md) | Component | Sistem mimarisi |
| 2 | [02-use-case.md](./02-use-case.md) | Use Case | Temel use case |
| 3 | [02-use-case-comprehensive.md](./02-use-case-comprehensive.md) | Use Case | **Kapsamlı use case** |
| 4 | [03-kubernetes-deployment.md](./03-kubernetes-deployment.md) | Deployment | K8s pod dağılımı |
| 5 | [04-sequence-login.md](./04-sequence-login.md) | Sequence | Login akışı (basit) |
| 6 | [05-cicd-pipeline.md](./05-cicd-pipeline.md) | Activity | CI/CD pipeline |
| 7 | [06-state-user-session.md](./06-state-user-session.md) | State | Oturum durumları |
| 8 | [07-state-user-lifecycle.md](./07-state-user-lifecycle.md) | State | Hesap yaşam döngüsü |
| 9 | [08-state-api-request.md](./08-state-api-request.md) | State | API request akışı |
| 10 | [09-state-pod-lifecycle.md](./09-state-pod-lifecycle.md) | State | Pod yaşam döngüsü |
| 11 | [10-class-diagram.md](./10-class-diagram.md) | **Class** | Sınıf diyagramları |
| 12 | [11-object-diagram.md](./11-object-diagram.md) | **Object** | Nesne diyagramları |
| 13 | [12-sequence-diagrams.md](./12-sequence-diagrams.md) | **Sequence** | Detaylı sequence'lar |

---

## Diyagram Türleri Özeti

### Structural Diagrams (Yapısal)
- **Class Diagram** - Sınıflar ve ilişkileri
- **Object Diagram** - Runtime nesneleri
- **Component Diagram** - Sistem bileşenleri

### Behavioral Diagrams (Davranışsal)
- **Use Case Diagram** - Aktör-sistem etkileşimi
- **Sequence Diagram** - Mesaj akışları
- **State Diagram** - Durum geçişleri
- **Activity Diagram** - İş akışları (CI/CD)

---

## Görüntüleme

Bu diyagramlar **Mermaid** formatındadır ve şu yollarla görüntülenebilir:

1. **GitHub** - Otomatik render eder
2. **VS Code** - Markdown Preview Enhanced eklentisi
3. **Online** - [mermaid.live](https://mermaid.live)
