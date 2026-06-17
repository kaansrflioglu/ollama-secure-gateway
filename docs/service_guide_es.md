# Guía de Instalación y Gestión de Servicios Systemd en Linux

Esta guía explica paso a paso cómo configurar la aplicación Node.js API Middleware y el servicio Ollama en su servidor Linux como servicios en segundo plano (systemd) para que funcionen de forma continua y se inicien automáticamente cuando el servidor se reinicie.

---

## 1. Servicio Middleware de Node.js (`ollama-proxy.service`)

Para asegurar que su aplicación Node.js continúe ejecutándose incluso si la terminal está cerrada y se reinicie automáticamente si falla, crearemos un archivo de servicio systemd.

### Paso 1: Crear el Archivo de Servicio
Abra un nuevo archivo de servicio ejecutando el siguiente comando en la terminal del servidor:
```bash
sudo nano /etc/systemd/system/ollama-proxy.service
```

### Paso 2: Pegar la Configuración
Pegue el siguiente contenido, actualizando las rutas y el usuario para que coincidan con el entorno de su servidor:
```ini
[Unit]
Description=Ollama Express.js API Middleware Proxy
After=network.target ollama.service

[Service]
Type=simple
# Usuario de Linux bajo el cual se ejecutará la aplicación (use un usuario normal en lugar de root por seguridad)
User=ubuntu
# Ruta completa de la carpeta de su proyecto en el servidor (Ejemplo: /home/ubuntu/LLMServer)
WorkingDirectory=/home/ubuntu/LLMServer
# Ruta absoluta al ejecutable de node y a su archivo principal
ExecStart=/usr/bin/node src/server.js
# Reiniciar automáticamente la aplicación en 5 segundos si falla
Restart=on-failure
RestartSec=5
# Variables de entorno
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
> [!IMPORTANT]
> - Cambie el valor de `User` al nombre de usuario de Linux donde reside el proyecto (por ejemplo, `ubuntu`, `debian`, `centos`).
> - Cambie el valor de `WorkingDirectory` a la ruta absoluta de la carpeta del proyecto en su servidor.
> - Puede verificar la ruta correcta del ejecutable de Node.js en su servidor ejecutando `which node`.

### Paso 3: Habilitar e Iniciar el Servicio
Recargue la lista de demonios del sistema, habilite el servicio para que se inicie automáticamente en el arranque y comience a ejecutarlo:
```bash
# Recargar el demonio systemd para el nuevo servicio
sudo systemctl daemon-reload

# Habilitar el servicio para que se inicie en el arranque
sudo systemctl enable ollama-proxy

# Iniciar el servicio ahora
sudo systemctl start ollama-proxy
```

---

## 2. Configuración del Servicio Ollama (`ollama.service`)

Si su aplicación móvil se conectará directamente a Ollama (sin el middleware de Node.js) o si desea personalizar cómo se ejecuta Ollama en la red, puede editar el propio servicio systemd de Ollama.

### Paso 1: Abrir el Modo de Edición del Servicio
Ollama ya viene configurado como un servicio systemd cuando se instala oficialmente. Usamos el mecanismo de anulación (override) de systemd para actualizar su configuración de forma segura:
```bash
sudo systemctl edit ollama.service
```

### Paso 2: Agregar las Variables de Entorno Necesarias
Agregue las siguientes líneas en el espacio en blanco o entre las líneas `### Anything between here...`:
```ini
[Service]
# Permite que Ollama escuche en todas las interfaces de red (0.0.0.0) en lugar de solo localhost
Environment="OLLAMA_HOST=0.0.0.0"
# Permite todos los orígenes para omitir las restricciones de CORS
Environment="OLLAMA_ORIGINS=*"
```
Guarde y cierre el editor (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Paso 3: Reiniciar el Servicio
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 3. Comandos de Gestión del Servicio

Comandos básicos de systemd que puede usar para controlar su servicio:

| Acción | Comando |
| :--- | :--- |
| **Iniciar servicio** | `sudo systemctl start ollama-proxy` |
| **Detener servicio** | `sudo systemctl stop ollama-proxy` |
| **Reiniciar servicio** | `sudo systemctl restart ollama-proxy` |
| **Ver estado** | `sudo systemctl status ollama-proxy` |
| **Deshabilitar inicio automático** | `sudo systemctl disable ollama-proxy` |
| **Habilitar inicio automático** | `sudo systemctl enable ollama-proxy` |

---

## 4. Monitoreo de Logs y Depuración

Puede usar **journalctl** para monitorear en tiempo real todas las salidas de consola (`console.log`, `console.error`) producidas por su servicio:

### Seguimiento de Logs en Vivo:
Para ver las salidas de consola en tiempo real mientras se ejecuta la aplicación:
```bash
journalctl -u ollama-proxy.service -f
```

### Ver las Últimas 100 Líneas:
```bash
journalctl -u ollama-proxy.service -n 100 --no-pager
```

### Filtrar Solo Logs de Errores:
Para ver únicamente los logs de nivel de error generados por el servicio:
```bash
journalctl -u ollama-proxy.service -p err --no-pager
```
