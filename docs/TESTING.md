# Testing Guide untuk emailku.

## Overview

Project ini menggunakan **Jest** sebagai testing framework dengan **TypeScript** support melalui `ts-jest`.

## Struktur Testing

```
src/
├── __tests__/
│   ├── generator.test.ts    # Tests untuk email generation functions
│   └── storage.test.ts      # Tests untuk localStorage operations
└── lib/
    ├── generator.ts         # Core email generation logic
    └── storage.ts           # Data persistence layer
```

## Quick Commands

### Run All Tests (Sekali Klik!)

```bash
npm test
```

### Run Tests dengan Watch Mode (Real-time saat development)

```bash
npm run test:watch
```

Test akan otomatis re-run setiap kali kamu save file. Sangat berguna saat development.

### Run Tests dengan Coverage Report

```bash
npm run test:coverage
```

Ini akan menghasilkan coverage report di folder `coverage/`.

## Test Cases yang Dicakup

### Generator Tests (`generator.test.ts`)

| Feature | Test Cases |
|---------|------------|
| **Dot Mode Generation** | Simple email, existing dots, single char, two chars, invalid format, sorting |
| **Plus Mode Generation** | Basic tag, clean dots, missing tag error, special chars |
| **Mixed Mode Generation** | Dot + tag combination, sorting |
| **Gmail Validation** | Valid emails, dots handling, non-gmail rejection, invalid formats, case insensitivity |
| **Edge Cases** | Long usernames, no duplicates, domain preservation |

### Storage Tests (`storage.test.ts`)

| Feature | Test Cases |
|---------|------------|
| **Email CRUD** | Get, save, add, update, delete single/batch/all |
| **Duplicate Handling** | Skip duplicates, incremental IDs |
| **Master Tags** | Get default, save, add (normalize, trim, no duplicates), remove |
| **Export/Import** | JSON export, valid/invalid import |

## Kapan Harus Run Tests?

✅ **WAJIB run tests sebelum:**
- Push ke repository
- Merge pull request
- Deploy ke production

✅ **Disarankan run tests saat:**
- Menambah fitur baru
- Mengubah logic existing
- Refactoring code

## Menambah Test Baru

Untuk menambah test baru, buat file di folder `src/__tests__/` dengan format:

```typescript
// src/__tests__/namafitur.test.ts

import { functionToTest } from '@/lib/namafile'

describe('Nama Fitur', () => {
  test('should do something specific', () => {
    const result = functionToTest(input)
    expect(result).toBe(expectedOutput)
  })
})
```

## Tips Testing

1. **Test satu hal per test case** - Jangan gabung banyak assertions yang tidak related
2. **Gunakan nama yang deskriptif** - `should return empty array when no data` lebih baik dari `test 1`
3. **Test edge cases** - Invalid input, empty data, boundary conditions
4. **Mock external dependencies** - localStorage sudah di-mock otomatis via `jest.setup.js`

## Coverage Target

| Metric | Target | Current |
|--------|--------|---------|
| Statements | >90% | 96.69% ✅ |
| Branches | >80% | 83.33% ✅ |
| Functions | 100% | 100% ✅ |
| Lines | >90% | 100% ✅ |

## Troubleshooting

### Tests tidak jalan

```bash
# Clear Jest cache
npx jest --clearCache

# Re-run
npm test
```

### Module not found error

Pastikan path alias `@/lib` digunakan untuk import dari folder lib:

```typescript
// ✅ Benar
import { generateVariations } from '@/lib/generator'

// ❌ Salah (relative path bisa bermasalah)
import { generateVariations } from '../generator'
```
