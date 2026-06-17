# Linux Systemd-Dienst Installations- und Verwaltungshandbuch

Dieses Handbuch erklärt Schritt für Schritt, wie Sie die Node.js-API-Middleware-Anwendung und den Ollama-Dienst auf Ihrem Linux-Server als Hintergrunddienste (systemd) konfigurieren, sodass sie kontinuierlich laufen und beim Neustart des Servers automatisch gestartet werden.

---

## 1. Node.js-Middleware-Dienst (`ollama-proxy.service`)

Um sicherzustellen, dass Ihre Node.js-Anwendung auch nach dem Schließen des Terminals weiterläuft und bei Abstürzen automatisch neu startet, erstellen wir eine systemd-Dienstdatei.

### Schritt 1: Dienstdatei erstellen
Öffnen Sie eine neue Dienstdatei mit dem folgenden Befehl im Terminal des Servers:
```bash
sudo nano /etc/systemd/system/ollama-proxy.service
```

### Schritt 2: Konfiguration einfügen
Fügen Sie den folgenden Inhalt ein und passen Sie die Pfade und den Benutzer an Ihre Serverumgebung an:
```ini
[Unit]
Description=Ollama Express.js API Middleware Proxy
After=network.target ollama.service

[Service]
Type=simple
# Linux-Benutzer, unter dem die Anwendung ausgeführt wird (aus Sicherheitsgründen einen normalen Benutzer statt root wählen)
User=ubuntu
# Vollständiger Ordnerpfad Ihres Projekts auf dem Server (Beispiel: /home/ubuntu/LLMServer)
WorkingDirectory=/home/ubuntu/LLMServer
# Absoluter Pfad zur Node-Ausführungsdatei und Ihrer Hauptdatei
ExecStart=/usr/bin/node src/server.js
# Anwendung bei Absturz innerhalb von 5 Sekunden automatisch neu starten
Restart=on-failure
RestartSec=5
# Umgebungsvariablen
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
> [!IMPORTANT]
> - Ändern Sie den Wert von `User` in den Linux-Benutzernamen, unter dem sich das Projekt befindet (z. B. `ubuntu`, `debian`, `centos`).
> - Ändern Sie den Wert von `WorkingDirectory` in den absoluten Ordnerpfad des Projekts auf Ihrem Server.
> - Sie können den korrekten Pfad der Node.js-Ausführungsdatei auf Ihrem Server mit `which node` überprüfen.

### Schritt 3: Dienst aktivieren und starten
Laden Sie die Systemd-Daemon-Liste neu, aktivieren Sie den automatischen Start des Dienstes beim Systemstart und starten Sie ihn:
```bash
# Systemd-Daemon für den neuen Dienst neu laden
sudo systemctl daemon-reload

# Dienst für den Start beim Systemstart aktivieren
sudo systemctl enable ollama-proxy

# Dienst jetzt starten
sudo systemctl start ollama-proxy
```

---

## 2. Ollama-Dienst-Konfiguration (`ollama.service`)

Wenn sich Ihre mobile App direkt mit Ollama verbindet (ohne die Node.js-Middleware) oder wenn Sie anpassen möchten, wie Ollama im Netzwerk läuft, können Sie den eigenen systemd-Dienst von Ollama bearbeiten.

### Schritt 1: Dienst-Bearbeitungsmodus öffnen
Ollama wird bei der offiziellen Installation vorkonfiguriert als systemd-Dienst geliefert. Wir verwenden den Override-Mechanismus von systemd, um die Konfiguration sicher zu aktualisieren:
```bash
sudo systemctl edit ollama.service
```

### Schritt 2: Erforderliche Umgebungsvariablen hinzufügen
Fügen Sie die folgenden Zeilen im leeren Bereich oder zwischen den Zeilen `### Anything between here...` ein:
```ini
[Service]
# Ermöglicht Ollama, auf allen Netzwerkschnittstellen (0.0.0.0) statt nur auf localhost zu hören
Environment="OLLAMA_HOST=0.0.0.0"
# Erlaubt alle Origins, um CORS-Einschränkungen zu umgehen
Environment="OLLAMA_ORIGINS=*"
```
Speichern und schließen Sie den Editor (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Schritt 3: Dienst neu starten
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 3. Befehle zur Dienstverwaltung

Grundlegende systemd-Befehle zur Steuerung Ihres Dienstes:

| Aktion | Befehl |
| :--- | :--- |
| **Dienst starten** | `sudo systemctl start ollama-proxy` |
| **Dienst stoppen** | `sudo systemctl stop ollama-proxy` |
| **Dienst neu starten** | `sudo systemctl restart ollama-proxy` |
| **Status prüfen** | `sudo systemctl status ollama-proxy` |
| **Autostart deaktivieren** | `sudo systemctl disable ollama-proxy` |
| **Autostart aktivieren** | `sudo systemctl enable ollama-proxy` |

---

## 4. Protokollüberwachung und Fehlerbehebung

Sie können **journalctl** verwenden, um alle von Ihrem Dienst erzeugten Konsolenausgaben (`console.log`, `console.error`) in Echtzeit zu überwachen:

### Echtzeit-Protokollüberwachung:
So überwachen Sie die Konsolenausgaben in Echtzeit, während die Anwendung ausgeführt wird:
```bash
journalctl -u ollama-proxy.service -f
```

### Die letzten 100 Zeilen anzeigen:
```bash
journalctl -u ollama-proxy.service -n 100 --no-pager
```

### Nur Fehlerprotokolle filtern:
So filtern Sie nur die vom Dienst generierten Fehlerprotokolle:
```bash
journalctl -u ollama-proxy.service -p err --no-pager
```
