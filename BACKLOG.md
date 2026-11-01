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
- [x] **PRM-2** Development build — CİHAZ, FURKAN
  - Kabul: expo-dev-client kurulu; `app.config.ts` hazır; uygulama Android telefonda açılıyor.
  - Furkan'dan: uygulama adı, paket adı (ör. `com.termoland.prompter`).
  - Durum: ad `Cue Cam`, paket `com.ozkulfurkan.cuecam`; Android emülatörde (API 37) ve Furkan'ın telefonunda (EAS preview APK) açılıyor, 3 sekme görünüyor.
- [~] **PRM-3** EAS Build profilleri — CİHAZ, FURKAN
  - Kabul: `eas.json` (development, preview, production); Android preview APK telefona kuruluyor; iOS internal distribution.
  - Furkan'dan: `eas login`, gerekirse EXPO_TOKEN.
  - Durum: EAS projesi `@ozkulfurkan/cuecam`; Android keystore EAS'te.
  - ✅ Android: preview APK telefona kuruldu, bilgisayarsız açılıyor (Furkan doğruladı).
  - Ertelendi: iOS internal distribution — Apple Developer hesabı alınınca yapılacak; o zamana kadar madde `[~]` kalır.
- [x] **PRM-4** Navigasyon iskeleti — BULUT
  - Kabul: Senaryolar / Kayıt / Ayarlar sekmeleri; Kayıt tam ekran ayrı yığın; render testi geçiyor.
- [x] **PRM-5** Tasarım sistemi — BULUT, FURKAN
  - Kabul: `src/theme` (karanlık varsayılan + açık), Button/Card/IconButton/Slider/Screen; ekranlarda sabit renk/boyut yok.
  - Furkan'dan: 2 palet önerisinden birini seçmesi.
  - Seçim: Palet A · Sinema (amber vurgu). Arayüz metinleri şimdilik İngilizce (TR çeviri PRM-20).
- [x] **PRM-6** Çökme raporlama (Sentry) — CİHAZ, FURKAN
  - Kabul: Sentry yapılandırılmış, DSN ortam değişkeninden; dev modda "Test çökmesi" butonu; olay panelde görünüyor.
  - Furkan'dan: Sentry hesabı ve DSN.
  - Durum: org `ozkulfurkan`, proje `cuecam`; DSN ve token `.env` ve EAS ortam değişkenlerinde. Emülatörde test olayı gönderildi (event `b6e3355654a047debb86b88ea2fa03b4`).
  - ✅ Test olayı Sentry panelinde görüldü (Furkan doğruladı).

## Sprint 2 · Kamera ve kayıt (önkoşul: PRM-2)

- [~] **PRM-7** Kamera ve mikrofon izinleri — CİHAZ
  - Kabul: izin akışı; reddedilince ayarlara yönlendirme; iOS izin metinleri TR/EN.
  - Durum: VisionCamera 5 + Nitro; Kayıt ekranında izin kapısı. Android emülatörde (API 37) tam akış denendi: izin iste → kamera → mikrofon, ilk ret → tekrar sor, ikinci ret → "Open Settings" → izin verilip dönünce "Camera ready".
  - Cihazda nasıl test edilir (Android telefon, yeni APK gerekir):
    1. Uygulamayı kaldırıp yeni derlemeyi kur (izinler sıfırdan başlasın).
    2. Kayıt sekmesine bas → "Camera and microphone" ekranı → "Allow access".
    3. Önce kamera, sonra mikrofon izni sorulmalı; ikisine de izin ver → "Camera ready".
    4. Telefon Ayarlar → Uygulamalar → Cue Cam → İzinler'den mikrofonu kapat, uygulamaya dön → Kayıt → "Microphone access is off" + "Open Settings".
    5. "Open Settings" Cue Cam'in ayar sayfasını açmalı; mikrofonu aç, geri dön → ekran kendiliğinden "Camera ready" olmalı.
  - iOS: izin metinleri TR/EN `app.config.ts`'te; Apple hesabı gelince iPhone'da aynı adımlar (Türkçe telefonda Türkçe metin görünmeli).
- [~] **PRM-8** Kamera önizleme — CİHAZ
  - Kabul: tam ekran önizleme, ön/arka geçişi, 30 fps.
  - Durum: tam ekran önizleme, ön kamerayla başlar (aynalı), sağ üstte değiştirme düğmesi; oturum 30 fps kısıtıyla açılır. Kamera yalnızca ekran açık ve uygulama ön plandayken çalışır. Android emülatörde: ön ve arka 30 fps, arka plana alınca kamera kapanıyor, dönünce devam ediyor.
  - Cihazda nasıl test edilir (dev build veya yeni APK):
    1. Kayıt sekmesi → tam ekran ön kamera görüntüsü; görüntü ayna gibi olmalı (sağ elini kaldırınca ekranda sağda).
    2. Dev build'de alt ortada "30 fps · front" yazısı görünmeli.
    3. Sağ üstteki düğmeyle arka kameraya geç → "30 fps · back"; tekrar bas → ön kamera.
    4. Ana ekrana çık, 5 sn bekle, geri dön → görüntü donmadan devam etmeli; telefonda kamera göstergesi arka planda sönmüş olmalı.
    5. Sol üstteki X ile kapat → ana ekran.
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

- Gözlem (PRM-8, Android emülatör): Kayıt ekranında uygulama arka plandan dönünce gizli durum çubuğu yeniden görünüyor. PRM-16 (ekran yönü / tam ekran kaydı) kapsamında ele alınacak.
