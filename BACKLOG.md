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
- [~] **PRM-9** Video ve ses kaydı — CİHAZ
  - Kabul: başlat/durdur, süre sayacı, 1080p, ses senkron.
  - Durum: alt ortada kayıt düğmesi, üstte kırmızı süre sayacı; video + ses aynı dosyaya (1080p hedef, 30 fps). Kayıt sürerken kamera değiştirme, Kapat ve geri tuşu kilitli. Dosya şimdilik uygulamanın geçici klasöründe (galeriye kaydetme PRM-10).
  - Emülatörde ölçülen: 19,9 sn kayıt; görüntü 19,88 sn / ses 19,90 sn (fark 20 ms), ~29 fps. Çözünürlük 720p ve ses AMR 8 kHz çıktı — emülatörün kayıt profilleri en fazla 720p ve yalnızca AMR tanımlıyor; 1080p ve AAC ses gerçek telefonda doğrulanmalı.
  - Cihazda nasıl test edilir (dev build veya yeni APK):
    1. Kayıt → kırmızı daireye bas → üstte 00:00'dan sayan kırmızı sayaç; düğme kareye döner, X ve kamera değiştirme gizlenir.
    2. Kayıt sürerken telefonun geri tuşu/hareketi ekranı kapatmamalı.
    3. Saniyeyi yüksek sesle sayarak ~20 sn konuş, kareye basıp durdur → dev build'de altta "Recorded 00:20 → …mp4" görünür.
    4. Galeriye kaydetme PRM-10'da geldiğinde: videoyu aç, dudak hareketi ile ses aynı anda olmalı; video bilgisinde 1080×1920 görünmeli, ses net (telefon kalitesi değil) olmalı.
    5. Arka arkaya 3 kısa kayıt al; her biri ayrı dosya olmalı, uygulama donmamalı.
- [~] **PRM-10** Galeriye kaydetme — CİHAZ
  - Kabul: video "Prompter" albümünde; eski Android, yeni Android ve iOS'ta çalışıyor.
  - Durum: kayıt bitince video "Prompter" albümüne kaydedilir (yoksa oluşturulur), sonra uygulamanın geçici kopyası silinir. Galeri izni ilk kayıt bitiminde istenir; reddedilirse mesaj + "Open Settings". İzinler yalnızca video için (Android 13+ READ_MEDIA_VIDEO; eski Android depolama izni; iOS fotoğraf arşivi, TR/EN metin).
  - Android emülatörde (API 37 = yeni Android) doğrulandı: izin penceresi → "Saved to the "Prompter" album"; 3 kayıt `Pictures/Prompter/` altında, geçici klasör boş.
  - Cihazda nasıl test edilir:
    1. Uygulamayı kaldırıp yeni APK'yı kur. Kayıt → kısa bir video çek → durdur.
    2. Galeri izni sorulmalı → "Allow all" → altta "Saved to the "Prompter" album".
    3. Telefonun Galeri/Fotoğraflar uygulamasında "Prompter" albümünü aç; video orada ve oynuyor olmalı. Videonun bilgilerinde 1080×1920 ve net ses olmalı (PRM-9 doğrulaması).
    4. İkinci bir video çek → aynı albüme eklenmeli (ikinci "Prompter" albümü oluşmamalı).
    5. Ayarlar → Uygulamalar → Cue Cam → İzinler → Fotoğraflar ve videolar → "İzin verme"; yeni kayıt → "Not saved…" mesajı + "Open Settings" düğmesi.
    6. Eski Android (9 veya altı) cihaz varsa aynı adımlar: izin penceresi "dosyalara erişim" olarak görünür.
    7. iOS: Apple hesabı gelince aynı adımlar; Fotoğraflar → Albümler → "Prompter".
