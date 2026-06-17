# Guida all'Installazione e Gestione del Servizio Systemd su Linux

Questa guida spiega passo dopo passo come configurare l'applicazione Node.js API Middleware e il servizio Ollama sul proprio server Linux come servizi in background (systemd) in modo che funzionino in modo continuo e si avviino automaticamente al riavvio del server.

---

## 1. Servizio Middleware Node.js (`ollama-proxy.service`)

Per garantire che l'applicazione Node.js continui a funzionare anche a terminale chiuso e si riavvii automaticamente in caso di arresto anomalo, creeremo un file di servizio systemd.

### Passo 1: Creare il file di servizio
Aprire un nuovo file di servizio eseguendo il seguente comando nel terminale del server:
```bash
sudo nano /etc/systemd/system/ollama-proxy.service
```

### Passo 2: Incollare la configurazione
Incollare il seguente contenuto, aggiornando i percorsi e l'utente per farli corrispondere all'ambiente del proprio server:
```ini
[Unit]
Description=Ollama Express.js API Middleware Proxy
After=network.target ollama.service

[Service]
Type=simple
# Utente Linux sotto il quale verrà eseguita l'applicazione (scegliere un utente normale invece di root per sicurezza)
User=ubuntu
# Percorso completo della cartella del progetto sul server (Esempio: /home/ubuntu/LLMServer)
WorkingDirectory=/home/ubuntu/LLMServer
# Percorso assoluto dell'eseguibile node e del file principale
ExecStart=/usr/bin/node src/server.js
# Riavvia automaticamente l'applicazione entro 5 secondi in caso di arresto anomalo
Restart=on-failure
RestartSec=5
# Variabili d'ambiente
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
> [!IMPORTANT]
> - Sostituire il valore di `User` con il nome utente Linux in cui si trova il progetto (ad esempio, `ubuntu`, `debian`, `centos`).
> - Sostituire il valore di `WorkingDirectory` con il percorso assoluto della cartella del progetto sul server.
> - È possibile verificare il percorso corretto dell'eseguibile Node.js eseguendo `which node` sul server.

### Passo 3: Abilitare e avviare il servizio
Ricaricare la lista dei demoni di sistema, abilitare il servizio per l'avvio automatico all'avvio del sistema e avviarlo:
```bash
# Ricaricare il demone systemd per il nuovo servizio
sudo systemctl daemon-reload

# Abilitare il servizio per l'avvio all'avvio del sistema
sudo systemctl enable ollama-proxy

# Avviare il servizio ora
sudo systemctl start ollama-proxy
```

---

## 2. Configurazione del servizio Ollama (`ollama.service`)

Se l'applicazione mobile si connetterà direttamente a Ollama (senza il middleware Node.js) o se si desidera personalizzare il funzionamento di Ollama sulla rete, è possibile modificare il servizio systemd di Ollama.

### Passo 1: Aprire la modalità di modifica del servizio
Ollama viene già configurato come servizio systemd quando viene installato ufficialmente. Utilizziamo il meccanismo di override di systemd per aggiornare la configurazione in modo sicuro:
```bash
sudo systemctl edit ollama.service
```

### Passo 2: Aggiungere le variabili d'ambiente necessarie
Aggiungere le seguenti righe nello spazio vuoto o tra le righe `### Anything between here...`:
```ini
[Service]
# Consente a Ollama di ascoltare su tutte le interfacce di rete (0.0.0.0) anziché solo su localhost
Environment="OLLAMA_HOST=0.0.0.0"
# Consente tutte le origini per aggirare le restrizioni CORS
Environment="OLLAMA_ORIGINS=*"
```
Salvare e chiudere l'editor (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Passo 3: Riavviare il servizio
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 3. Comandi di gestione del servizio

Comandi di base di systemd che è possibile utilizzare per controllare il servizio:

| Azione | Comando |
| :--- | :--- |
| **Avvia servizio** | `sudo systemctl start ollama-proxy` |
| **Arresta servizio** | `sudo systemctl stop ollama-proxy` |
| **Riavvia servizio** | `sudo systemctl restart ollama-proxy` |
| **Controlla stato** | `sudo systemctl status ollama-proxy` |
| **Disabilita avvio automatico** | `sudo systemctl disable ollama-proxy` |
| **Abilita avvio automatico** | `sudo systemctl enable ollama-proxy` |

---

## 4. Monitoraggio dei log e debug

È possibile utilizzare **journalctl** per monitorare in tempo reale tutti i messaggi stampati in console (`console.log`, `console.error`) dal proprio servizio:

### Tracciamento dei log in tempo reale:
Per guardare l'output della console in tempo reale mentre l'applicazione è in esecuzione:
```bash
journalctl -u ollama-proxy.service -f
```

### Vedi le ultime 100 righe:
```bash
journalctl -u ollama-proxy.service -n 100 --no-pager
```

### Filtra solo i log di errore:
Per visualizzare solo i log di livello errore generati dal servizio:
```bash
journalctl -u ollama-proxy.service -p err --no-pager
```
