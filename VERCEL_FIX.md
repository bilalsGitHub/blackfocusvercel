# Vercel Unauthorized Hatası Çözümü

## Problem

Vercel'de deploy sonrası **"Unauthorized"** hatası - Cookie'ler çalışmıyor.

## Çözüm Adımları

### 1. Supabase Dashboard - Site URL Ayarı (EN ÖNEMLİ!)

1. https://supabase.com/dashboard adresine git
2. Projenizi seçin
3. Sol menüden **Authentication** → **URL Configuration** tıklayın
4. Aşağıdaki alanları güncelleyin:

```
Site URL: https://your-vercel-domain.vercel.app
```

**Redirect URLs** bölümüne şunları ekle:

```
https://your-vercel-domain.vercel.app/**
https://your-vercel-domain.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

5. **Save** butonuna tıklayın

### 2. Vercel Environment Variables

Vercel Dashboard'da şunları kontrol et:

- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `NEXT_PUBLIC_APP_URL` = `https://your-vercel-domain.vercel.app`

### 3. Yeniden Deploy

- Vercel otomatik yeniden deploy eder
- VEYA **Deployments** → üç nokta → **Redeploy**

### 4. Test

1. Vercel domain'inden logout ol (localStorage temizle)
2. Yeni sekmede Vercel domain'ine git
3. Login ol
4. Artık çalışmalı! ✅

---

## Alternatif: Manuel Cookie Test

Eğer hala çalışmazsa, cookie ayarlarını kontrol et:

### Browser Console'da Test:

```javascript
// Cookie'leri kontrol et
console.log(document.cookie);

// Supabase session'ı kontrol et
localStorage.getItem("sb-your-project-auth-token");
```

### Cookie Domain Problemi?

Eğer cookie'ler `localhost`'a set edilmişse, Vercel'de çalışmaz.
Çözüm: **Supabase Site URL'ini mutlaka değiştir!**

---

## Neden Bu Sorun Oluyor?

Supabase, authentication cookie'lerini **Site URL**'e göre set eder.

- Localhost'ta çalışıyor → Cookie: `localhost`
- Vercel'de çalışmıyor → Cookie yanlış domain'e set edilmiş

**Çözüm:** Supabase'e Vercel domain'ini tanıtmak gerekiyor.
