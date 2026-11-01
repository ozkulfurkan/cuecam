# Backlog — Prompter

Claude bu dosyayı **yukarıdan aşağıya** işler. Sıra önemlidir; bir işin bağımlılığı bitmeden ona geçilmez.

## Durum işaretleri

- `[ ]` yapılacak
- `[~]` kod bitti, **cihazda test bekliyor** (Furkan doğrulayınca `[x]` olur)
- `[x]` bitti
- `[!]` engellendi — sebebi satırın altında yazılı

## Etiketler

- **BULUT** — tamamen bulutta/otomatik yapılabilir (typecheck + lint + test yeterli)
- **CİHAZ** — kod otomatik yazılabilir ama doğrulama gerçek telefonda; bitince `[~]` yapılır
- **FURKAN** — benden bilgi, hesap veya onay gerekir; sormadan ilerleme

---

## Sprint 1 · Altyapı

- [x] **PRM-1** Expo + TypeScript projesi — BULUT
  - Kabul: proje kurulu, ESLint/Prettier, `typecheck`/`lint`/`test` script'leri hatasız.
- [~] **PRM-2** Development build — CİHAZ, FURKAN
  - Kabul: expo-dev-client kurulu; `app.config.ts` hazır; uygulama Android telefonda açılıyor.
  - Furkan'dan: uygulama adı, paket adı (ör. `com.termoland.prompter`).
  - Durum: ad `Cue Cam`, paket `com.ozkulfurkan.cuecam`; Android emülatörde (API 37) açılıyor.
  - Cihazda nasıl test edilir:
    1. Telefonda USB hata ayıklamayı aç, kabloyla bağla; `adb devices` telefonu `device` olarak göstermeli.
    2. `npx expo run:android --device` → telefonu seç (ilk derleme birkaç dakika).
    3. Uygulama "Cue Cam" adıyla açılmalı: koyu splash → koyu ekranda "Cue Cam / Prompter".
    4. Metro'yu kapatıp `npm start` ile tekrar aç; uygulama yeniden bağlanabilmeli.
- [~] **PRM-3** EAS Build profilleri — CİHAZ, FURKAN
  - Kabul: `eas.json` (development, preview, production); Android preview APK telefona kuruluyor; iOS internal distribution.
  - Furkan'dan: `eas login`, gerekirse EXPO_TOKEN.
  - Durum: EAS projesi `@ozkulfurkan/cuecam`; Android keystore EAS'te; ilk preview derlemesi başlatıldı.
  - Ertelendi: iOS internal distribution — Apple Developer hesabı alınınca yapılacak.
  - Cihazda nasıl test edilir:
    1. https://expo.dev/accounts/ozkulfurkan/projects/cuecam/builds adresinde son "preview" Android derlemesini aç.
    2. Telefonda QR kodu okut veya "Install" bağlantısını aç, APK'yı indir.
    3. "Bilinmeyen kaynaklardan yükleme" izni sorulursa tarayıcıya izin ver, kur.
    4. Uygulama Metro olmadan kendi başına açılmalı: koyu ekranda "Cue Cam / Prompter".
- [x] **PRM-4** Navigasyon iskeleti — BULUT
  - Kabul: Senaryolar / Kayıt / Ayarlar sekmeleri; Kayıt tam ekran ayrı yığın; render testi geçiyor.
- [x] **PRM-5** Tasarım sistemi — BULUT, FURKAN
  - Kabul: `src/theme` (karanlık varsayılan + açık), Button/Card/IconButton/Slider/Screen; ekranlarda sabit renk/boyut yok.
  - Furkan'dan: 2 palet önerisinden birini seçmesi.
  - Seçim: Palet A · Sinema (amber vurgu). Arayüz metinleri şimdilik İngilizce (TR çeviri PRM-20).
- [ ] **PRM-6** Çökme raporlama (Sentry) — CİHAZ, FURKAN
  - Kabul: Sentry yapılandırılmış, DSN ortam değişkeninden; dev modda "Test çökmesi" butonu; olay panelde görünüyor.
  - Furkan'dan: Sentry hesabı ve DSN.

## Sprint 2 · Kamera ve kayıt (önkoşul: PRM-2)

- [ ] **PRM-7** Kamera ve mikrofon izinleri — CİHAZ
  - Kabul: izin akışı; reddedilince ayarlara yönlendirme; iOS izin metinleri TR/EN.
- [ ] **PRM-8** Kamera önizleme — CİHAZ
  - Kabul: tam ekran önizleme, ön/arka geçişi, 30 fps.
- [ ] **PRM-9** Video ve ses kaydı — CİHAZ
  - Kabul: başlat/durdur, süre sayacı, 1080p, ses senkron.
