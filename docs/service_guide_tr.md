# Linux Systemd Servisi Kurulum ve Yönetim Kılavuzu

Bu kılavuz, Linux sunucunuzda geliştirdiğimiz Node.js API Middleware uygulamasını ve Ollama servisini arka planda kesintisiz, sunucu yeniden başladığında otomatik olarak çalışacak birer **systemd** servisi olarak nasıl yapılandıracağınızı adım adım açıklamaktadır.

---

## 1. Node.js Middleware Servisi (`ollama-proxy.service`)

Node.js uygulamanızın terminal kapansa dahi çalışmaya devam etmesi ve hata aldığında otomatik olarak yeniden başlaması için bir systemd servis dosyası oluşturacağız.

### Adım 1: Servis Dosyasını Oluşturun
Terminalde aşağıdaki komutla yeni bir servis dosyası açın:
```bash
sudo nano /etc/systemd/system/ollama-proxy.service
```

### Adım 2: Konfigürasyonu Yapıştırın
Aşağıdaki içeriği kendinize göre düzenleyerek yapıştırın:
```ini
[Unit]
Description=Ollama Express.js API Middleware Proxy
After=network.target ollama.service

[Service]
Type=simple
# Uygulamanın çalışacağı Linux kullanıcısı (Güvenlik için root yerine normal kullanıcı seçin)
User=ubuntu
# Projenizin sunucudaki tam klasör yolu (Örnek: /var/www/LLMServer)
WorkingDirectory=/home/ubuntu/LLMServer
# Node.js çalıştırılabilir dosyasının ve ana dosyanızın yolu
ExecStart=/usr/bin/node src/server.js
# Uygulama çökerse 5 saniye içinde otomatik yeniden başlat
Restart=on-failure
RestartSec=5
# Çevre Değişkenleri
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
> [!IMPORTANT]
> - `User` kısmını projenin bulunduğu kullanıcının adı yapın (örn. `ubuntu`, `debian`, `centos`).
> - `WorkingDirectory` kısmını projenin sunucunuzdaki tam klasör yoluyla değiştirin.
> - `ExecStart` kısmında `/usr/bin/node` yolunun doğruluğunu `which node` komutu ile sunucunuzda doğrulayabilirsiniz.

### Adım 3: Servisi Aktifleştirin ve Başlatın
Sistem servis listesini güncelleyin, oluşturduğumuz servisi sistem açılışına ekleyin ve başlatın:
```bash
# Systemd daemon'ını yeni servis için yenileyin
sudo systemctl daemon-reload

# Servisin sunucu açıldığında otomatik başlamasını sağlayın
sudo systemctl enable ollama-proxy

# Servisi şimdi başlatın
sudo systemctl start ollama-proxy
```

---

## 2. Ollama Servisi Yapılandırması (`ollama.service`)

Eğer mobil uygulamanız doğrudan Ollama'ya erişecekse (arada Node.js olmadan) ya da Ollama'nın çalışma şeklini özelleştirmek istiyorsanız, Ollama'nın kendi servisini de düzenleyebilirsiniz.

### Adım 1: Servis Düzenleme Modunu Açın
Ollama resmi olarak kurulduğunda zaten bir systemd servisi olarak gelir. Bu servisi güvenle güncellemek için systemd'nin override mekanizmasını kullanırız:
```bash
sudo systemctl edit ollama.service
```

### Adım 2: Gerekli Çevre Değişkenlerini Ekleyin
Karşınıza gelen boş alana veya `### Anything between here...` satırlarının arasına şunları ekleyin:
```ini
[Service]
# Ollama'nın tüm ağlardan (0.0.0.0) istek kabul etmesini sağlar
Environment="OLLAMA_HOST=0.0.0.0"
# CORS engellerini aşmak için tüm origin'lere izin verir
Environment="OLLAMA_ORIGINS=*"
```
Dosyayı kaydedip kapatın (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Adım 3: Servisi Yeniden Başlatın
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 3. Servis Yönetim Komutları

Servisinizi yönetmek için kullanabileceğiniz temel systemd komutları:

| İşlem | Komut |
| :--- | :--- |
| **Servisi Başlat** | `sudo systemctl start ollama-proxy` |
| **Servisi Durdur** | `sudo systemctl stop ollama-proxy` |
| **Servisi Yeniden Başlat** | `sudo systemctl restart ollama-proxy` |
| **Durumunu Görüntüle** | `sudo systemctl status ollama-proxy` |
| **Açılışta Başlamasını Kapat** | `sudo systemctl disable ollama-proxy` |
| **Açılışta Başlamasını Aç** | `sudo systemctl enable ollama-proxy` |

---

## 4. Log İzleme ve Hata Ayıklama (Debugging)

Servisinizin ürettiği tüm konsol çıktılarını (`console.log`, `console.error`) gerçek zamanlı olarak izlemek için **journalctl** kullanabilirsiniz:

### Canlı Log Takibi:
Uygulama çalışırken terminale basılan çıktıları canlı (real-time) izlemek için:
```bash
journalctl -u ollama-proxy.service -f
```

### Son 100 Satırı Görme:
```bash
journalctl -u ollama-proxy.service -n 100 --no-pager
```

### Sadece Hataları Filtreleme:
Serviste oluşan hata loglarını görmek için:
```bash
journalctl -u ollama-proxy.service -p err --no-pager
```
