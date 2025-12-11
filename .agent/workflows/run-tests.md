---
description: Menjalankan semua test untuk memvalidasi fitur aplikasi
---

# Workflow: Run Tests

Workflow ini untuk menjalankan semua automated tests dan memastikan semua fitur berjalan dengan baik.

## Steps

### 1. Run All Tests (Quick Check)

Untuk menjalankan semua test dengan cepat:

// turbo
```bash
npm test
```

Jika semua test PASS, maka semua fitur existing berjalan dengan baik.

### 2. Run Tests dengan Coverage Report (Detailed)

Jika ingin melihat detail coverage:

// turbo
```bash
npm run test:coverage
```

Hasil coverage akan ditampilkan di terminal dan juga tersimpan di folder `coverage/`.

### 3. Run Tests dalam Watch Mode (Development)

Saat sedang development fitur baru:

```bash
npm run test:watch
```

Tests akan otomatis re-run setiap kali file disave.

## Expected Output

**Jika PASS:**
```
Test Suites: 2 passed, 2 total
Tests:       59 passed, 59 total
```

**Jika FAIL:**
Test yang gagal akan ditampilkan dengan detail:
- Lokasi file dan line number
- Expected vs Actual value
- Stack trace

## What to Do if Tests Fail

1. Baca error message dengan teliti
2. Check line number yang disebutkan
3. Perbaiki code yang menyebabkan test fail
4. Run `npm test` lagi sampai semua PASS
