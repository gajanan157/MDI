# MD India Enrollment System — Java 21 Microservices

An enterprise event-driven microservices backend architecture for the **MD India Health Insurance TPA Corporate Enrollment System**, built with **Java 21**, **Spring Boot 3.3.4**, **PostgreSQL**, **Apache Kafka (KRaft)**, and **Apache APISIX API Gateway**.

---

## 🚀 Key Highlights

- **Java 21 Core**: Virtual Threads, Records, Pattern Matching, Sealed Classes.
- **Spring Boot 3.3.4**: High-throughput microservice architecture.
- **Maker-Checker Governance**: Strict separation between Enrolment Processor (Maker) and QC User (Checker).
- **The Hinge Lifecycle**: Policy approval triggers background member roster ingestion, card generation, and exception queues.
- **Member Ingestion & Validation**: Comprehensive Layer 3 rule evaluation (Primary member, Spouse, Child, Sibling, and Parent rules).
- **Reconciliation Engine**: Compares members between temporary Dummy policies and Live insurer policies.
- **Dynamic E-Card Generation**: Automated PDF generation with member identifiers and emergency support info.
- **APISIX API Gateway**: Reverse proxy matching all React 19 Axios client contracts (`src/app/api/apiService.ts`).

---

## 📦 Service Overview

| Service | Port | Description |
|---|---|---|
| `master-service` | `8081` | Insurers, Offices, Corporates, Groups, Brokers, Agents, Plan Types, User Groups |
| `inward-service` | `8082` | Inward registration, S3 document uploads, presigned URLs, PSU XML Parser |
| `policy-service` | `8083` | OCR work items (`/v1/ocr`), 5-tab draft processing, QC approval, policy search |
| `workflow-service` | `8084` | Workflow instances, user assignment transitions, stage count cards |
| `member-service` | `8085` | Member progress polling (`/v1/enrollment/progress`), failed records, exceptions, reconciliation |
| `ecard-service` | `8086` | E-card templates, customization, preview, and PDF generation |
| `tpa-service` | `8087` | TPA company, TPA branches, escalation matrix. Own database `tpa_db` |
| `insurer-service` | `8088` | Insurers, insurer offices and hierarchy, contact persons. Own database `insurer_db` |
| `provider-service` | `8089` | Providers (hospitals, clinics, labs), provider types, specialties, contact persons. Own database `provider_db` |
| `enrollment-ui` | `3000` | React 19 + Vite + Tailwind CSS + WebSocket Real-Time Frontend App |

---

## 💻 Frontend Application (`enrollment-ui`)

A modern **React 19 + Vite + Tailwind CSS** single-page application built for operations teams:

- **Role Switcher**: Live toggle between **Processor (Maker)**, **QC User (Checker)**, and **Admin**.
- **Real-Time WebSocket Notifications**: Connects to `ws://localhost:8084/ws/notifications` with auto-reconnection, floating toast alerts, and a flyout notification drawer.
- **Inward Intake**: Interactive registry, automated sequential Inward ID generation, and document upload dropzone.
- **Maker 5-Tab Entry**: Incremental drafting across *Insurer*, *Corporate*, *Policy Terms*, *Broker*, and *SPOC* tabs.
- **The Hinge Mechanism**: Side-by-side Maker-Checker verification; approval creates the policy and automatically routes straight into member processing.
- **Member Ingestion Hub**: Polling progress bar, clean roster viewer, validation errors, relational discrepancies, and Underwriting Exception approvals.
- **Dummy vs. Live Match**: Reconciliation diff report for joiners, leavers, and data variances.
- **Digital E-Card Center**: Interactive card visualizer and instant OpenPDF card download.

### Run Frontend Dev Server:
```powershell
.\start-ui.ps1
# or
cd enrollment-ui
npm run dev
```

---

## 🛠️ Build & Run

### 1. Build all microservices
```powershell
mvn clean package -DskipTests
```
Or execute:
```powershell
.\build.ps1
```

### 2. Run with Docker Compose
```bash
docker-compose up -d --build
```

### 3. Run individual services directly
To run any service locally:
```powershell
mvn spring-boot:run -pl master-service
mvn spring-boot:run -pl inward-service
mvn spring-boot:run -pl policy-service
mvn spring-boot:run -pl workflow-service
mvn spring-boot:run -pl member-service
mvn spring-boot:run -pl ecard-service
```

---

## 🧪 Automated End-to-End Verification

Run the test suite to execute the complete maker-checker, policy approval, member ingestion, and card issuance flow:

```powershell
.\test-system.ps1
```

For complete technical documentation, data models, and API tables, consult [ARCHITECTURE.md](ARCHITECTURE.md).

