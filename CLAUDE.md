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

## İş takibi — BACKLOG.md

Tüm işler `BACKLOG.md` içinde, yapılacak sırayla. Kullanıcı "sıradaki işi yap" dediğinde:

1. `BACKLOG.md`'yi oku, yukarıdan aşağıya ilk `[ ]` maddeyi bul.
2. **FURKAN** etiketliyse ve gereken bilgi yoksa: kodlamaya başlamadan önce sor. Bulut/gözetimsiz çalışıyorsan bu maddeyi atla, sıradaki uygun maddeye geç ve atladığını rapor et.
3. **CİHAZ** etiketliyse: kodu yaz, testleri geçir, maddeyi `[~]` yap ve sonuna "Cihazda nasıl test edilir" adımlarını yaz.
4. **BULUT** etiketliyse: kodu yaz, typecheck + lint + test geçince `[x]` yap.
5. Bir maddenin önkoşulu (ör. "önkoşul: PRM-2") `[x]` değilse o maddeye başlama.
6. `BACKLOG.md`'deki durumu güncelle ve aynı commit'e dahil et: `PRM-<no>: kısa açıklama`.
7. Bitince kısa özet: ne yapıldı, kabul kriterleri tek tek, benden ne bekleniyor.

Gözetimsiz (bulut/zamanlanmış) çalışmada:

- Her zaman ayrı branch'te çalış (`prm-<no>-kisa-ad`) ve pull request aç; `main`'e doğrudan push etme.
- Bir oturumda en fazla **2 madde** yap.
- `[~]` maddeleri `[x]` yapma; onu yalnızca Furkan yapar.
- Hata çözülemiyorsa maddeyi `[!]` yap, sebebini altına yaz, devam etme.

Kullanıcı cihaz testinde hata bildirirse: `BACKLOG.md` "Notlar / bulgular" bölümüne `BUG-<no>` olarak ekle ve önce onu düzelt.
