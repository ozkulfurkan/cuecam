# App Store — App Privacy ("gizlilik etiketleri")

App Store Connect → Uygulama → **App Privacy** → Get Started. Cevaplar aşağıda; iOS gizlilik
manifesti (`app.config.ts` → `privacyManifests`) ile aynı olmalı.

**Privacy Policy URL:** `https://ozkulfurkan.github.io/cuecam/privacy/`

## "Do you or your third-party partners collect data from this app?" → **Yes**

(Sentry çökme raporları cihazdan çıktığı için "Yes". Senaryolar ve videolar cihazda kalır,
toplanmış sayılmaz.)

## Seçilecek veri türleri — yalnızca **Diagnostics** altında:

| Veri türü             | Seç |
| --------------------- | --- |
| Crash Data            | ✅  |
| Performance Data      | ✅  |
| Other Diagnostic Data | ✅  |

Diğer tüm kategoriler (Contact Info, Health, Financial, Location, Sensitive Info, Contacts, User
Content, Browsing/Search History, Identifiers, Purchases, Usage Data, Other Data) → **seçme**.

> "User Content → Photos or Videos / Audio Data" seçilmez: videolar ve ses yalnızca cihazdaki
> galeriye yazılır, geliştiriciye gönderilmez. Apple'ın tanımı "cihazdan çıkıp sizin veya
> ortaklarınızın erişebildiği veri"dir.

## Her üç veri türü için aynı cevaplar

- **Purposes:** App Functionality (yalnızca bu)
- **Is this data linked to the user's identity?** → **No**
- **Is this data used for tracking?** → **No**

## Sonuç (mağazada görünecek)

- Data Not Linked to You: **Diagnostics**
- Data Used to Track You: yok

## Ek ayar (Sentry)

Sentry → Settings → Projects → cuecam → **Security & Privacy** → "Prevent Storing of IP
Addresses" **açık** olmalı (gizlilik politikası bunu söylüyor). Uygulama zaten
`sendDefaultPii: false` ile IP göndermiyor; bu ayar sunucu tarafında da saklanmamasını sağlar.
