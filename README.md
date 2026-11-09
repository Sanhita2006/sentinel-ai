<<<<<<< HEAD
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🛡️ SENTINEL AI
### AI-Powered Web Threat Detection & Digital Trust Intelligence

<p align="center">
  **Investigate. Detect. Understand. Protect.**
</p>

<p align="center">
  A cybersecurity intelligence platform designed to help users investigate suspicious websites, identify potential scams, and understand digital threats through evidence-based analysis.
</p>

<p align="center">
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)
</p>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Security Considerations](#-security-considerations)
- [Limitations](#-limitations)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 About the Project

**SENTINEL AI** is an AI-powered web threat detection and digital trust intelligence project developed to make cybersecurity investigation more accessible and understandable.

Suspicious URLs, phishing websites, fraudulent messages, and misleading online content can expose users to financial loss, identity theft, and privacy risks.

SENTINEL AI brings together website investigation capabilities, security analysis modules, and locally hosted AI assistance in one platform.

Instead of presenting only a simple safe-or-unsafe label, the project aims to make security findings easier to understand through risk assessment, technical evidence, and AI-generated explanations.

### 🎯 Our Mission

To make digital threat investigation more understandable, accessible, and evidence-driven.

---

## ⚠️ Problem Statement

Online users face several cybersecurity challenges:

- Phishing websites designed to imitate legitimate services.
- Fraudulent messages containing suspicious links or payment requests.
- Misconfigured websites and potentially insecure configurations.
- Difficulty understanding TLS certificates and domain security information.
- Threat intelligence scattered across different security sources.
- Security warnings that do not clearly explain the evidence behind them.

### 💡 Our Approach

SENTINEL AI combines multiple investigation and analysis components into a unified interface.

The goal is to help users move from a suspicious URL or message to a more informed security assessment.

---

## ✨ Key Features

### 1. 🌐 Website Investigation

Investigate submitted URLs and collect security-related information.

The backend investigation engine includes:

- URL parsing and normalization.
- URL validation.
- SSRF protection checks.
- DNS resolution and DNS record analysis.
- Heuristic-based suspicious URL detection.
- Threat intelligence feed integration.
- Evidence-based risk scoring.

The investigation engine is designed to combine multiple signals instead of relying on a single indicator.

### 2. 🎣 Phishing Detection

The platform includes a phishing detection module intended to help identify suspicious websites and phishing-related indicators.

Potential investigation signals include:

- Suspicious URL patterns.
- Unusual domain structures.
- Potentially misleading URL characteristics.
- Security findings from the investigation engine.

A phishing assessment should be interpreted alongside its supporting evidence.

### 3. 💬 Scam Message Analysis

SENTINEL AI includes a Scam Message Analysis interface and backend analysis workflow.

Users can submit suspicious message content for analysis.

The analysis workflow is intended to help identify:

- Suspicious or potentially fraudulent language.
- Urgent payment-related requests.
- Requests for sensitive information.
- Suspicious links extracted from messages.
- Potential impersonation and social-engineering indicators.

The application uses a locally hosted Ollama model for AI-assisted analysis.

### 4. 🔐 TLS Certificate Intelligence

The project includes a TLS Certificate Analysis module in its interface.

This module is intended to present certificate-related trust information, helping users understand HTTPS and certificate security.

The completeness of certificate inspection depends on the implemented backend checks and available certificate data.

### 5. 🧠 AI-Powered Security Assistance

SENTINEL AI integrates local AI inference through Ollama.

The current configured model is:

**Qwen 3.5 4B**

The local Ollama service is configured using:

`http://127.0.0.1:11434`

AI assistance is intended to make technical security information easier to understand.

### 6. 📊 Risk Assessment & Explainable Evidence

The backend includes a risk-scoring component.

Relevant implementation modules include:

- `scoring.ts`
- `heuristics.ts`
- `parser.ts`
- `dns.ts`
- `threatFeeds.ts`

The objective is to combine technical signals into a structured assessment.

A risk score should be interpreted together with the findings and evidence that support it.

### 7. 🛡️ Security Assessment

The project includes a Security Assessment interface for presenting website security-related information.

Its actual coverage depends on the checks implemented and the evidence returned by the backend.

### 8. 📡 Threat Intelligence

The investigation backend includes a threat-feed integration component.

Threat intelligence can provide additional context when investigating suspicious domains and URLs.

Feed availability and coverage depend on the configured sources.

### 9. 📄 Reports & Investigation History

The application includes dedicated interface sections for reports and investigation history.

These sections are intended to help users review investigation information and navigate security findings.

### 10. ⛓️ Blockchain Verification Interface

SENTINEL AI includes a Blockchain Verification interface as part of its digital trust concept.

A cryptographic, tamper-evident report registry is a planned direction for strengthening report integrity.

The presence of this interface alone does not establish that an on-chain registry or independent transaction verification is operational.

---

## 🔄 How It Works

A typical investigation workflow is designed around the following stages:

```text
       USER INPUT
    URL / Domain / Message
             |
             v
     INPUT PROCESSING
   Parsing and Validation
             |
             v
    SECURITY INVESTIGATION
    +--------+---------+
    |        |         |
   DNS   Heuristics  Threat Feeds
    |        |         |
    +--------+---------+
             |
             v
       RISK ASSESSMENT
    Evidence & Risk Scoring
             |
             v
       AI ASSISTANCE
   Human-readable Explanation
             |
             v
       INVESTIGATION
           REPORT
```

The exact workflow varies depending on the selected analysis module.

---

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Application development |
| Vite | Frontend development and build tooling |
| Tailwind CSS | UI styling |
| Lucide React | Interface icons |
| Motion | UI animations |
| Node.js | Backend runtime |
| Express.js | REST API server |
| Ollama | Local AI inference |
| Qwen 3.5 4B | Configured local AI model |
| DNS modules | Domain and DNS investigation |
| Custom heuristics | Suspicious URL analysis |
| Threat feeds | Threat intelligence integration |

---

## 🏗️ System Architecture

SENTINEL AI follows a frontend-and-backend architecture.

### Frontend

The React application provides the user interface and investigation modules.

### Backend

The Express server handles API requests and connects the frontend with the investigation services.

### Investigation Engine

The backend investigation components handle:

- URL parsing.
- SSRF protection.
- DNS checks.
- Heuristic analysis.
- Threat feed integration.
- Risk scoring.

### Local AI Layer

Ollama provides local model inference for supported AI-assisted workflows.

### Architecture Overview

```text
+-----------------------------+
|       React Frontend        |
|                             |
| Dashboard / Investigation   |
| Scam Analysis / Security    |
+--------------+--------------+
               |
               v
+-----------------------------+
|       Express Backend       |
|                             |
| API Routes & Processing     |
+--------------+--------------+
               |
               v
+-----------------------------+
|    Investigation Engine     |
|                             |
| Parser / DNS / SSRF          |
| Heuristics / Threat Feeds   |
| Risk Scoring                |
+--------------+--------------+
               |
        +------+------+
        |             |
        v             v
+---------------+  +----------------+
| External      |  | Local Ollama   |
| Threat Feeds  |  | Qwen 3.5 4B   |
+---------------+  +----------------+
```

---

## 📁 Project Structure

```text
sentinel-ai/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── DemoNoticeModal.tsx
│   │   │   ├── InvestigationSearchBar.tsx
│   │   │   ├── SeverityBar.tsx
│   │   │   └── StatusBadge.tsx
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── data/
│   │   └── mockData.ts
│   │
│   ├── pages/
│   │   ├── AiSecurityAssistantPage.tsx
│   │   ├── BlockchainVerificationPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── InvestigationHistoryPage.tsx
│   │   ├── PhishingDetectionPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── ScamMessageAnalysisPage.tsx
│   │   ├── SecurityAssessmentPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ThreatIntelligencePage.tsx
│   │   ├── TlsCertificatePage.tsx
│   │   └── WebsiteInvestigationPage.tsx
│   │
│   ├── server/
│   │   ├── routes/
│   │   │   └── investigate.ts
│   │   ├── dns.ts
│   │   ├── geminiService.ts
│   │   ├── heuristics.ts
│   │   ├── parser.ts
│   │   ├── scoring.ts
│   │   ├── ssrf.ts
│   │   └── threatFeeds.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ Getting Started

Follow these instructions to run SENTINEL AI locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Ollama](https://ollama.com/)

You will also need a compatible local AI model.

### 1. Clone the Repository

```bash
git clone https://github.com/Sanhita2006/sentinel-ai.git
```

### 2. Open the Project

```bash
cd sentinel-ai
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Install the Local AI Model

Make sure Ollama is installed and running.

Pull the configured model:

```bash
ollama pull qwen3.5:4b
```

Verify that the model is available:

```bash
ollama list
```

### 5. Configure Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as a reference and configure the required variables.

Do not upload your actual `.env` file or API keys to GitHub.

### 6. Start the Application

```bash
npm run dev
```

Open the local application in your browser:

```text
http://localhost:3000
```

The Express server mounts the Vite development middleware and the backend API.

---

## 🔑 Environment Configuration

The application uses environment configuration for local services and optional integrations.

Example Ollama configuration:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3.5:4b
PORT=3000
```

Additional variables may be required depending on the enabled integrations.

Refer to `.env.example` and the relevant backend implementation before configuring optional API keys.

**Important:** Never commit real API keys, passwords, tokens, or private environment files.

---

## 🧪 Build & Validation

Build the frontend:

```bash
npm run build
```

Run TypeScript validation:

```bash
npm run lint
```

Start the development server:

```bash
npm run dev
```

For meaningful validation, test the application with both suspicious and benign inputs.

---

## 🔒 Security Considerations

Security is a core consideration in SENTINEL AI.

The backend includes an SSRF protection module and URL parsing/validation components.

Important security practices:

- Validate and normalize user-provided URLs.
- Apply SSRF protections before making outbound requests.
- Avoid exposing private environment variables.
- Treat external threat-feed data as untrusted input.
- Do not automatically trust HTTPS as proof that a website is legitimate.
- Treat AI-generated explanations as assistance, not definitive security verdicts.
- Use investigation evidence to support risk assessments.

### Responsible Usage

SENTINEL AI is intended for defensive security investigation, education, and awareness.

Only investigate systems and resources that you are authorized to assess.

---

## ⚖️ Limitations

SENTINEL AI is an evolving hackathon project.

- Threat intelligence coverage depends on configured feeds.
- AI output may be incomplete or incorrect.
- Local AI performance depends on available hardware and model resources.
- A low risk score does not guarantee that a website is safe.
- Not every security module necessarily performs a complete automated scan.
- TLS, blockchain, and other interface modules should be evaluated against their actual backend implementations before being treated as fully operational.
- The platform should not replace professional security audits.

---

## 🛣️ Future Improvements

Potential improvements include:

- Expanded phishing and malicious-domain intelligence.
- More comprehensive TLS certificate inspection.
- Additional threat intelligence providers.
- Improved scam and social-engineering detection.
- Better false-positive handling.
- Evidence timelines and investigation history.
- Downloadable, evidence-backed PDF reports.
- Tamper-evident report verification with a blockchain registry.
- More extensive automated security testing.
- Performance improvements and broader test coverage.

---

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your changes.
5. Submit a Pull Request describing the improvements.

Please avoid committing secrets, local environment files, or unnecessary generated files.

---

## 📜 License

This project is distributed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Project

**SENTINEL AI**

AI-Powered Web Threat Detection & Digital Trust Intelligence

GitHub Repository:  
https://github.com/Sanhita2006/sentinel-ai

---

<p align="center">
  **Built with a focus on safer, smarter, and more informed digital experiences.**
</p>

<p align="center">
  🛡️ Investigate Smart. Stay Alert. Build Digital Trust.
</p>

