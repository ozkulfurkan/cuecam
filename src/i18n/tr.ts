import type { StringKey } from './en';

// Turkish strings. Typed against the English keys, so a missing or extra key
// fails the type check.
export const tr: Record<StringKey, string> = {
  'tabs.scripts': 'Senaryolar',
  'tabs.record': 'Kayıt',
  'tabs.recordings': 'Kayıtlar',
  'tabs.settings': 'Ayarlar',

  'common.close': 'Kapat',
  'common.cancel': 'Vazgeç',
  'common.delete': 'Sil',
  'common.openSettings': 'Ayarları Aç',
  'common.untitled': 'Adsız senaryo',

  'permissions.camera': 'Kamera',
  'permissions.microphone': 'Mikrofon',
  'permissions.and': '{first} ve {second}',
  'permissions.requestTitle': 'Kamera ve mikrofon',
  'permissions.requestBody':
    'Cue Cam, sen senaryonu okurken görüntü ve ses kaydeder. Kayda başlamak için erişime izin ver.',
  'permissions.allow': 'İzin ver',
  'permissions.offTitle': '{names} erişimi kapalı',
  'permissions.offBody': 'Ayarlar’da Cue Cam için {names} erişimini aç, sonra buraya dön.',
  'permissions.restrictedTitle': '{names} kısıtlı',
  'permissions.restrictedBody':
    'Bu cihaz {names} erişimini engelliyor (örneğin Ekran Süresi veya bir cihaz politikası). Bunu yalnızca cihazı yöneten kişi değiştirebilir.',

  'recorder.noCamera': 'Kullanılabilir kamera yok',
  'recorder.switchToBack': 'Arka kameraya geç',
  'recorder.switchToFront': 'Ön kameraya geç',
  'recorder.start': 'Kaydı başlat',
  'recorder.stop': 'Kaydı durdur',
  'recorder.cancelCountdown': 'Geri sayımı iptal et',
  'recorder.timer': 'Kayıt, {time}',
  'recorder.failed': 'Kayıt başarısız: {error}',
  'recorder.paused': 'Duraklatıldı · devam etmek için yazıya dokun',
  'recorder.saving': 'Galeriye kaydediliyor…',
  'recorder.saved': '"{album}" albümüne kaydedildi',
  'recorder.notSavedSettings':
    'Kaydedilmedi: kayıtları saklamak için Ayarlar’da Fotoğraflar erişimine izin ver',
  'recorder.notSavedDenied': 'Kaydedilmedi: Fotoğraflar erişimine izin verilmedi',
  'recorder.notSavedError': 'Kaydedilmedi: {error}',
  'recorder.interrupted': 'Kayıt kesildi',
  'recorder.stoppedStorageFull': 'Kayıt durdu: depolama neredeyse dolu',
  'recorder.stoppedHot': 'Kayıt durdu: telefon çok ısındı',
  'recorder.keptSaving': '{why} — video kaydediliyor…',
  'recorder.keptSaved': '{why} — video "{album}" albümüne kaydedildi',
  'recorder.keptNotSaved': '{why}. {reason}',
  'recorder.warm': 'Telefon ısınıyor — uzun kayıtlarda kare atlayabilir',
  'recorder.hot': 'Telefon çok sıcak — kamera birazdan durabilir',

  'preRecord.title': 'Kayıttan önce',
  'preRecord.storageLow': 'Depolama azalıyor: yaklaşık {minutes} dk {quality} video sığar.',
  'preRecord.storageCritical':
    'Depolama neredeyse dolu: {minutes} dakikadan az {quality} video sığar. Yer bitince kayıt kendiliğinden durur, video korunur.',
  'preRecord.hot':
    'Telefon çok sıcak. Kamera durabilir veya kare atlayabilir; mümkünse biraz soğumasını bekle.',
  'preRecord.recordAnyway': 'Yine de kaydet',
  'recorder.script': 'Senaryo',
  'recorder.pauseHint': 'Akışı duraklatır',
  'recorder.resumeHint': 'Akışı sürdürür',

  'prompter.speed': 'Hız {value}',
  'prompter.size': 'Boyut {value}',
  'prompter.speedLabel': 'Akış hızı',
  'prompter.sizeLabel': 'Yazı boyutu',
  'prompter.moveBox': 'Metin kutusu: taşımak için sürükle',
  'prompter.resizeBox': 'Metin kutusu boyutu: büyütüp küçültmek için sürükle',
  'prompter.resetBox': 'Metin kutusunun konumunu ve boyutunu sıfırla',

  'scripts.title': 'Senaryolar',
  'scripts.new': 'Yeni senaryo',
  'scripts.search': 'Senaryolarda ara',
  'scripts.emptyTitle': 'Henüz senaryo yok',
  'scripts.emptyBody': 'Kamerada okumak istediğin metni yaz ya da yapıştır.',
  'scripts.noResults': '"{query}" ile eşleşen senaryo yok',
  'scripts.readingTime': 'Hız {speed} ile ~{time}',
  'scripts.words': '{count} kelime',
  'scripts.record': 'Kaydet',
  'scripts.recordThis': '"{title}" ile kayıt yap',

  'editor.title': 'Senaryoyu düzenle',
  'editor.titlePlaceholder': 'Başlık',
  'editor.bodyPlaceholder': 'Senaryonu buraya yaz ya da yapıştır…',
  'editor.paste': 'Yapıştır',
  'editor.pasteHint': 'Panodaki metni senaryonun sonuna ekler',
  'editor.importTxt': '.txt içe aktar',
  'editor.clipboardEmpty': 'Panoda yapıştırılacak metin yok.',
  'editor.importFailed': 'Dosya içe aktarılamadı: {error}',
  'editor.deleteTitle': 'Senaryo silinsin mi?',
  'editor.deleteBody': '"{title}" silinecek. Kaydedilen videolar silinmez.',

  'recordings.title': 'Kayıtlar',
  'recordings.emptyTitle': 'Henüz kayıt yok',
  'recordings.emptyBody': 'Çektiğin videolar "{album}" albümüne kaydedilir ve burada listelenir.',
  'recordings.permission': 'Kayıtlarını görmek için Fotoğraflar erişimine izin ver.',
  'recordings.allow': 'İzin ver',
  'recordings.share': 'Paylaş',
  'recordings.play': '{date} tarihli kaydı oynat',
  'recordings.loadFailed': 'Kayıtlar yüklenemedi: {error}',

  'settings.title': 'Ayarlar',
  'settings.prompter': 'Prompter',
  'settings.prompterHint': 'Bunları kayıt sırasında da değiştirebilirsin.',
  'settings.video': 'Video',
  'settings.quality': 'Kayıt kalitesi',
  'settings.qualityHint':
    'Yüksek kalite daha çok yer kaplar. Kamera desteklemiyorsa en yakın kalite kullanılır.',
  'settings.language': 'Dil',
  'settings.languageSystem': 'Sistem',
  'settings.developer': 'Geliştirici',
  'settings.testCrash': 'Test çökmesi',
  'settings.testCrashHint': 'Sentry’nin hatayı aldığını görmek için bir hata fırlatır',

  'sample.script': `Merhaba, Cue Cam’e hoş geldin.

Bu, kendi metnini yazmadan önce prompter’ı deneyebilmen için hazırlanmış örnek bir senaryo.

Konuşurken gözlerini bu satırlarda tut. Satırlar kameranın hemen altında durduğu için videoda doğrudan izleyicine konuşuyormuş gibi görünürsün.

Akışı duraklatmak için istediğin an yazıya dokun, devam etmek için tekrar dokun. Aşağıdaki kaydırıcılarla yazının hızını ve boyutunu kayıt sırasında bile değiştirebilirsin.

Kırmızı düğmeye bastığında kısa bir geri sayım hazırlanman için sana zaman tanır. Ardından kayıt ve akış birlikte başlar.

Doğal bir hızla konuş, yazının seni takip etmesine izin ver. Geride kalırsan biraz yavaşlat. Kelimeleri bekliyorsan hızlandır.

Bitirdiğinde durdurmak için kırmızı kareye bas. Videon galerideki Prompter albümüne kaydedilir.

Cue Cam’i denediğin için teşekkürler. Şimdi harika bir şey kaydet.`,
};
