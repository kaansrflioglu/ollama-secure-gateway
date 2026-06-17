# Guide d'Installation et de Gestion des Services Systemd sur Linux

Ce guide explique étape par étape comment configurer l'application Node.js API Middleware et le service Ollama sur votre serveur Linux en tant que services d'arrière-plan (systemd) afin qu'ils fonctionnent en continu et démarrent automatiquement lors du redémarrage du serveur.

---

## 1. Service Middleware Node.js (`ollama-proxy.service`)

Pour garantir que votre application Node.js continue de s'exécuter même si le terminal est fermé et redémarre automatiquement en cas de panne, nous allons créer un fichier de service systemd.

### Étape 1 : Créer le fichier de service
Ouvrez un nouveau fichier de service en exécutant la commande suivante dans le terminal du serveur :
```bash
sudo nano /etc/systemd/system/ollama-proxy.service
```

### Étape 2 : Coller la configuration
Collez le contenu suivant, en mettant à jour les chemins et l'utilisateur pour qu'ils correspondent à l'environnement de votre serveur :
```ini
[Unit]
Description=Ollama Express.js API Middleware Proxy
After=network.target ollama.service

[Service]
Type=simple
# Utilisateur Linux sous lequel l'application s'exécutera (utilisez un utilisateur normal plutôt que root par sécurité)
User=ubuntu
# Chemin complet du dossier de votre projet sur le serveur (Exemple : /home/ubuntu/LLMServer)
WorkingDirectory=/home/ubuntu/LLMServer
# Chemin absolu vers l'exécutable node et votre fichier principal
ExecStart=/usr/bin/node src/server.js
# Redémarrer automatiquement l'application dans les 5 secondes en cas de panne
Restart=on-failure
RestartSec=5
# Variables d'environnement
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
> [!IMPORTANT]
> - Remplacez la valeur de `User` par le nom d'utilisateur Linux où se trouve le projet (par exemple, `ubuntu`, `debian`, `centos`).
> - Remplacez la valeur de `WorkingDirectory` par le chemin absolu du dossier du projet sur votre serveur.
> - Vous pouvez vérifier le chemin correct de l'exécutable Node.js sur votre serveur en exécutant `which node`.

### Étape 3 : Activer et démarrer le service
Rechargez la liste des démons du système, activez le service pour qu'il démarre automatiquement au démarrage du système, et lancez-le :
```bash
# Recharger le démon systemd pour le nouveau service
sudo systemctl daemon-reload

# Activer le service pour qu'il démarre au démarrage
sudo systemctl enable ollama-proxy

# Démarrer le service maintenant
sudo systemctl start ollama-proxy
```

---

## 2. Configuration du service Ollama (`ollama.service`)

Si votre application mobile se connecte directement à Ollama (sans le middleware Node.js) ou si vous souhaitez personnaliser le fonctionnement d'Ollama sur le réseau, vous pouvez éditer le propre service systemd d'Ollama.

### Étape 1 : Ouvrir le mode d'édition du service
Ollama est déjà configuré comme un service systemd lorsqu'il est installé officiellement. Nous utilisons le mécanisme de surcharge (override) de systemd pour mettre à jour sa configuration en toute sécurité :
```bash
sudo systemctl edit ollama.service
```

### Étape 2 : Ajouter les variables d'environnement nécessaires
Ajoutez les lignes suivantes dans l'espace vide ou entre les lignes `### Anything between here...` :
```ini
[Service]
# Permet à Ollama d'écouter sur toutes les interfaces réseau (0.0.0.0) au lieu de localhost uniquement
Environment="OLLAMA_HOST=0.0.0.0"
# Autorise toutes les origines pour contourner les restrictions CORS
Environment="OLLAMA_ORIGINS=*"
```
Enregistrez et fermez l'éditeur (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Étape 3 : Redémarrer le service
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 3. Commandes de gestion du service

Commandes de base de systemd que vous pouvez utiliser pour contrôler votre service :

| Action | Commande |
| :--- | :--- |
| **Démarrer le service** | `sudo systemctl start ollama-proxy` |
| **Arrêter le service** | `sudo systemctl stop ollama-proxy` |
| **Redémarrer le service** | `sudo systemctl restart ollama-proxy` |
| **Vérifier le statut** | `sudo systemctl status ollama-proxy` |
| **Désactiver le démarrage auto** | `sudo systemctl disable ollama-proxy` |
| **Activer le démarrage auto** | `sudo systemctl enable ollama-proxy` |

---

## 4. Surveillance des logs et débogage

Vous pouvez utiliser **journalctl** pour surveiller en temps réel toutes les sorties de console (`console.log`, `console.error`) produites par votre service :

### Suivi des logs en temps réel :
Pour observer les sorties de console en temps réel pendant l'exécution de l'application :
```bash
journalctl -u ollama-proxy.service -f
```

### Voir les 100 dernières lignes :
```bash
journalctl -u ollama-proxy.service -n 100 --no-pager
```

### Filtrer uniquement les logs d'erreur :
Pour voir uniquement les logs de niveau d'erreur générés par le service :
```bash
journalctl -u ollama-proxy.service -p err --no-pager
```
