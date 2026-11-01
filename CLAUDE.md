# Prompter — proje rehberi (Claude için)

iOS ve Android için mobil prompter uygulaması: kamera açıkken metin ekranda akar, kullanıcı okurken video + ses kaydedilir ve video galeriye kaydedilir.

Kullanıcıyla **Türkçe** konuş. Kod, değişken adları ve commit mesajları **İngilizce**.

## Teknoloji yığını

- React Native + **Expo** (en güncel kararlı SDK), **TypeScript strict**
- **Development build** kullanılır (Expo Go DEĞİL) — native modüller var
- Navigasyon: **Expo Router** (dosya tabanlı, `app/` klasörü)
- Kamera / kayıt: **react-native-vision-camera**
- Akan yazı ve animasyon: **react-native-reanimated** (akış UI thread'de çalışmalı, JS thread'de `setInterval` ile kaydırma YAPMA)
- Galeri: **expo-media-library**
- Yerel depolama: **react-native-mmkv**
- Çökme raporlama: **@sentry/react-native**
- Derleme ve mağaza: **EAS Build / EAS Submit**
- Test: **jest-expo** + **@testing-library/react-native**

## Klasör yapısı

```
app/                 # Expo Router ekranları (scripts, record, settings ...)
src/
  components/        # Yeniden kullanılan UI bileşenleri
  features/
    camera/          # izinler, kamera, kayıt, galeri
    prompter/        # akan yazı motoru, hız/boyut kontrolleri
    scripts/         # senaryo listesi, editör, içe aktarma
    settings/
  theme/             # renkler, tipografi, aralıklar (tek kaynak)
  storage/           # MMKV sarmalayıcıları
  lib/               # yardımcılar
__tests__/ veya *.test.ts(x) dosyaları ilgili kodun yanında
```

## Kurallar

- Her değişiklikten sonra çalıştır ve hatasız olduğundan emin ol:
  `npx tsc --noEmit` · `npm run lint` · `npm test`
- Mantık içeren her yeni kod için test yaz (UI'dan bağımsız mantığı `features/*/` içinde saf fonksiyonlara ayır ki test edilebilsin).
- Renk, yazı boyutu ve aralıkları doğrudan yazma; `src/theme` içinden al. Karanlık tema varsayılan.
- Platform farkı olan yerlerde (`Platform.OS`) iki platformu da ele al ve yorumla açıkla.
- İzin metinleri (kamera, mikrofon, fotoğraf arşivi) `app.config.ts` içinde, TR ve EN.
- Yeni paket eklemeden önce Expo ile uyumlu olduğunu kontrol et; `npx expo install` kullan.
- Küçük, odaklı commit'ler. Mesaj formatı: `PRM-<no>: kısa açıklama`.
- Kamera, kayıt, galeri ve akış akıcılığı simülatörde/bulutta doğrulanamaz. Bu işlerde iş bitince kullanıcıya **gerçek cihazda nasıl test edeceğini** madde madde yaz.
- Emin olmadığın bir şeyde tahmin etme; kullanıcıya sor.

## Ürün kuralları

- Metin alanı ekranın **üst kısmında, kameraya yakın**, dar bir sütunda akar (göz lensten kaçmasın).
- Ön kamerada önizleme aynalı; kaydın aynalı olup olmayacağı ayardan seçilir.
- Ekran yönü kayıt başında sabitlenir.
- Kayıt bittiğinde video galeride "Prompter" albümüne kaydedilir.

## İş takibi

Issue'lar PRM-1 … PRM-33 olarak numaralı (6 sprint). Bir göreve başlarken kabul kriterlerini oku; bitince her kriterin karşılandığını tek tek doğrula ve özetle.
