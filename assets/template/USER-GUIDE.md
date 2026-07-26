# User Guide — Rekap Katalog Labib Center

Panduan lengkap untuk maintain katalog produk desain di website Labib Center.
Setiap kali menambah, mengubah, atau menghapus item katalog, ikuti workflow di dokumen ini.

---

## 1. Isi Folder `assets/template/`

| File | Fungsi |
|---|---|
| `catalog-template.xlsx` | Template kosong (2 baris contoh). Salin & isi untuk rekap baru. |
| `catalog-example.xlsx` | Contoh terisi lengkap (10 item saat ini). Rujukan format & style. |
| `xlsx-to-json.py` | Script Python untuk convert XLSX → `catalog.json`. |
| `USER-GUIDE.md` | Dokumen ini. |

---

## 2. Workflow Ringkas

```
   +-------------------+     +-------------------+     +-------------------+
   | 1. SIAPKAN ASET   | --> | 2. UPLOAD ASET    | --> | 3. ISI XLSX       |
   | - Desain preview  |     | - ImageKit (img)  |     | - Salin URL       |
   | - File master     |     | - Drive (master)  |     | - Isi harga, dsb  |
   +-------------------+     +-------------------+     +-------------------+
                                                                |
                                                                v
   +-------------------+     +-------------------+     +-------------------+
   | 6. CEK DI WEB     | <-- | 5. DEPLOY         | <-- | 4. CONVERT JSON   |
   | - Buka github.io  |     | - git push        |     | - xlsx-to-json.py |
   +-------------------+     +-------------------+     +-------------------+
```

---

## 3. Persiapan Aset

Untuk setiap item katalog, siapkan **2 kategori file**:

### 3.1 Gambar Preview (untuk ditampilkan di website)
- **1 gambar thumbnail** ukuran ~400×300 px
- **1–5 gambar preview besar** ukuran ~1000×750 px (WAJIB minimal 1)
- Format: JPG (hemat ukuran) atau PNG (bila butuh transparansi)
- Naming: `{id}.jpg`, `{id}-2.jpg`, `{id}-3.jpg` (angka urut, gunakan `id` yang sama dengan yang akan diisi di XLSX)

