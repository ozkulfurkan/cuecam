# Mağaza dosyaları

| Dosya                               | Ne için                                                                                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listings.json`                     | App Store + Play metinleri, TR ve EN (ad, alt başlık, açıklama, anahtar kelimeler, ekran görüntüsü başlıkları). Karakter sınırları `listings.test.ts` ile denetlenir (`npm test`). |
| `graphics/play-icon-512.png`        | Play Console → Store listing → App icon                                                                                                                                            |
| `graphics/play-feature-graphic.png` | Play Console → Feature graphic (1024×500)                                                                                                                                          |
| `privacy-labels.md`                 | App Store Connect → App Privacy cevapları                                                                                                                                          |
| `data-safety.md`                    | Play Console → Data safety cevapları                                                                                                                                               |
| `play-console.md`                   | Play Console → App content (içerik derecelendirme, hedef kitle, medya izni beyanı…)                                                                                                |
| `screenshots/`                      | Ekran görüntüleri (aşağıda)                                                                                                                                                        |

App Store'da dil eşlemesi: `en-US` → English (U.S.), `tr` → Turkish. Play'de: `en-US` →
English (United States), `tr` → Turkish – tr-TR.

## Ekran görüntüleri

1. Telefonda (preview APK veya TestFlight) **uygulama dili İngilizce** iken 6 ekran görüntüsü al,
   sonra Ayarlar → Dil → Türkçe yapıp aynı 6'sını tekrar al. Sıra ve içerik
   (`listings.json` → `screenshotCaptions` ile aynı sırada):

   | No  | Ekran                                                     | İpucu                                                 |
   | --- | --------------------------------------------------------- | ----------------------------------------------------- |
   | 01  | Kayıt ekranı, ön kamera, yazı akıyor                      | İyi ışık, yüzün kameraya bakıyor                      |
   | 02  | Kayıt sırasında (kırmızı süre sayacı görünüyor)           | Gülümse 🙂                                            |
   | 03  | Kayıt sırasında basılı tutarken "2× hız" etiketi          |                                                       |
   | 04  | Kayıttan önce turuncu çerçeveli yazı kutusu (taşıma modu) | Kutuyu biraz büyüt                                    |
   | 05  | Senaryolar listesi (3–4 senaryo, okuma süreleriyle)       | Gerçekçi başlıklar: "YouTube intro", "Ürün tanıtımı"… |
   | 06  | Kayıtlar sekmesi (birkaç video)                           |                                                       |

2. Dosyaları şöyle koy: `store/screenshots/raw/en-US/01.png … 06.png` ve
   `store/screenshots/raw/tr/01.png … 06.png`.
3. Çalıştır (Playwright + Chromium gerekir: `npm i -g playwright && npx playwright install chromium`):

   ```bash
   NODE_PATH=$(npm root -g) node scripts/frame-screenshots.mjs
   ```

4. Çıktı: `store/screenshots/<dil>/app-store/*.png` (1290×2796, App Store 6.7"/6.9" iPhone) ve
   `store/screenshots/<dil>/play/*.png` (1080×1920, Play telefon). Yükle.

> iPhone ekran görüntüsü yoksa App Store için Android ekran görüntüleri de kullanılabilir
> (çerçeve aynı boyuta getirir), ama Apple'ın kuralına göre ekranlar uygulamanın iOS'taki
> görünümünü yansıtmalı — iPhone'dan almak en güvenlisi.

## İkonu değiştirmek

`assets/source/glyph.svg`'yi düzenle, sonra:

```bash
NODE_PATH=$(npm root -g) node scripts/generate-icons.mjs
```
