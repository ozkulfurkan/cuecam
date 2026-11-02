# Google Play Console — "App content" ve kurulum cevapları

Play Console → Uygulama → **Policy and programs → App content**. Hepsi bir kez doldurulur.

| Bölüm | Cevap |
| --- | --- |
| **Privacy policy** | `https://ozkulfurkan.github.io/cuecam/privacy/` |
| **App access** | All functionality is available without special access (giriş yok) |
| **Ads** | No, my app does not contain ads |
| **Content rating** | Aşağıdaki IARC cevapları → beklenen sonuç: **PEGI 3 / Everyone / 3+** |
| **Target audience and content** | Yaş grupları: **13–15, 16–17, 18+** · "Could your app unintentionally appeal to children?" → **No** (13 altı seçilmez → Aileler politikası devreye girmez) |
| **News app** | No |
| **COVID-19 contact tracing** | My app is not a publicly available COVID-19 app |
| **Data safety** | `store/data-safety.md` |
| **Government app** | No |
| **Financial features** | My app doesn't provide any financial features |
| **Health** | My app does not have any health features |
| **Photo and video permissions** | Aşağıya bak ⚠️ |

## Content rating (IARC) anketi

- E-posta: Play hesabının e-postası
- Kategori: **All Other App Types** (Utility, Productivity, Communication, or Other)
- Violence / Sexuality / Language / Controlled substances / Gambling: hepsi **No**
- "Does the app allow users to interact or exchange content with other users?" → **No**
  (Paylaş düğmesi sistem paylaşım menüsünü açar; uygulama içinde kullanıcılar arası iletişim yok.)
- "Does the app share the user's current physical location?" → **No**
- "Does the app allow users to purchase digital goods?" → **No**
- "Is the app a web browser or search engine?" → **No**

## ⚠️ Photo and video permissions beyanı

Uygulama Android 13+ için `READ_MEDIA_VIDEO` istiyor (expo-media-library; Kayıtlar sekmesi
"Prompter" albümünü listeliyor ve oynatıyor). Google bu izni kullanan uygulamalardan bir beyan
istiyor. Formda:

- **Does your app use READ_MEDIA_IMAGES or READ_MEDIA_VIDEO?** → Yes, READ_MEDIA_VIDEO
- **Describe your app's core functionality / why it needs broad access** (EN, olduğu gibi yapıştır):

  > Cue Cam is a teleprompter camera app. Its core function is recording videos of the user while
  > a script scrolls on screen. Every recording is saved to a dedicated "Prompter" album in the
  > device's media library, and the app's Recordings tab lists, plays and shares the videos in that
  > album, including takes recorded with earlier installs of the app. This requires persistent
  > read access to the user's videos; a one-time photo picker cannot list the album or show new
  > recordings automatically.

- Kanıt videosu istenirse: Kayıt → kaydet → Kayıtlar sekmesinde videonun listelenip oynatılması
  (ekran kaydı, 30 sn).

Google bu beyanı **reddederse** çözüm: Kayıtlar sekmesini yalnızca uygulamanın kendi oluşturduğu
dosyalarla çalışacak şekilde değiştirmek (Android 10+ izin gerektirmez) ve `READ_MEDIA_VIDEO`'yu
kaldırmak. Bu durumda `BACKLOG.md`'ye BUG olarak ekle, Claude düzeltir.

## Store settings

- **App category:** Video Players & Editors (alternatif: Productivity)
- **Tags:** Video recording, Teleprompter (öneri listesinden en yakınları)
- **Contact details:** e-posta (zorunlu, mağazada görünür), web sitesi
  `https://ozkulfurkan.github.io/cuecam/`