**Tips ukuran:**
- Kompres via TinyPNG (https://tinypng.com) sebelum upload — target <150KB per gambar
- Rasio thumbnail: 4:3 (cocok dengan grid card di website)

### 3.2 File Master (untuk didownload customer setelah beli)
- File `.cdr` (CorelDRAW) atau `.psd` (Adobe Photoshop)
- Sertakan file font, gambar aset, dan preview PDF jika ada
- Zip semua file master → `{id}-master.zip` (opsional, memudahkan customer)

---

## 4. Upload Gambar Preview ke ImageKit

ImageKit adalah CDN gambar gratis (20GB/bulan free tier). URL bisa ditambah parameter `?tr=w-{width}` untuk resize otomatis — jadi cukup upload 1 versi resolusi tinggi (1000px atau lebih), URL akan generate versi thumbnail on-the-fly.

### 4.1 Login & Buka Media Library
1. Buka https://imagekit.io/dashboard
2. Login (atau register kalau belum punya akun)
3. Klik menu **Media Library** di sidebar kiri

### 4.2 Upload
1. Buat folder `labibcenter/` (sekali saja, di awal)
2. Klik tombol **Upload** → pilih semua file preview yang sudah disiapkan
3. Tunggu upload selesai

### 4.3 Ambil URL untuk XLSX
1. Klik gambar yang baru diupload → muncul panel detail di kanan
2. Copy URL dasar, contoh:
   ```
   https://ik.imagekit.io/YOUR_BUCKET_ID/labibcenter/brosur-lebaran.jpg
   ```
3. Untuk isi kolom **thumbnail** di XLSX, tambahkan suffix `?tr=w-400,f-auto,q-auto`:
   ```
   https://ik.imagekit.io/YOUR_BUCKET_ID/labibcenter/brosur-lebaran.jpg?tr=w-400,f-auto,q-auto
   ```
4. Untuk isi kolom **image_1** (dan image_2..5), tambahkan suffix `?tr=w-1000,f-auto,q-auto`:
   ```
   https://ik.imagekit.io/YOUR_BUCKET_ID/labibcenter/brosur-lebaran.jpg?tr=w-1000,f-auto,q-auto
   ```

**Arti parameter:**
- `w-400` = resize width ke 400px (proporsional, height auto)
- `f-auto` = format auto (WebP untuk browser modern, JPG fallback — lebih hemat bandwidth)
- `q-auto` = quality auto (kompresi cerdas)

---

## 5. Upload File Master ke Google Drive

### 5.1 Buat Folder per Item
1. Buka https://drive.google.com
2. Buat folder baru dengan nama = `id` item (contoh: `brosur-promo-lebaran-3-lipat`)
3. Upload semua file master (CDR/PSD/ZIP) ke dalam folder tersebut

### 5.2 Set Sharing "Anyone with the link"
1. Klik kanan folder → **Share** (atau **Bagikan**)
2. Di bagian bawah, klik **Change to anyone with the link** (atau **Ubah ke siapa saja dengan link**)
3. Pastikan role = **Viewer**
4. Copy link — akan berformat:
   ```
   https://drive.google.com/drive/folders/1AbC2DeF3GhIjKlMnOpQrStUvWxYz
   ```
5. Paste URL ini ke kolom **drive_url** di XLSX

**Penting:** Jika sharing bukan "Anyone with the link", customer TIDAK bisa akses file setelah beli.

---

## 6. Isi Template XLSX

### 6.1 Buka Template
1. Buka `catalog-template.xlsx` di Excel / LibreOffice / Google Sheets
2. Sheet **Catalog** untuk isi data. Sheet **README** berisi ringkasan aturan.
3. Baris 2 dan 3 sudah berisi contoh — bisa dihapus atau di-override.

### 6.2 Field per Kolom

| Kolom | Wajib | Deskripsi |
|---|---|---|
| `id` | ✔ | Kebab-case unik. Contoh: `brosur-promo-lebaran`. Huruf kecil, angka, tanda `-` saja. Tidak boleh duplikat antar baris. |
| `title` | ✔ | Judul lengkap yang tampil di card & modal. Boleh gunakan huruf besar/kapital. Contoh: `Brosur Promo Lebaran 3 Lipat`. |
| `category` | ✔ | Pilih dari dropdown: `Brosur`, `Undangan`, `Banner`, `Kartu Nama`, `Poster`, `Stiker`. |
| `format` | ✔ | Pilih dari dropdown: `CDR` atau `PSD`. |
| `price` | ✔ | Harga jual dalam Rupiah, angka saja tanpa titik/koma. Contoh: `45000` (bukan `Rp 45.000` atau `45.000`). |
| `original_price` | — | (Opsional) Harga coret untuk promo. Kosongkan bila TIDAK promo. Bila diisi, HARUS lebih besar dari `price`. Ribbon "HEMAT n%" otomatis muncul di card & modal. |
| `description` | ✔ | Deskripsi lengkap 1–3 kalimat. Sebut ukuran, DPI, mode warna, dan use-case. Tampil di modal preview & juga jadi konten SEO. |
| `keywords` | ✔ | Keyword SEO dipisah koma. Digunakan untuk fitur search di website. Contoh: `brosur lebaran, template cdr, brosur promo`. |
| `thumbnail` | ✔ | URL gambar 400×300 (kecil, tampil di grid katalog). Dari ImageKit dengan suffix `?tr=w-400,f-auto,q-auto`. |
| `image_1` | ✔ | URL gambar 1000×750 (besar, slide 1 di modal carousel). |
| `image_2..image_5` | — | (Opsional) Gambar preview tambahan. Kosongkan bila tidak ada. Bila ada >1, badge "n" muncul di pojok kiri-atas card. |
| `drive_url` | ✔ | URL folder Google Drive berisi file master. Sharing HARUS "Anyone with link". |

### 6.3 Simpan File
- Save-as dengan format **.xlsx** (bukan .xls atau .ods)
- Nama file bebas, contoh: `catalog-2026-01.xlsx`. Rekomendasi: pakai nama tanggal supaya bisa versioning.

---

## 7. Convert XLSX → JSON

### 7.1 Instalasi (sekali saja)
1. Install Python 3.8+ dari https://python.org
2. Buka **Terminal** (macOS/Linux) atau **PowerShell** (Windows)
3. Install openpyxl:
   ```
   pip install openpyxl
   ```

### 7.2 Jalankan Converter
Buka terminal di folder `assets/template/`, lalu jalankan:

```bash
python xlsx-to-json.py catalog-template.xlsx -o ../json/catalog.json
```

**Perintah tambahan:**

```bash
# Validasi saja (cek error tanpa menulis file)
python xlsx-to-json.py catalog-template.xlsx --dry-run

# Print JSON ke terminal (tidak menyimpan)
python xlsx-to-json.py catalog-template.xlsx
```

### 7.3 Contoh Output Sukses
```
OK: 10 item valid.
Wrote 10 item -> ../json/catalog.json
```

### 7.4 Contoh Output Error
```
=== VALIDATION ERRORS ===
  - Row 3 (brosur-promo-x): category 'Bros' tidak valid. Harus salah satu:
    ['Banner', 'Brosur', 'Kartu Nama', 'Poster', 'Stiker', 'Undangan']
  - Row 5: id 'Brosur Menu' harus kebab-case (a-z, 0-9, tanda '-')
  - Row 7 (banner-x): image_1 kosong

Total error: 3
```

Perbaiki error di XLSX → jalankan lagi.

---

## 8. Deploy ke Website

Setelah `catalog.json` di-generate ulang, commit & push ke GitHub Pages:

```bash
cd path/ke/labibcenter.github.io
git add assets/json/catalog.json
git commit -m "Update katalog: tambah 3 item baru"
git push origin main
```

**Catatan:** Website ini menampilkan katalog dari HTML yang di-hardcode (bukan runtime fetch `catalog.json`). Jadi kalau menambah item baru, `index.html` juga perlu di-regenerate. **Kontak developer / minta bantuan Claude untuk regenerate `index.html` dari `catalog.json` terbaru.**

Setelah push, GitHub Pages otomatis rebuild dalam 30-90 detik. Buka:
```
https://qkohst.github.io/labibcenter/
```
untuk cek hasilnya.

---

## 9. Update / Hapus Item

### Update
1. Buka XLSX
2. Edit row yang bersangkutan
3. Convert ulang → push

### Hapus
1. Buka XLSX
2. Hapus row yang bersangkutan (atau kosongkan seluruh isinya)
3. Convert ulang → push
4. (Opsional) Hapus juga gambar di ImageKit & folder Drive-nya agar rapi

---

## 10. Troubleshooting

| Masalah | Penyebab | Solusi |
|---|---|---|
| `ModuleNotFoundError: openpyxl` | Openpyxl belum terinstall | Jalankan `pip install openpyxl` |
| `category 'Bros' tidak valid` | Typo di kolom category | Gunakan dropdown di XLSX (jangan ketik manual) |
| `id harus kebab-case` | ID pakai spasi atau huruf besar | Ganti: `Brosur Menu` → `brosur-menu` |
| `original_price harus > price` | Harga promo salah input | Kosongkan `original_price` bila tidak promo, atau naikkan angkanya |
| Gambar tidak muncul di web | URL ImageKit salah, atau CORS block | Test URL di browser: harus tampil gambar. Cek suffix `?tr=w-400,f-auto,q-auto` benar |
| File Drive tidak bisa didownload customer | Sharing masih "Restricted" | Set sharing ke **Anyone with the link** — Viewer |
| Website belum update setelah push | Cache browser / GitHub Pages | Hard refresh (Ctrl+Shift+R) & tunggu 1-2 menit |
| Badge "HEMAT n%" tidak muncul | `original_price` kosong atau ≤ price | Pastikan `original_price > price` |

---

## 11. Checklist Sebelum Deploy

- [ ] Semua row XLSX valid (jalankan `--dry-run` — 0 error)
- [ ] URL thumbnail & image_1..5 sudah dites di browser (tidak 404)
- [ ] Folder Drive sudah di-share "Anyone with the link"
- [ ] Harga sudah benar (dalam Rupiah, tanpa titik)
- [ ] `original_price > price` untuk item promo, atau kosong kalau tidak promo
- [ ] `catalog.json` sudah di-regenerate
- [ ] `index.html` sudah di-regenerate (bila ada item baru/hilang)
- [ ] Git commit dengan pesan yang jelas
- [ ] `git push origin main`
- [ ] Cek https://qkohst.github.io/labibcenter/ (hard refresh)

---

**Butuh bantuan?** Buka Claude Code di folder ini dan minta bantuan langsung, contoh:
> "Aku sudah update `catalog.json`. Tolong regenerate `index.html` dari data terbaru."
