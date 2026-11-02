# Yayın rehberi — Cue Cam 1.0.0

Akşam sırayla izle. Her adımın sonunda ✅ kontrolü var. Takıldığın yerde durup `BACKLOG.md`'ye
not düş; Claude devam eder.

> ⚠️ **Önce bil:** 13 Kasım 2023'ten sonra açılmış **kişisel** Google Play geliştirici hesaplarında,
> üretime (herkese açık) yayın için önce **en az 12 test kullanıcısıyla 14 gün kesintisiz kapalı
> test** zorunlu. Yani bu akşam Play'de herkese açık yayın büyük ihtimalle olmaz; bu akşam **kapalı
> testi başlatırsın**, 14 gün sonra üretime başvurursun. (Hesabın şirket hesabıysa ya da eskiyse bu
> kural yok.)
>
> iOS için **Apple Developer Program** üyeliği (yıllık ücretli) gerekiyor (PRM-3'te ertelendi).
> Üyelik yoksa önce Android'i yap; iOS bölümü üyelik onaylanınca.

## 0. Hazırlık (bilgisayarda, bir kez)

```bash
git checkout main && git pull
npm ci
npx eas-cli@latest login
```

✅ `npx eas-cli whoami` → `ozkulfurkan`.

EAS ortam değişkenleri **production** ortamında da olmalı (yoksa yayın sürümü Sentry'ye rapor
göndermez):

```bash
npx eas-cli env:list --environment production
```

`EXPO_PUBLIC_SENTRY_DSN` (görünürlük: plain text/sensitive) ve `SENTRY_AUTH_TOKEN` (secret)
listede yoksa expo.dev → Proje → Environment variables → her birini düzenleyip **production**
kutusunu da işaretle.

## 1. Son kontrol — telefonda (preview APK)

```bash
npx eas-cli build -p android --profile preview
```

Kurup şunlara bak (yeni olanlar bu sprintte geldi):

1. Uygulamayı **sil** ve yeniden kur → yeni ikon, koyu açılış ekranı.
2. İlk açılışta 3 sayfalık tanıtım → son sayfada "Kamera ve mikrofona izin ver" → iki izin
   diyaloğu → Senaryolar ekranı.
3. Bir kayıt al → galeride "Prompter" albümünde.
4. Ayarlar → Hakkında → "Gizlilik politikası" tarayıcıda açılıyor mu (Adım 2'den sonra).
5. Ayarlar → "Tanıtımı yeniden göster" çalışıyor mu.
6. `docs/test-matrix.md`'de kritik satırlar.

✅ Kritik hata yok. Varsa dur, `BUG-<no>` olarak yaz.

## 2. Gizlilik ve destek sayfasını yayına al (GitHub Pages)

1. Bu branch'in PR'ını `main`'e birleştir.
2. GitHub → `ozkulfurkan/cuecam` → **Settings → Pages** → Source: **Deploy from a branch** →
   Branch: `main`, klasör: **`/docs`** → Save.
3. 1–2 dk sonra aç: <https://ozkulfurkan.github.io/cuecam/privacy/> ve
   <https://ozkulfurkan.github.io/cuecam/support/>.
4. Sentry → cuecam → Settings → **Security & Privacy** → "Prevent Storing of IP Addresses" → aç.

✅ İki link de açılıyor.

## 3. Android — üretim derlemesi (AAB)

```bash
npx eas-cli build -p android --profile production
```

`versionCode` EAS'te otomatik artar; keystore zaten EAS'te (PRM-3). Bitince expo.dev'den `.aab`
dosyasını indir.

✅ Build "finished".

## 4. Play Console — uygulamayı oluştur

<https://play.google.com/console> → **Create app**:

- App name: `Cue Cam: Teleprompter Video` · Default language: English (United States) · App ·
  Free · beyanları işaretle.

Sonra soldaki menüde:

1. **Store presence → Main store listing**: `store/listings.json` → `en-US` → `play.title`,
   `play.shortDescription`, `description`. İkon: `store/graphics/play-icon-512.png`, öne çıkan
   görsel: `store/graphics/play-feature-graphic.png`, telefon ekran görüntüleri:
   `store/screenshots/en-US/play/` (en az 2; nasıl üretilir → `store/README.md`).
2. Aynı sayfada **Manage translations → Add → Turkish (tr-TR)** → `tr` bölümündeki metinler ve
   `store/screenshots/tr/play/`.
3. **Store settings**: kategori, iletişim → `store/play-console.md`.
4. **App content**: tüm bölümler → `store/play-console.md` ve `store/data-safety.md`.
   ⚠️ "Photo and video permissions" beyanını atlama.

✅ Dashboard'da "Set up your app" adımlarının hepsi yeşil.

## 5. Android — kapalı test (PRM-32)

**İlk yükleme elle yapılmak zorunda** (Google API ilk sürümü kabul etmiyor):

1. **Testing → Closed testing → Create track** (ya da hazır "Alpha") → **Testers**: bir e-posta
   listesi oluştur, en az **12 kişi** ekle (Gmail adresleri). Katılım linkini kopyala, onlara
   gönder.
2. **Create new release** → Play App Signing'i kabul et → Adım 3'teki `.aab` dosyasını yükle →
   Release name `1.0.0` → Release notes: `store/listings.json` → `whatsNew` (en-US ve tr) →
   **Review release → Start rollout to Closed testing**.
3. Google incelemesi birkaç saat–birkaç gün sürer. Test kullanıcıları linkten katılıp Play'den
   indirir.

Sonraki sürümler için elle yükleme gerekmez:

```bash
npx eas-cli build -p android --profile production --auto-submit-with-profile closed-test
```

Bunun için bir kez Google Play servis hesabı anahtarı gerekir: Play Console → **Setup → API
access** (veya Google Cloud → IAM → Service accounts → JSON key) → anahtarı indir →
`npx eas-cli credentials -p android` → production → "Google Service Account" → JSON'u yükle.
(JSON'u repoya koyma; `secrets/` zaten git-ignore'da.)

✅ Kapalı testte sürüm "Available to testers"; 12+ kişi katıldı. **14 gün** testi sürdür, kritik
hata çıkarsa düzelt ve yeni sürüm gönder.

## 6. Android — üretime gönderim (PRM-33)

14 gün dolunca: Dashboard → **Apply for production** (kısa anket: test nasıl geçti, ne
değiştirdin). Onay gelince:

- Ya Console'da kapalı testteki sürümü **Promote release → Production**,
- ya da yeni derlemeyle: `npx eas-cli build -p android --profile production --auto-submit-with-profile store`
  → Console'da taslağı açıp **Countries/regions** seç → Start rollout.

✅ "In review" → "Published".

## 7. iOS (Apple Developer üyeliği gelince)

1. <https://developer.apple.com> üyelik aktif → App Store Connect → **My Apps → +** → New App:
   iOS, ad `Cue Cam: Teleprompter Video`, primary language English (U.S.), bundle ID
   `com.ozkulfurkan.cuecam` (yoksa EAS ilk build'de oluşturur), SKU `cuecam`.
2. Derle ve TestFlight'a gönder (sertifika/profil EAS ayarlar, Apple girişini sorar):

   ```bash
   npx eas-cli build -p ios --profile production --auto-submit
   ```

3. **TestFlight** → Internal testing → kendini ekle → iPhone'da TestFlight'tan kur → Adım 1'deki
   kontroller + `docs/test-matrix.md` iOS sütunu (PRM-32).
4. App Store Connect → uygulama:
   - **App Information**: Subtitle, Category **Photo & Video** (ikincil: Productivity), Privacy
     Policy URL, Turkish yerelleştirmesi ekle.
   - **App Privacy** → `store/privacy-labels.md`.
   - **1.0 Prepare for Submission** (EN ve TR): ekran görüntüleri `store/screenshots/*/app-store/`
     (6.9" sekmesi), Promotional Text, Description, Keywords, Support URL
     `https://ozkulfurkan.github.io/cuecam/support/`, Build → TestFlight build'i seç.
   - **Age Rating**: hepsi "None/No" → 4+.
   - **App Review Information**: giriş gerekmez; not: "Camera and microphone are needed to
     record. No account."
   - Şifreleme sorusu çıkmaz (`ITSAppUsesNonExemptEncryption: false`).
5. **Add for Review → Submit** (PRM-33).

✅ "Waiting for Review" → "Ready for Sale".

## Sürüm güncelleme (sonraki sürümler)

1. `app.config.ts` → `version` (ör. `1.0.1`); build numaraları EAS'te kendiliğinden artar.
2. `store/listings.json` → `whatsNew`.
3. Adım 3/5 (Android) ve 7.2 (iOS) komutları.
