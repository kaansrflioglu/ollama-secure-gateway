# Guia de Instalação e Gerenciamento de Serviços Systemd no Linux

Este guia explica passo a passo como configurar a aplicação Node.js API Middleware e o serviço Ollama no seu servidor Linux como serviços em segundo plano (systemd) para que funcionem continuamente e iniciem automaticamente quando o servidor reiniciar.

---

## 1. Serviço Middleware Node.js (`ollama-proxy.service`)

Para garantir que a sua aplicação Node.js continue rodando mesmo após o fechamento do terminal e reinicie automaticamente se falhar, criaremos um arquivo de serviço systemd.

### Passo 1: Criar o Arquivo de Serviço
Abra um novo arquivo de serviço executando o seguinte comando no terminal do servidor:
```bash
sudo nano /etc/systemd/system/ollama-proxy.service
```

### Passo 2: Colar a Configuração
Cole o seguinte conteúdo, atualizando os caminhos e o usuário para corresponderem ao ambiente do seu servidor:
```ini
[Unit]
Description=Ollama Express.js API Middleware Proxy
After=network.target ollama.service

[Service]
Type=simple
# Usuário Linux sob o qual a aplicação rodará (use um usuário comum em vez de root por segurança)
User=ubuntu
# Caminho completo do diretório do seu projeto no servidor (Exemplo: /home/ubuntu/LLMServer)
WorkingDirectory=/home/ubuntu/LLMServer
# Caminho absoluto para o executável do node e para o seu arquivo principal
ExecStart=/usr/bin/node src/server.js
# Reinicia automaticamente a aplicação em até 5 segundos caso ela falhe
Restart=on-failure
RestartSec=5
# Variáveis de ambiente
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
> [!IMPORTANT]
> - Altere o valor de `User` para o nome de usuário Linux correspondente onde o projeto está localizado (por exemplo, `ubuntu`, `debian`, `centos`).
> - Altere o valor de `WorkingDirectory` para o caminho absoluto do diretório do projeto no seu servidor.
> - Verifique o caminho correto do executável do Node.js rodando o comando `which node` no servidor.

### Passo 3: Habilitar e Iniciar o Serviço
Recarregue a lista de daemons do sistema, habilite o serviço para iniciar automaticamente com o sistema e inicie a execução:
```bash
# Recarregar o daemon systemd para o novo serviço
sudo systemctl daemon-reload

# Habilitar o serviço para iniciar no boot
sudo systemctl enable ollama-proxy

# Iniciar o serviço agora
sudo systemctl start ollama-proxy
```

---

## 2. Configuração do Serviço Ollama (`ollama.service`)

Caso seu aplicativo móvel se conecte diretamente ao Ollama (sem o middleware Node.js) ou queira personalizar como o Ollama roda na rede, você pode editar o próprio serviço systemd do Ollama.

### Passo 1: Abrir o Modo de Edição do Serviço
O Ollama já vem configurado como um serviço systemd quando é instalado oficialmente. Usamos o mecanismo de sobreposição (override) do systemd para atualizar a configuração com segurança:
```bash
sudo systemctl edit ollama.service
```

### Passo 2: Adicionar as Variáveis de Ambiente Necessárias
Adicione as seguintes linhas no espaço em branco ou entre as linhas `### Anything between here...`:
```ini
[Service]
# Permite que o Ollama escute em todas as interfaces de rede (0.0.0.0) em vez de apenas localhost
Environment="OLLAMA_HOST=0.0.0.0"
# Permite todas as origens para ignorar as restrições CORS
Environment="OLLAMA_ORIGINS=*"
```
Salve e feche o editor (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Passo 3: Reiniciar o Serviço
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 3. Comandos de Gerenciamento do Serviço

Comandos básicos do systemd que você pode usar para controlar o serviço:

| Ação | Comando |
| :--- | :--- |
| **Iniciar Serviço** | `sudo systemctl start ollama-proxy` |
| **Parar Serviço** | `sudo systemctl stop ollama-proxy` |
| **Reiniciar Serviço** | `sudo systemctl restart ollama-proxy` |
| **Verificar Status** | `sudo systemctl status ollama-proxy` |
| **Desabilitar Inicialização Automática** | `sudo systemctl disable ollama-proxy` |
| **Habilitar Inicialização Automática** | `sudo systemctl enable ollama-proxy` |

---

## 4. Monitoramento de Logs e Depuração

Você pode usar o **journalctl** para monitorar em tempo real todas as saídas de console (`console.log`, `console.error`) geradas pelo seu serviço:

### Acompanhamento de Logs em Tempo Real:
Para assistir às saídas do console em tempo real enquanto a aplicação está rodando:
```bash
journalctl -u ollama-proxy.service -f
```

### Ver Últimas 100 Linhas:
```bash
journalctl -u ollama-proxy.service -n 100 --no-pager
```

### Filtrar Apenas Logs de Erro:
Para visualizar apenas os logs com nível de erro gerados pelo serviço:
```bash
journalctl -u ollama-proxy.service -p err --no-pager
```
