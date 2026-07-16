# JFM AI

Chat client AI berbasis browser/PWA untuk endpoint model yang kompatibel dengan OpenAI dan Gemini. Aplikasi ini berupa satu halaman statis, dapat dipasang sebagai PWA, dan dipublikasikan melalui GitHub Pages.

**Demo:** https://jimzfm.github.io/JFM_AI/

## Fitur

- Chat streaming ke endpoint OpenAI-compatible (`/chat/completions`).
- Dukungan native Gemini REST, termasuk Google Search Grounding.
- Lampiran gambar, PDF, DOCX, XLSX, CSV, dan TXT.
- Perintah edit gambar melalui model khusus.
- Ambil isi hingga tiga URL dalam pesan, dengan fallback proxy CORS.
- Render Markdown, syntax highlighting, tabel, dan ekspor CSV dari tabel respons.
- Riwayat banyak sesi: buat, ganti nama, ekspor, hapus.
- Penghitung token, estimasi biaya model, dan kurs USD ke IDR.
- Rotasi hingga 10 API key bila respons mendapat `429`.
- Tema, ukuran font, mode PWA/offline cache.
- GitHub Actions untuk membangun APK Android Trusted Web Activity (TWA) dengan Bubblewrap.

## Jalankan

Tidak ada dependency, build step, atau server backend.

```bash
git clone https://github.com/JimzFM/JFM_AI.git
cd JFM_AI
python3 -m http.server 8080
```

Buka `http://localhost:8080`.

Buka tab **Settings**, lalu isi:

| Field | Nilai |
| --- | --- |
| Base URL | Base URL endpoint OpenAI-compatible. Contoh: `https://provider.example/v1` |
| API Key Utama | API key provider |
| Model Utama | ID model provider |
| Model Edit Gambar | Opsional. Diisi bila ingin edit gambar |
| System Prompt | Opsional |

Untuk endpoint Gemini, aplikasi memakai endpoint Gemini REST `v1beta` dan Google Search Grounding. Masukkan model dan API key Gemini yang valid.

## Penyimpanan data dan keamanan

Konfigurasi, API key, riwayat chat, pengaturan tema, serta data pemakaian disimpan pada `localStorage` browser perangkat.

- Jangan pakai browser/perangkat bersama.
- Jangan commit `.env`, keystore Android, atau API key. `.gitignore` sudah mengecualikan file tersebut.
- Jangan pakai API key dengan izin lebih dari kebutuhan.
- Hapus data browser atau semua sesi dari aplikasi bila perangkat berpindah tangan.
- Konten URL yang dikirim dalam chat dapat diambil lewat layanan proxy CORS pihak ketiga. Jangan kirim URL privat, bertoken, atau berisi data sensitif.
- Aplikasi statis tidak menyediakan backend atau vault secret. Untuk penggunaan tim/produksi, gunakan backend/proxy milik sendiri yang menyimpan secret di server.

## Deploy GitHub Pages

Repo sudah dapat diakses di:

```text
https://jimzfm.github.io/JFM_AI/
```

Setelah push perubahan ke branch `main`, deployment GitHub Pages akan memperbarui aplikasi. Service worker menggunakan strategi network-first untuk `index.html` dan `sw.js`, sehingga versi terbaru diambil saat jaringan tersedia.

## Build APK Android

Workflow manual ada pada `.github/workflows/build-apk.yml`.

1. Buka **Actions** di GitHub.
2. Pilih **Build Android APK (Bubblewrap)**.
3. Jalankan `Run workflow`.
4. Unduh artifact `jfm-ai-release-apk` setelah build selesai.

Untuk APK update yang bisa dipasang di atas versi sebelumnya, simpan secret berikut di GitHub sebelum build pertama:

- `ANDROID_KEYSTORE`: isi file keystore dalam Base64.
- `KEYSTORE_PASSWORD`: password keystore.

Tanpa secret, workflow membuat temporary keystore. APK hasil berikutnya tidak bisa memperbarui APK lama karena signature berubah.

## Struktur

```text
index.html                       UI, state, integrasi API, PWA client
manifest.json                    Metadata instalasi PWA
sw.js                            Service worker dan offline cache
twa-manifest.json                Konfigurasi Bubblewrap/TWA Android
.github/workflows/build-apk.yml  Workflow build APK
.well-known/assetlinks.json      Digital Asset Links Android
monitor.py                       Pemantau status workflow GitHub Actions
```

## Batasan

- Akses API bergantung pada CORS, format endpoint, kuota, dan kebijakan provider model.
- Web fetch tidak menjamin seluruh halaman dapat diambil; halaman bisa diblokir, membutuhkan login, atau dirender JavaScript.
- Estimasi biaya valid hanya bila harga per model dan data usage dari provider akurat.
- Cache offline mencakup shell aplikasi dan aset statis, bukan respons chat atau request API.

## Lisensi

[MIT](LICENSE) © 2026 JimzFM.
