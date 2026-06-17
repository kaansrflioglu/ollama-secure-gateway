# Ollama API Middleware Proxy

A secure and lightweight Node.js Express middleware proxy designed to connect mobile applications to an Ollama server running locally or on a remote Linux server. 

This proxy provides a security boundary between the public internet and your Ollama instance by introducing API Key authorization, rate limiting, and standard CORS policies.

---

## Key Features

- **API Key Authorization:** Restricts public access to Ollama by validating requests with a secure `X-API-Key` header.
- **Rate Limiting:** Prevents abuse, brute-force requests, and resource consumption by limiting requests per IP address.
- **Streaming Support (NDJSON):** Fully supports streaming responses (token-by-token) from Ollama models using Line-Delimited JSON (NDJSON), allowing real-time text rendering in mobile apps.
- **Security Headers:** Implements [Helmet](https://helmetjs.github.io/) to add secure HTTP headers and control web vulnerabilities.
- **CORS-ready:** Built-in CORS configurations to seamlessly connect with iOS, Android, and web clients.

---

## Project Structure

```text
├── src/
│   ├── controllers/
│   │   └── chatController.js  # Integrates Ollama SDK, handles chat, completion & models
│   ├── middlewares/
│   │   └── auth.js            # Key authorization middleware
│   ├── routes/
│   │   └── chat.js            # API Endpoint definitions
│   ├── app.js                 # App configuration (CORS, Rate Limiters, error handling)
│   └── server.js              # Server bootstrapper & shutdown handlers
├── .env.example               # Template for environment variables
├── .gitignore                 # Files excluded from git tracking
├── package.json               # Package info & scripts
└── README.md                  # Project documentation
```

---

## Getting Started

### 1. Prerequisites
Ensure you have [Node.js (v18+)](https://nodejs.org/) installed.

### 2. Installation
Install the project dependencies:
```bash
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env` and fill in your custom configurations:
```bash
cp .env.example .env
```
Open `.env` and set your configurations:
- `PORT`: The port where this middleware will run (default is `3000`).
- `OLLAMA_HOST`: The address of your Ollama server (default is `http://127.0.0.1:11434`).
- `API_KEY`: The secure authorization token. Your mobile app must send this exact key in its headers.

### 4. Running the Server
**For Development (with Auto-Reload):**
```bash
npm run dev
```
**For Production:**
```bash
npm start
```

---

## API Documentation

All API routes (except `/health`) require authorization. Pass your key in the request headers:
`X-API-Key: YOUR_API_KEY`

### 1. Health Check
* **Route:** `/health`
* **Method:** `GET`
* **Auth:** Not required
* **Description:** Check if the middleware proxy is up.

### 2. Chat Completions
* **Route:** `/api/chat`
* **Method:** `POST`
* **Auth:** Required
* **Body Example:**
  ```json
  {
    "model": "llama3",
    "messages": [
      { "role": "user", "content": "Explain quantum computing in one sentence." }
    ],
    "stream": false
  }
  ```

### 3. Prompt Generation
* **Route:** `/api/generate`
* **Method:** `POST`
* **Auth:** Required
* **Body Example:**
  ```json
  {
    "model": "llama3",
    "prompt": "Why is the sky blue?",
    "stream": true
  }
  ```
  *Note: When `stream` is `true`, the response will be streamed back in NDJSON format.*

### 4. List Models
* **Route:** `/api/models`
* **Method:** `GET`
* **Auth:** Required
* **Description:** Lists all LLM models currently downloaded to your Ollama server.

---

## Deployment & Systemd Service Configuration

To run this application continuously in the background on your Linux server and have it start automatically at boot, please follow the setup instructions for Systemd and Nginx in your preferred language:

- 🇬🇧 **[Systemd Service Setup Guide (English)](./docs/service_guide_en.md)**
- 🇹🇷 **[Systemd Servis Kurulum Kılavuzu (Turkish)](./docs/service_guide_tr.md)**
- 🇪🇸 **[Guía de Configuración del Servicio Systemd (Spanish)](./docs/service_guide_es.md)**
- 🇩🇪 **[Systemd-Dienst Installationshandbuch (German)](./docs/service_guide_de.md)**
- 🇫🇷 **[Guide d'Installation du Service Systemd (French)](./docs/service_guide_fr.md)**
- 🇮🇹 **[Guia di Configurazione del Servizio Systemd (Italian)](./docs/service_guide_it.md)**
- 🇵🇹 **[Guia de Configuração do Serviço Systemd (Portuguese)](./docs/service_guide_pt.md)**
- 🇷🇺 **[Руководство по настройке службы Systemd (Russian)](./docs/service_guide_ru.md)**
