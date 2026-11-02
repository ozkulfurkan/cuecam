# Google Play — Veri güvenliği (Data safety) formu

Play Console → Uygulama → **Policy and programs → App content → Data safety**. Cevaplar sırayla:

## 1. Data collection and security

| Soru                                                                      | Cevap                                                                                                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Does your app collect or share any of the required user data types?       | **Yes**                                                                                                                                          |
| Is all of the user data collected by your app encrypted in transit?       | **Yes** (Sentry HTTPS)                                                                                                                           |
| Which of the following methods of account creation does your app support? | **My app does not allow users to create an account**                                                                                             |
| Do you provide a way for users to request that their data is deleted?     | **No** (hesap yok; raporlar kimlikle ilişkilendirilemez, 90 günde kendiliğinden silinir) — istersen "Yes" deyip destek sayfasını gösterebilirsin |

> Not: Sentry bizim adımıza veri işleyen "service provider" olduğu için Google'ın tanımına göre
> **paylaşım (sharing) sayılmaz**; yalnızca "collected" işaretlenir.

## 2. Data types — yalnızca şunları işaretle

### App info and performance

| Tür         | Collected | Shared |
| ----------- | --------- | ------ |
| Crash logs  | ✅        | ❌     |
| Diagnostics | ✅        | ❌     |

### Device or other IDs

| Tür                 | Collected | Shared |
| ------------------- | --------- | ------ |
| Device or other IDs | ✅        | ❌     |

(Sentry çökmesiz oturumları saymak için rastgele bir kurulum kimliği üretir. Reklam kimliği
kullanılmaz. Temkinli tarafta kalmak için beyan ediyoruz.)

**İşaretlenmeyecekler:** Location, Personal info, Financial info, Health and fitness, Messages,
**Photos and videos**, **Audio files / Voice or sound recordings**, Files and docs, Calendar,
Contacts, App activity, Web browsing.

> Videolar, ses ve senaryolar cihazdan çıkmaz → "collected" değildir. Kamera/mikrofon izni
> kullanmak tek başına veri toplamak sayılmaz.

## 3. Her işaretlenen tür için ayrıntılar (üçü için aynı)

| Soru                                                                            | Cevap                                                                                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Is this data collected, shared, or both?                                        | **Collected**                                                                                         |
| Is this data processed ephemerally?                                             | **No**                                                                                                |
| Is this data required for your app, or can users choose whether it's collected? | **Data collection is required**                                                                       |
| Why is this user data collected?                                                | **Analytics** ✅ (Device or other IDs için) · **App functionality** ✅ (Crash logs, Diagnostics için) |

## 4. Önizleme

Mağazada şöyle görünmeli:

- **Data shared:** No data shared with third parties
- **Data collected:** App info and performance, Device or other IDs
- Data is encrypted in transit
- You can't request that data be deleted (veya "Yes" dediysen tersi)

## 5. Privacy policy

App content → **Privacy policy** → `https://ozkulfurkan.github.io/cuecam/privacy/`
