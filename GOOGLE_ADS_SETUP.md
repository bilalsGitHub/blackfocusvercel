# Google Ads Kurulum Rehberi - BlackFocus

## 🎯 1. Google Ads Hesabı Oluşturma

1. [Google Ads](https://ads.google.com/) sitesine git
2. "Şimdi Başla" butonuna tıkla
3. İşletme bilgilerini doldur
4. Faturalandırma bilgilerini ekle

## 📊 2. Kampanya Yapısı

### Kampanya 1: Pomodoro Timer (Ana Kampanya)
**Bütçe:** Günlük $10-20 (aylık ~$300-600)

**Keywords (Exact Match):**
```
[pomodoro timer]
[pomodoro timer online]
[free pomodoro timer]
[pomodoro technique timer]
[online pomodoro timer]
```

**Keywords (Phrase Match):**
```
"pomodoro timer online"
"free pomodoro timer"
"best pomodoro timer"
```

**Keywords (Broad Match Modifier - Negative Keywords ekle):**
```
+pomodoro +timer
+online +pomodoro +timer
```

**Reklam Metni Örnekleri:**

**Reklam 1:**
```
Başlık 1: Ücretsiz Pomodoro Timer Online
Başlık 2: Siyah Minimal Tasarım | Reklamsız
Başlık 3: Hemen Başla - Kayıt Gerektirmez
Açıklama 1: Ücretsiz online Pomodoro timer. Güzel siyah tasarım, analitik özellikleri. Odaklanmanı artır, üretkenliğini takip et.
Açıklama 2: Kayıt gerektirmez. Hemen kullanmaya başla. Tamamen ücretsiz.
URL: blackfocus.app
```

**Reklam 2:**
```
Başlık 1: BlackFocus - Pomodoro Timer
Başlık 2: Minimal & Hızlı | 100% Ücretsiz
Başlık 3: En İyi Online Timer
Açıklama 1: Distraksiyon-free Pomodoro timer. Modern tasarım, güçlü özellikler. Study ve deep work için mükemmel.
Açıklama 2: Anlık başla. Uygulama indirmene gerek yok. Browser'da çalışır.
URL: blackfocus.app/timer
```

---

### Kampanya 2: Focus Timer
**Bütçe:** Günlük $5-10 (aylık ~$150-300)

**Keywords:**
```
[focus timer]
[focus timer online]
[concentration timer]
[study timer online]
[work timer]
[productivity timer]
"free focus timer"
"online focus timer"
```

**Reklam Metni:**
```
Başlık 1: Ücretsiz Focus Timer Online
Başlık 2: BlackFocus - Minimal Tasarım
Başlık 3: Deep Work İçin Mükemmel
Açıklama 1: Distraksiyon-free focus timer. Siyah minimal tasarım. Çalışma ve ders çalışma için ideal.
Açıklama 2: Ücretsiz başla. Kayıt yok, indirme yok. Sadece odaklan.
URL: blackfocus.app
```

---

### Kampanya 3: Black Timer (Benzersiz Pozisyonlama)
**Bütçe:** Günlük $3-5 (aylık ~$100-150)

**Keywords:**
```
[black timer]
[black focus timer]
[minimal timer]
[minimalist timer]
[dark timer]
"black pomodoro timer"
"minimal focus timer"
```

**Reklam Metni:**
```
Başlık 1: Siyah Minimalist Timer
Başlık 2: BlackFocus - Güzel Dark Tasarım
Başlık 3: Ücretsiz & Reklamsız
Açıklama 1: En güzel siyah timer online. Minimal tasarım, maksimum odak. Dark theme sevenler için ideal.
Açıklama 2: Hemen başla. Tamamen ücretsiz. Modern ve hızlı.
URL: blackfocus.app
```

---

### Kampanya 4: Timer Online (Geniş)
**Bütçe:** Günlük $5-8 (aylık ~$150-250)

**Keywords:**
```
[timer online]
[online timer]
[web timer]
"free timer online"
"productivity timer online"
```

**Reklam Metni:**
```
Başlık 1: Online Timer - BlackFocus
Başlık 2: Pomodoro & Focus Sessions
Başlık 3: İndirme Gerektirmez
Açıklama 1: Hızlı, güvenilir online timer. Pomodoro, focus sessions, analytics. Şimdi ücretsiz başla.
Açıklama 2: Browser'da çalışır. Her cihazdan erişilebilir. Tamamen ücretsiz.
URL: blackfocus.app
```

---

## 🎯 3. Conversion Tracking Kurulumu

### Google Ads Conversion Tracking

1. Google Ads hesabında "Tools & Settings" > "Conversions" git
2. "+ New Conversion Action" tıkla
3. "Website" seç
4. Conversion name: "Timer Start" oluştur
5. Category: "Submit lead form" seç
6. Value: "Don't assign a value" (veya $1)
7. Count: "Every" seç
8. Conversion window: 30 days
9. Click-through window: 30 days
10. Tag setup: "Install tag yourself" seç
11. Kodu kopyala

### Conversion Tracking Kodunu Ekle

`components/conversion-tracking.tsx` oluştur:

```typescript
"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function ConversionTracking() {
  const pathname = usePathname();
  const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  useEffect(() => {
    if (pathname === "/timer" && window.gtag) {
      // Track timer page visit as conversion
      window.gtag("event", "conversion", {
        send_to: `${ADS_ID}/xxxxx`, // Conversion ID'nizi buraya ekleyin
        value: 1.0,
        currency: "USD",
      });
    }
  }, [pathname, ADS_ID]);

  return (
    <Script
      id="google-ads"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          gtag('config', '${ADS_ID}');
        `,
      }}
    />
  );
}
```

---

## 📈 4. Kampanya Optimizasyonu

### Negatif Keywords (Eklemesi Gerekenler)
```
-download
-app
-mobile app
-android
-ios
-iphone
-apk
-software
-windows
-mac
-desktop app
-chrome extension
-plugin
-watch
-clock (eğer saat satmıyorsanız)
-buy
-purchase
-review
-reviews
-vs
-comparison
-alternative (eğer belirli bir alternatif değilseniz)
-free download
-cracked
-hack
```

### Bidding Strategy
1. **İlk 2 hafta:** Manual CPC (Cost Per Click)
   - Max CPC: $0.50 - $1.00
   - Hedef: Veri toplamak

2. **2 hafta sonra:** Target CPA (Cost Per Acquisition)
   - Hedef CPA: $2-5 (ayarlayabilirsiniz)

3. **1 ay sonra:** Maximize Conversions
   - Google AI'ın optimize etmesine izin ver

### Quality Score İyileştirme
- ✅ Landing page relevant keywords içermeli (YAPILDI)
- ✅ Fast loading time (Next.js optimize)
- ✅ Mobile responsive (YAPILDI)
- ✅ Clear CTA buttons (YAPILDI)
- ✅ HTTPS (production'da ekle)
- ✅ Ad relevance (keywords match ad text)

---

## 🎨 5. Landing Page Optimizasyonu

### A/B Test Varyasyonları

**Varyasyon 1: Current (Focus on Free)**
- "Start Free Timer Now" CTA

**Varyasyon 2: Focus on Speed**
- "Start Timer in 3 Seconds" CTA

**Varyasyon 3: Focus on Benefit**
- "Boost Your Productivity Now" CTA

### Conversion Rate Artırma İpuçları
1. ✅ Remove distractions (YAPILDI - minimal design)
2. ✅ Clear value proposition (YAPILDI)
3. ✅ Fast loading (YAPILDI - Next.js)
4. ✅ Mobile responsive (YAPILDI)
5. ⏳ Add testimonials (eklenebilir)
6. ⏳ Add "As seen on" badges (eklenebilir)
7. ⏳ Show user count (eklenebilir)

---

## 💰 6. Budget & ROI Hesaplama

### Örnek Budget Breakdown (Aylık)
- Kampanya 1 (Pomodoro): $450 (40%)
- Kampanya 2 (Focus): $340 (30%)
- Kampanya 3 (Black): $225 (20%)
- Kampanya 4 (Timer): $115 (10%)
**TOPLAM:** ~$1,130/ay

### ROI Beklentisi
- Click başına maliyet (CPC): $0.30 - $1.00
- Aylık tıklama: ~1,500 - 3,800 clicks
- Dönüşüm oranı (CVR): %5-10
- Aylık yeni kullanıcı: ~75-380 users

Premium conversion: %5 → ~4-19 paid users/ay
Revenue: 4-19 × $4.99 = $20-95/ay

**İlk aylarda ROI negatif olabilir - bu normal!**
**Hedef: 3-6 ayda break-even, 12 ayda profitable**

---

## 📊 7. Analytics & Tracking

### Google Analytics 4 Events to Track
```javascript
// Timer started
gtag('event', 'timer_started', {
  'timer_type': 'pomodoro',
  'duration': 25
});

