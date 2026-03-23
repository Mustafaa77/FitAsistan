# 🍏 FitAsistan

Yapay zeka destekli, kişiselleştirilmiş diyet ve sağlıklı yaşam asistanı mobil uygulaması.

## 🚀 Proje Hakkında
FitAsistan, kullanıcıların fiziksel özelliklerine göre AI tabanlı diyet listeleri oluşturan, su ve kilo takibi yapabilen bütüncül bir platformdur. React ve modern web teknolojileri kullanılarak geliştirilmiş olup, Capacitor.js ile mobil uyumlu hale getirilmesi planlanmaktadır.

## 🛠️ Kullanılan Teknolojiler
* **Frontend:** React.js, Vite
* **Stil:** Tailwind CSS v4
* **Routing:** React Router v6
* **Backend & Auth:** Firebase
* **Database:** Supabase (PostgreSQL)

## � Güncel Durum (Şu An Buradayız)
* **Mevcut Aşama:** 2. Hafta (Dashboard ve Layout Hazırlığı)
* **Yapılanlar:** * `.env.example` dosyası oluşturuldu ve environment değişkenleri tanımlandı.
  * Firebase `firebase.js` dosyası gerçek environment değişkenlerini kullanacak şekilde güncellendi (mock kaldırıldı).
  * Supabase `supabase.js` servisi oluşturuldu ve temel bağlantı iskeleti kuruldu.
  * Mobil uyumlu `Layout.jsx` ve kaydırmalı `Sidebar.jsx` (Drawer) tasarlandı.
  * `Dashboard.jsx` karşılama kartı, su ve kalori ilerleme çubukları ile hızlı erişim kartları eklendi.
  * Tüm yan menü öğeleri için iskelet sayfalar (`PlaceholderPages.jsx`) ve Lab ödevi için basit input/buton alanları oluşturuldu.
  * `App.jsx` ve `ProtectedRoute.jsx` yeni sayfa yapısına ve Layout sarmalına göre güncellendi.
* **Sıradaki Görev:** 3. Hafta - VKİ Hesaplama ve Kilo Takip (Grafik) Modülü.

## 🗓️ 10 Haftalık İş Akışı
* [x] **1. Hafta:** Proje Kurulumu, Giriş ve Kayıt Ekranları
* [x] **2. Hafta:** Ana Sayfa (Menü) Tasarımı ve Veritabanı Bağlantısı (Supabase)
* [ ] **3. Hafta:** VKİ Hesaplama ve Kilo Takip (Grafik) Modülü