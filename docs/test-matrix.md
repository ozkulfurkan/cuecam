# Cihaz test matrisi (PRM-26)

Beş cihazda PRM-7 … PRM-25 akışlarının kontrol listesi. Her satır bir adım; her sütun bir cihaz.

**Nasıl işaretlenir:** hücredeki `[ ]` yerine yaz:

- `[x]` geçti
- `[!]` hata var → aşağıdaki **Bulgular** tablosuna ekle (BUG numarası ver)
- `[-]` bu cihazda uygulanamaz / denenmedi (nedenini Not sütununa yaz)

Hata bulunduğunda `BACKLOG.md` → "Notlar / bulgular" bölümüne `BUG-<no>` olarak da eklenir; Claude önce onları düzeltir.

> iOS sütunları Apple Developer hesabı ve iOS internal distribution (PRM-3) gelene kadar `[-]` kalır.

## 0. Cihazlar ve build

|                                                     | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone           |
| --------------------------------------------------- | --------- | ------ | ------------ | ------------- | --------------------- |
| Model                                               |           |        |              |               |                       |
| İşletim sistemi sürümü                              |           |        | (≤ 9 ideal)  |               | (desteklenen en eski) |
| Arayüz (One UI / HyperOS / MIUI)                    |           |        |              | –             | –                     |
| Build türü + tarih (dev / preview APK / TestFlight) |           |        |              |               |                       |
| Uygulama sürümü / commit                            |           |        |              |               |                       |
| Boş depolama (GB)                                   |           |        |              |               |                       |
| Test tarihi                                         |           |        |              |               |                       |

**Önemli:** PRM-24 (ısı modülü) ve PRM-25 (`expo-key-event`) native kod ekledi → bu matris **night-2 sonrası yeni bir build** ile doldurulmalı. Eski build'le PRM-24'ün ısı kısmı ve PRM-25 çalışmaz (uygulama çökmez).

Cihaza özel dikkat:

- **Samsung A:** pil optimizasyonu ("Uyku moduna alınan uygulamalar") arka plan davranışını değiştirebilir; PRM-23 adımlarında not al.
- **Xiaomi (MIUI/HyperOS):** izin pencereleri farklı görünür; "Otomatik başlatma" ve "Pil tasarrufu" ayarları arka planda uygulamayı öldürebilir (PRM-23 adım 23.4 tam bunu dener). Galeri uygulaması albümleri farklı listeleyebilir.
- **Eski Android (≤ 9):** galeri izni "dosyalara erişim" olarak sorulur; ısı durumu desteklenmez (uyarı hiç çıkmaz — beklenen); 1080p/4K desteği kısıtlı olabilir.
- **Eski iPhone:** 4K / 30 fps desteği ve ısınma davranışı farklı; uzun kayıt (PRM-27) burada en zor.

---

## Sprint 2 · Kamera ve kayıt

### PRM-7 · Kamera ve mikrofon izinleri

Uygulamayı **kaldırıp** yeniden kur (izinler sıfırdan).

| #   | Adım → beklenen                                                                                                              | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 7.1 | Kayıt sekmesi → "Kamera ve mikrofon" ekranı → "İzin ver" → önce kamera, sonra mikrofon sorulur; ikisine izin → kamera açılır | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 7.2 | Bir izni reddet → tekrar sorulabiliyor; ikinci ret → "Ayarları Aç" düğmesi                                                   | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 7.3 | "Ayarları Aç" → Cue Cam'in ayar sayfası açılır; izni ver, geri dön → ekran kendiliğinden kameraya geçer                      | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 7.4 | iOS: telefon Türkçeyken izin metinleri Türkçe, İngilizceyken İngilizce                                                       | –         | –      | –            | [ ]           | [ ]         |     |

### PRM-8 · Kamera önizleme

| #   | Adım → beklenen                                                                               | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| --- | --------------------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 8.1 | Tam ekran ön kamera, ayna gibi (sağ el ekranda sağda)                                         | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 8.2 | Dev build: "30 fps · front" yazısı; arka kameraya geçince "30 fps · back"                     | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 8.3 | Ana ekrana çık, 5 sn bekle, dön → görüntü donmadan devam; arka planda kamera göstergesi sönük | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 8.4 | X ile kapat → ana ekran                                                                       | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

### PRM-9 · Video ve ses kaydı