// Session completed
gtag('event', 'session_completed', {
  'timer_type': 'pomodoro',
  'duration': 25
});

// Sign up
gtag('event', 'sign_up', {
  'method': 'email'
});

// Premium upgrade
gtag('event', 'purchase', {
  'value': 4.99,
  'currency': 'USD',
  'items': [{
    'item_name': 'Premium Monthly'
  }]
});
```

---

## 🚀 8. Launch Checklist

### Reklam Başlatmadan Önce
- ✅ Website SEO optimize edildi
- ✅ Meta tags eklendi
- ✅ Sitemap oluşturuldu
- ✅ robots.txt eklendi
- ✅ Landing page optimize edildi
- ⏳ Google Analytics kurulumu
- ⏳ Google Ads Conversion Tracking kurulumu
- ⏳ Domain satın alındı (blackfocus.app)
- ⏳ HTTPS sertifikası eklendi
- ⏳ Google Ads hesabı oluşturuldu
- ⏳ İlk kampanya oluşturuldu
- ⏳ Ödeme yöntemi eklendi

### İlk Hafta Monitör Edilecekler
- [ ] CTR (Click-Through Rate) > 2%
- [ ] Quality Score > 5
- [ ] Bounce Rate < 60%
- [ ] Avg. Session Duration > 1 min
- [ ] CPC < $1.00

### İlk Ay Optimizasyonları
- [ ] Negatif keywords ekle
- [ ] Düşük performanslı keywords durdur
- [ ] Yüksek performanslı keywords için bid artır
- [ ] Ad copy A/B testing yap
- [ ] Landing page A/B testing yap
- [ ] Conversion tracking doğruluğunu kontrol et

---

## 📱 9. Remarking Campaign (İleri Seviye)

### 2-3 Ay Sonra Eklenebilir

**Audience Segments:**
1. **Visited Timer Page:** Timer sayfasını ziyaret ettiler ama kayıt olmadılar
2. **Started Timer:** Timer kullandılar ama kayıt olmadılar
3. **Signed Up - Free:** Kayıt oldular ama premium almadılar
4. **Cart Abandoners:** Pricing page'e gittiler ama satın almadılar

**Remarketing Ad Examples:**
```
Başlık: Odaklanmaya Devam Et 🎯
Açıklama: BlackFocus ile kaldığın yerden devam et. Oturumlarını takip et, üretkenliğini artır.
```

---

## 🎓 10. İpuçları & Best Practices

### ✅ Yapılması Gerekenler
- İlk 2 hafta günlük kontrol et
- Düzenli A/B testing yap
- Competitor ads'leri takip et
- Keyword performance'ı haftalık incele
- Mobile vs Desktop performance'ı karşılaştır

### ❌ Yapılmaması Gerekenler
- İlk haftalarda büyük değişiklikler yapma
- Tek bir kampanyaya tüm bütçeyi harcama
- Negatif keywords unutma
- Quality Score'u ihmal etme
- Landing page optimization'ı atlama

---

## 📞 Destek

Google Ads konusunda yardım için:
- [Google Ads Help Center](https://support.google.com/google-ads)
- [Google Ads Community](https://support.google.com/google-ads/community)
- [Google Ads Phone Support](https://support.google.com/google-ads/gethelp)

---

**Hazırlayan:** BlackFocus Team
**Son Güncelleme:** 1 Aralık 2024
**Versiyon:** 1.0