- [!] **PRM-11** Ön kamera ayna ayarı — CİHAZ
  - Kabul: önizleme aynalı; kaydın aynalı olup olmayacağı seçilebiliyor.
  - Ertelendi (Furkan, 2026-11-02): seçenek şimdilik eklenmeyecek, ihtiyaç olursa sonra. Karar: kayıt aynasız olmalı (önizleme aynalı kalır).
  - Şu anki durum: önizleme ön kamerada aynalı (`mirrorMode="auto"`). Kaydedilen dosyanın aynalı olup olmadığı telefonda kontrol edilmeli: üzerinde yazı olan bir şeyle ön kamerada çek, galeride yazı düz okunuyor mu?
  - Uygulama notu: VisionCamera'nın `Camera` bileşeni tek bir `mirrorMode`'u önizleme ve kayda birlikte uygular. Aynasız kayıt + aynalı önizleme için kamera `mirrorMode="off"` çalıştırılıp yalnızca önizleme görünümü yatayda çevrilebilir (Android'de `implementationMode="compatible"` gerekir).

## Sprint 3 · Prompter motoru (MVP)

- [~] **PRM-12** Akan yazı motoru — CİHAZ
  - Kabul: akış Reanimated ile UI thread'de; kamera ve kayıt açıkken takılma yok. Hız→piksel/sn hesabı saf fonksiyon + test.
  - Durum: `useFrameCallback` ile her karede UI thread'de ilerliyor (JS zamanlayıcısı yok); hız seviyesi satır/sn'ye bağlı (yazı büyüyünce aynı okuma temposu). `pixelsPerSecond`, `advanceOffset`, `maxScrollOffset` saf ve testli. Metin şimdilik örnek senaryo (PRM-17'ye kadar).
  - Emülatörde: kayıt + kamera açıkken akış sürekli; hız 8'de ~1 satır/sn ölçüldü. Bulunan ve düzeltilen iki hata: worklet olmayan fonksiyon çağrısı (çökme) ve metin yüksekliğinin kutuya sıkışması (akış duruyordu).
  - Cihazda nasıl test edilir:
    1. Kayıt → kırmızı düğme → 3-2-1 → metin akmaya başlamalı.
    2. 1 dakika boyunca akışı izle: takılma, sıçrama, titreme olmamalı (özellikle kayıt başladığı anda ve ilk saniyelerde).
    3. Kaydı galeride aç: prompter metni videoda görünmemeli.
- [~] **PRM-13** Hız ve yazı boyutu kontrolleri — BULUT
  - Kabul: kayıt sırasında kaydırıcıyla değişiyor; son değer MMKV'de hatırlanıyor.
  - Durum: altta "Speed 1–10" ve "Size 24–64" kaydırıcıları; kayıt sırasında da çalışıyor, değişiklik bir sonraki karede uygulanıyor. Değerler MMKV'de; uygulama kapatılıp açılınca geri geliyor (emülatörde doğrulandı, testli).
  - Not: Kod tarafı tamam; `[x]` yerine `[~]` çünkü kayıt sırasında kaydırıcının akışı takıltmadığı telefonda görülmeli.
- [~] **PRM-14** Lens altı yerleşim — CİHAZ
  - Kabul: yazı ekranın üstünde, kameraya yakın, dar sütun, yarı saydam zemin.
  - Durum: kutu üst düğme satırının hemen altında, ekran genişliğinin ~%72'si (240–420 dp), yüksekliğin ~%30'u, yarı saydam siyah zemin. Yerleşim hesabı saf fonksiyon + test.
  - Cihazda: kayıtta metne bakarken çekilen videoda gözler kameraya bakıyor gibi görünmeli; çentikli/delikli ekranda kutu ön kameranın altında kalmalı.
- [x] **PRM-15** Geri sayım ve dokununca duraklat — BULUT
  - Kabul: 3-2-1 sonrası kayıt ve akış birlikte başlıyor; dokunma akışı durduruyor.
  - Durum: kayıt düğmesi 3-2-1 sayar (sırasında düğmeyle iptal edilebilir), sonra kayıt başlar; metin yalnızca kayıt gerçekten başladığında akar. Metne dokunmak akışı duraklatır/sürdürür ("Paused · tap the text to continue"), kayıt devam eder. Testli ve emülatörde doğrulandı.
- [~] **PRM-16** Ekran yönü kilidi — CİHAZ
  - Kabul: yön kayıt başında sabit; video doğru yönde.
  - Karar (Furkan, 2026-11-02): dikey + yatay kayıt desteklenecek.
  - Durum: uygulama dikey; yalnız Kayıt ekranı telefonla döner. Geri sayım başladığı anda o anki yönde kilitlenir, kayıt bitince serbest kalır, ekran kapanınca uygulama dikeye döner. Video yönü ekrandan alınır (`orientationSource="interface"`). Yatayda yazı kutusu kameranın olduğu kenara, kontroller karşı tarafa geçer. Yön/kilit/yerleşim saf fonksiyonlar + testler.
  - Emülatörde: ana ekran döndürmede dikey kaldı; Kayıt yataya döndü (kamera solda → kutu solda); yatayda kayıt sırasında telefon dikeye çevrilince ekran yatay kaldı; dosya `orientation=270` (yatay oynatılır), dikey kayıtlar `orientation=0`.
  - Ayrıca: arka plandan dönünce görünen durum çubuğu artık Kayıt ekranında yeniden gizleniyor.
  - Cihazda nasıl test edilir:
    1. Telefonun otomatik döndürmesi açık olsun. Ana ekranda telefonu yan çevir → ekran dikey kalmalı.
    2. Kayıt'a gir, telefonu sola ve sağa yatır → ekran dönmeli; yazı kutusu her seferinde ön kameranın olduğu kenarda olmalı (kamera solda ise kutu solda).
    3. Yatayda kayda başla, kayıt sırasında telefonu dikey çevir → ekran yatay kalmalı. Durdur → ekran tekrar dönebilmeli.
    4. Galeride yatay videoyu aç: yatay ve DÜZ (baş aşağı değil) oynamalı. Aynısını telefonu diğer yöne yatırarak tekrarla.
    5. Dikey kayıt da dikey ve düz oynamalı.
    6. Kayıt ekranını X ile kapat → uygulama dikeye dönmeli.

## Sprint 4 · Senaryolar ve ayarlar

- [x] **PRM-17** Senaryo listesi ve editör — BULUT
  - Kabul: ekle, düzenle, sil, ara; başlık + metin.
  - Durum: Senaryolar sekmesi (arama, en son düzenlenen üstte, satırdan doğrudan kayıt); editör (başlık + metin, her tuşta kaydeder, silme onayı, boş bırakılan yeni senaryo atılır). Kayıt sekmesi en son kullanılan senaryoyu açar; senaryo yoksa örnek metin. Arama Türkçe/aksan duyarsız. Testli, emülatörde denendi.
- [x] **PRM-18** Yerel depolama — BULUT
  - Kabul: senaryolar ve ayarlar uygulama kapanınca kaybolmuyor (MMKV).
  - Durum: senaryolar `scripts.v1` anahtarında (bozuk veri uygulamayı çökertmez), son kullanılan senaryo, hız/boyut, kalite ve dil MMKV'de. Ekranlar ortak bir depoya abone; bir ekrandaki değişiklik diğerlerine anında yansır. Testli.
- [x] **PRM-19** Metin içe aktarma — BULUT
  - Kabul: panodan yapıştırma ve .txt seçme.
  - Durum: editörde "Yapıştır" (panodaki metni sona ekler; pano boşsa uyarı) ve ".txt içe aktar" (sona ekler; başlık boşsa dosya adından). Windows satır sonları/BOM temizlenir. Emülatörde .txt içe aktarma Türkçe karakterlerle denendi; yapıştırma telefonda denenmeli (emülatöre pano verisi gönderilemedi).
- [x] **PRM-20** Ayarlar ekranı — BULUT
  - Kabul: varsayılan hız, yazı boyutu, ayna, kalite (720p/1080p/4K), dil.
  - Durum: hız ve boyut (kayıt ekranıyla aynı değerler), kayıt kalitesi 720p/1080p/4K (kamera desteklemezse en yakını), dil Sistem/English/Türkçe (anında uygulanır, hatırlanır). Tüm arayüz TR/EN; eksik çeviri test ile yakalanır.
  - Ayna seçeneği yok: PRM-11 ertelendi.
- [x] **PRM-21** Okuma süresi tahmini — BULUT
  - Kabul: kelime sayısı ve hızdan tahmini süre; hesap fonksiyonu test edilmiş.
  - Durum: liste ve editörde "29 kelime · Hız 10 ile ~00:05". Hız 4 ≈ 150 kelime/dk, akış motoruyla aynı tanım. Testli.
- [~] **PRM-22** Kayıtlar ekranı — CİHAZ
  - Kabul: uygulamayla çekilen videolar listeleniyor, oynatılıyor, paylaşılıyor.
  - Durum: Kayıtlar sekmesi "Prompter" albümünü listeler (en yeni üstte, tarih + süre), her açılışta yenilenir; dokununca tam ekran oynatıcı (sistem kontrolleriyle), paylaş düğmesi sistem paylaşım menüsünü açar. Emülatörde: 8 kayıt listelendi, yatay video doğru yönde oynadı, paylaşım menüsü .mp4 ile açıldı.
  - Not: expo-media-library dokümanı süreyi "saniye" diyor ama iki platform da milisaniye döndürüyor; kaynak koddan doğrulandı ve buna göre çevriliyor.
  - Cihazda nasıl test edilir:
    1. Birkaç kısa video çek, Kayıtlar sekmesine geç → en yeni üstte, süreleri doğru olmalı.
    2. Bir kayda dokun → tam ekran oynamalı, ses gelmeli; X ile kapan.
    3. Paylaş → WhatsApp/Drive gibi bir uygulamaya gönder; video karşı tarafta oynamalı.
    4. Galeri iznini kapatıp Kayıtlar'a gel → "İzin ver" düğmesi çıkmalı.

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

- Gözlem (PRM-8, Android emülatör): Kayıt ekranında uygulama arka plandan dönünce gizli durum çubuğu yeniden görünüyor. → PRM-16'da düzeltildi (öne gelince yeniden gizleniyor); telefonda doğrulanmalı.