| #   | Adım → beklenen                                                                     | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| --- | ----------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 9.1 | Kırmızı düğme → 3-2-1 → kırmızı sayaç 00:00'dan sayar; X ve kamera değiştirme gizli | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 9.2 | Kayıt sırasında geri tuşu/kaydırma ekranı kapatmaz                                  | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 9.3 | Saniyeleri sesli sayarak 20 sn kayıt → galeride dudak ile ses senkron               | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 9.4 | Video bilgisi: 1080×1920 (ayarda 1080p iken), ses net (AAC)                         | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 9.5 | Arka arkaya 3 kısa kayıt → 3 ayrı video, donma yok                                  | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

### PRM-10 · Galeriye kaydetme

| #    | Adım → beklenen                                                               | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ----------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 10.1 | İlk kayıt bitince galeri izni sorulur → izin → "Prompter albümüne kaydedildi" | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 10.2 | Galeri/Fotoğraflar → "Prompter" albümü → video oynuyor                        | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 10.3 | İkinci kayıt aynı albüme eklenir (ikinci "Prompter" albümü oluşmaz)           | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 10.4 | Galeri iznini kapat → yeni kayıt → "Kaydedilmedi…" + "Ayarları Aç"            | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

### PRM-11 · Ön kamera ayna (ertelendi — yalnız mevcut durumu kontrol et)

| #    | Adım → beklenen                                                                                                                  | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 11.1 | Ön kamerayla üzerinde yazı olan bir şeyi çek → galeride yazı **düz** okunuyor mu? (Karar: kayıt aynasız olmalı; aynalıysa `[!]`) | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

## Sprint 3 · Prompter motoru

### PRM-12 / PRM-13 · Akan yazı, hız ve yazı boyutu

| #    | Adım → beklenen                                                            | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | -------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 12.1 | Kayıt başlayınca metin akmaya başlar; ilk saniyelerde takılma/sıçrama yok  | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 12.2 | 1 dk izle: akış pürüzsüz                                                   | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 12.3 | Galerideki videoda prompter metni görünmüyor                               | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 13.1 | Kayıt sırasında hız ve boyut kaydırıcıları anında etki eder, akış takılmaz | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 13.2 | Uygulamayı tamamen kapatıp aç → hız ve boyut hatırlanmış                   | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

### PRM-14 · Lens altı yerleşim

| #    | Adım → beklenen                                                                   | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | --------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 14.1 | Yazı kutusu ön kameranın hemen altında, dar sütun; çentik/delik kutuyu kapatmıyor | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 14.2 | Kayıtta metni okurken çekilen videoda gözler kameraya bakıyor gibi                | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

### PRM-15 · Geri sayım ve dokununca duraklat

| #    | Adım → beklenen                                                         | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ----------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 15.1 | 3-2-1 sırasında düğmeye basınca geri sayım iptal                        | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 15.2 | Kayıtta metne dokun → "Duraklatıldı", kayıt sürer; tekrar dokun → devam | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

### PRM-16 · Ekran yönü kilidi

Otomatik döndürme **açık**.

| #    | Adım → beklenen                                                                       | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ------------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 16.1 | Ana ekranlar yan çevrilince dikey kalır                                               | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 16.2 | Kayıt ekranı sola/sağa döner; yazı kutusu her seferinde kameranın olduğu kenarda      | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 16.3 | Yatayda kayıt başlat, telefonu dikey çevir → ekran yatay kalır; durdur → tekrar döner | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 16.4 | Galeride yatay video yatay ve düz (iki yön için de)                                   | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 16.5 | Dikey kayıt dikey ve düz; X ile kapatınca uygulama dikeye döner                       | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

## Sprint 4 · Senaryolar ve ayarlar

### PRM-17 … PRM-21 · Senaryolar, depolama, içe aktarma, ayarlar, okuma süresi

| #    | Adım → beklenen                                                                             | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ------------------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 17.1 | Senaryo ekle, düzenle, ara (Türkçe karakterle: "şiir" → "Şiir"), sil (onay sorar)           | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 17.2 | Listeden bir senaryonun kayıt düğmesi → o senaryo prompter'da                               | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 18.1 | Uygulamayı tamamen kapatıp aç → senaryolar, son senaryo ve ayarlar duruyor                  | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 19.1 | Editörde "Yapıştır" → panodaki metin sona eklenir (pano boşsa uyarı)                        | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 19.2 | ".txt içe aktar" → Türkçe karakterli dosya düzgün gelir                                     | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 20.1 | Ayarlar: dil Türkçe/English anında değişir ve hatırlanır                                    | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 20.2 | Kalite 720p / 1080p / 4K → kayıt bilgisinde çözünürlük değişir (desteklenmiyorsa en yakını) | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 21.1 | Liste ve editörde "N kelime · Hız X ile ~mm:ss" görünür, hız değişince güncellenir          | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

