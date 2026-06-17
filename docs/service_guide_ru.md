# Руководство по установке и управлению службой Systemd в Linux

Это руководство шаг за шагом объясняет, как настроить приложение Node.js API Middleware и службу Ollama на вашем сервере Linux в качестве фоновых служб (systemd), чтобы они работали непрерывно и запускались автоматически при перезагрузке сервера.

---

## 1. Служба Node.js Middleware (`ollama-proxy.service`)

Чтобы ваше приложение Node.js продолжало работать даже при закрытом терминале и автоматически перезапускалось при сбоях, мы создадим файл службы systemd.

### Шаг 1: Создание файла службы
Откройте новый файл службы, выполнив следующую команду в терминале сервера:
```bash
sudo nano /etc/systemd/system/ollama-proxy.service
```

### Шаг 2: Вставка конфигурации
Вставьте следующее содержимое, обновив пути и имя пользователя в соответствии с настройками вашего сервера:
```ini
[Unit]
Description=Ollama Express.js API Middleware Proxy
After=network.target ollama.service

[Service]
Type=simple
# Пользователь Linux, под которым будет запускаться приложение (из соображений безопасности выбирайте обычного пользователя вместо root)
User=ubuntu
# Полный путь к папке вашего проекта на сервере (Пример: /home/ubuntu/LLMServer)
WorkingDirectory=/home/ubuntu/LLMServer
# Абсолютный путь к исполняемому файлу node и вашему главному файлу
ExecStart=/usr/bin/node src/server.js
# Автоматический перезапуск приложения в течение 5 секунд в случае сбоя
Restart=on-failure
RestartSec=5
# Переменные окружения
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
> [!IMPORTANT]
> - Измените значение `User` на имя пользователя Linux, которому принадлежит проект (например, `ubuntu`, `debian`, `centos`).
> - Измените значение `WorkingDirectory` на абсолютный путь к папке проекта на вашем сервере.
> - Вы можете проверить правильность пути к исполняемому файлу Node.js на вашем сервере, запустив команду `which node`.

### Шаг 3: Включение и запуск службы
Перезагрузите список системных служб, добавьте службу в автозапуск при загрузке системы и запустите ее:
```bash
# Перезагрузить демон systemd для применения изменений новой службы
sudo systemctl daemon-reload

# Добавить службу в автозапуск при старте системы
sudo systemctl enable ollama-proxy

# Запустить службу прямо сейчас
sudo systemctl start ollama-proxy
```

---

## 2. Настройка службы Ollama (`ollama.service`)

Если ваше мобильное приложение будет подключаться к Ollama напрямую (без Node.js Middleware) или если вы хотите настроить работу Ollama в сети, вы можете изменить собственную службу systemd для Ollama.

### Шаг 1: Открытие режима редактирования службы
При официальной установке Ollama уже поставляется преднастроенной как служба systemd. Мы используем механизм переопределения (override) в systemd для безопасного обновления ее конфигурации:
```bash
sudo systemctl edit ollama.service
```

### Шаг 2: Добавление необходимых переменных окружения
Добавьте следующие строки в пустое поле или между строками `### Anything between here...`:
```ini
[Service]
# Позволяет Ollama прослушивать все сетевые интерфейсы (0.0.0.0) вместо только localhost
Environment="OLLAMA_HOST=0.0.0.0"
# Разрешает все источники (origins) для обхода ограничений CORS
Environment="OLLAMA_ORIGINS=*"
```
Сохраните изменения и закройте редактор (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Шаг 3: Перезапуск службы
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 3. Команды управления службой

Базовые команды systemd, которые вы можете использовать для управления вашей службой:

| Действие | Команда |
| :--- | :--- |
| **Запустить службу** | `sudo systemctl start ollama-proxy` |
| **Остановить службу** | `sudo systemctl stop ollama-proxy` |
| **Перезапустить службу** | `sudo systemctl restart ollama-proxy` |
| **Проверить статус** | `sudo systemctl status ollama-proxy` |
| **Отключить автозапуск** | `sudo systemctl disable ollama-proxy` |
| **Включить автозапуск** | `sudo systemctl enable ollama-proxy` |

---

## 4. Мониторинг логов и отладка

Вы можете использовать **journalctl** для отслеживания в реальном времени всех выводов консоли (`console.log`, `console.error`), генерируемых вашей службой:

### Отслеживание логов в реальном времени:
Для просмотра вывода консоли в реальном времени во время выполнения приложения:
```bash
journalctl -u ollama-proxy.service -f
```

### Просмотр последних 100 строк лога:
```bash
journalctl -u ollama-proxy.service -n 100 --no-pager
```

### Фильтрация только логов ошибок:
Чтобы увидеть только сообщения об ошибках, созданные службой:
```bash
journalctl -u ollama-proxy.service -p err --no-pager
```