- [ ] **PRM-10** Galeriye kaydetme — CİHAZ
  - Kabul: video "Prompter" albümünde; eski Android, yeni Android ve iOS'ta çalışıyor.
- [ ] **PRM-11** Ön kamera ayna ayarı — CİHAZ
  - Kabul: önizleme aynalı; kaydın aynalı olup olmayacağı seçilebiliyor.

## Sprint 3 · Prompter motoru (MVP)

- [ ] **PRM-12** Akan yazı motoru — CİHAZ
  - Kabul: akış Reanimated ile UI thread'de; kamera ve kayıt açıkken takılma yok. Hız→piksel/sn hesabı saf fonksiyon + test.
- [ ] **PRM-13** Hız ve yazı boyutu kontrolleri — BULUT
  - Kabul: kayıt sırasında kaydırıcıyla değişiyor; son değer MMKV'de hatırlanıyor.
- [ ] **PRM-14** Lens altı yerleşim — CİHAZ
  - Kabul: yazı ekranın üstünde, kameraya yakın, dar sütun, yarı saydam zemin.
- [ ] **PRM-15** Geri sayım ve dokununca duraklat — BULUT
  - Kabul: 3-2-1 sonrası kayıt ve akış birlikte başlıyor; dokunma akışı durduruyor.
- [ ] **PRM-16** Ekran yönü kilidi — CİHAZ
  - Kabul: yön kayıt başında sabit; video doğru yönde.

## Sprint 4 · Senaryolar ve ayarlar

- [ ] **PRM-17** Senaryo listesi ve editör — BULUT
  - Kabul: ekle, düzenle, sil, ara; başlık + metin.
- [ ] **PRM-18** Yerel depolama — BULUT
  - Kabul: senaryolar ve ayarlar uygulama kapanınca kaybolmuyor (MMKV).
- [ ] **PRM-19** Metin içe aktarma — BULUT
  - Kabul: panodan yapıştırma ve .txt seçme.
- [ ] **PRM-20** Ayarlar ekranı — BULUT
  - Kabul: varsayılan hız, yazı boyutu, ayna, kalite (720p/1080p/4K), dil.
- [ ] **PRM-21** Okuma süresi tahmini — BULUT
  - Kabul: kelime sayısı ve hızdan tahmini süre; hesap fonksiyonu test edilmiş.
- [ ] **PRM-22** Kayıtlar ekranı — CİHAZ
  - Kabul: uygulamayla çekilen videolar listeleniyor, oynatılıyor, paylaşılıyor.

## Sprint 5 · Sağlamlık

- [ ] **PRM-23** Kesinti yönetimi — CİHAZ
  - Kabul: arama gelince / arka plana geçince kayıt güvenle duruyor, dosya bozulmuyor.
- [ ] **PRM-24** Depolama ve ısı uyarıları — CİHAZ
  - Kabul: kayıt öncesi boş alan kontrolü; az alanda ve ısınmada uyarı.
- [ ] **PRM-25** Bluetooth kumanda / klavye — CİHAZ
  - Kabul: boşluk duraklatır, oklar hızı değiştirir, kayıt uzaktan başlar.
- [ ] **PRM-26** Cihaz test matrisi — CİHAZ, FURKAN
  - Kabul: Samsung A, Xiaomi, eski Android, güncel iPhone, eski iPhone'da kayıt+kaydet akışı geçiyor; bulgular yeni PRM olarak bu dosyaya eklendi.
- [ ] **PRM-27** Uzun kayıt performansı — CİHAZ
  - Kabul: 10 dk kayıtta kare düşmesi ve ses kayması yok.

## Sprint 6 · Yayın

- [ ] **PRM-28** İkon, açılış ekranı, uygulama adı — BULUT, FURKAN
- [ ] **PRM-29** İlk açılış rehberi — BULUT
  - Kabul: 3 ekranlık tanıtım + izinlerin neden istendiği.
- [ ] **PRM-30** Gizlilik politikası ve veri formları — FURKAN
  - Kabul: yayında gizlilik sayfası; App Store gizlilik etiketleri ve Play "Veri güvenliği" formu dolu.
- [ ] **PRM-31** Mağaza listeleri — BULUT, FURKAN
  - Kabul: ekran görüntüleri, TR/EN açıklama, anahtar kelimeler (metinler `store/` klasöründe).
- [ ] **PRM-32** Kapalı test — CİHAZ, FURKAN
  - Kabul: TestFlight ve Play kapalı testi tamam, kritik hata yok.
- [ ] **PRM-33** Mağazalara gönderim — FURKAN
  - Kabul: EAS Submit ile iki mağazaya gönderildi.

---

## Notlar / bulgular

(Cihaz testinde çıkan hatalar buraya `BUG-<no>` olarak eklenir ve ilgili sprintin sonuna sıralanır.)