### PRM-22 · Kayıtlar ekranı

| #    | Adım → beklenen                                 | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ----------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 22.1 | Kayıtlar sekmesi: en yeni üstte, süreler doğru  | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 22.2 | Kayda dokun → tam ekran oynar, ses var          | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 22.3 | Paylaş → WhatsApp/Drive → karşı tarafta oynuyor | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 22.4 | Galeri izni kapalıyken → "İzin ver" düğmesi     | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

## Sprint 5 · Sağlamlık

### PRM-23 · Kesinti yönetimi

| #    | Adım → beklenen                                                                                             | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ----------------------------------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 23.1 | ~10 sn kayıt → ana ekrana çık → dön → "Kayıt kesildi — video kaydedildi"; video galeride, sonu bozuk değil  | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 23.2 | Kayıt sırasında gelen arama (aç, konuş, kapat) → uygulamaya dön → bildirim + video galeride                 | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 23.3 | Aynı, ama arama küçük bildirim (heads-up) olarak gelirse: kayıt ne oldu? Ses kesildi mi? (Not sütununa yaz) | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 23.4 | Kayıt sırasında uygulama değiştiriciden uygulamayı öldür → yeniden aç → Kayıt → bildirim + video galeride   | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 23.5 | 3-2-1 sırasında ana ekrana çık, dön → kayıt başlamamış                                                      | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 23.6 | iPhone: kayıtta Kontrol Merkezi'ni aç/kapat → kayıt devam ediyor                                            | –         | –      | –            | [ ]           | [ ]         |     |

### PRM-24 · Depolama ve ısı uyarıları (yeni build)

| #    | Adım → beklenen                                                                                                                                        | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 24.1 | Yeni build sorunsuz kuruluyor ve açılıyor                                                                                                              | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 24.2 | Bol yerde: kayda basınca uyarısız 3-2-1                                                                                                                | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 24.3 | 4K seç, boş alan < ~5 GB → "Depolama azalıyor: yaklaşık N dk…" (N makul mü?); "Vazgeç" başlatmaz, "Yine de kaydet" başlatır                            | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 24.4 | (İsteğe bağlı) Yer bitene kadar 4K kayıt → kendiliğinden durur, "depolama neredeyse dolu — video kaydedildi", video oynuyor                            | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 24.5 | Uzun 4K kayıt / şarjda / sıcakta: turuncu "Telefon ısınıyor" veya kırmızı "çok sıcak" görüldü mü? (Görülmemesi hata değil; eski Android'de hiç çıkmaz) | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

### PRM-25 · Bluetooth kumanda / klavye (yeni build)

| #    | Adım → beklenen                                                                                                         | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 25.1 | **R** → 3-2-1; geri sayımda **R** → iptal; kayıtta **R** → durur ve kaydeder                                            | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 25.2 | Kayıtta **Boşluk** ve **Enter** → duraklat/devam                                                                        | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 25.3 | **Yukarı/aşağı ok** → hız değişir (1–10), basılı tutunca tekrarlar                                                      | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 25.4 | **Page Down/Up** veya sağ/sol ok → metin 3 satır ileri/geri                                                             | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 25.5 | Ucuz kumanda: hangi tuş ne yaptı? (Not sütununa; çalışmayan tuşun kodu Metro konsolunda "No mapping found for keyCode") | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |
| 25.6 | Android: ses tuşları hâlâ sesi değiştiriyor                                                                             | [ ]       | [ ]    | [ ]          | –             | –           |     |

### Uzun kayıt (PRM-27 ön kontrol)

Ayrıntılı ölçüm PRM-27'de; burada yalnız geçti/kaldı.

| #    | Adım → beklenen                                                           | Samsung A | Xiaomi | Eski Android | Güncel iPhone | Eski iPhone | Not |
| ---- | ------------------------------------------------------------------------- | --------- | ------ | ------------ | ------------- | ----------- | --- |
| 27.1 | 1080p 10 dk kayıt: akış takılmıyor, video sonunda ses ile görüntü senkron | [ ]       | [ ]    | [ ]          | [ ]           | [ ]         |     |

---

## Bulgular

Her hata için bir satır; aynısını `BACKLOG.md` → "Notlar / bulgular" bölümüne `BUG-<no>` olarak ekle.

| BUG   | Cihaz | Adım | Ne oldu | Beklenen | Tekrar ediyor mu? | Video/ekran görüntüsü |
| ----- | ----- | ---- | ------- | -------- | ----------------- | --------------------- |
| BUG-1 |       |      |         |          |                   |                       |
