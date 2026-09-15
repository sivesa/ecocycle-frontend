# Market Price — API shape (admin)

Existing public/mobile endpoints stay as-is:

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/waste/materials` | Create material |
| GET | `/api/waste/materials?category=` | **Requires** category (not suitable as admin list-all) |
| GET | `/api/waste/materials/options?category=` | Dropdown |
| GET | `/api/waste/materials/{id}` | Detail |
| GET | `/api/waste-types` | All types |
| POST | `/api/waste-types` | Create type |

Admin console needs **list-all + optional filters** and **price update** without forcing a category.

## New admin endpoints (recommended)

Secure with `@PreAuthorize("hasAnyRole('ADMIN','FINANCE')")`.

### 1. List materials

```http
GET /api/admin/waste-materials
GET /api/admin/waste-materials?category=PLASTIC
GET /api/admin/waste-materials?recyclable=true
GET /api/admin/waste-materials?q=pet
```

**Response** `200` — array of:

```json
[
  {
    "id": 1,
    "wasteName": "PET Bottles",
    "category": "PLASTIC",
    "wasteTypeId": 3,
    "wasteTypeName": "Recyclable",
    "pricePerKg": 4.80,
    "valueScore": 8,
    "recyclable": true,
    "requiresCleaning": true,
    "cleaningInstructions": "Rinse and remove caps",
    "storageInstructions": "Dry bag",
    "disposalInstructions": null,
    "educationalTip": "Clear PET has higher value",
    "imageUrl": null
  }
]
```

Implementation: reuse `WasteMaterialService` + join `WasteType` for `wasteTypeName`.  
If you prefer not to add `/api/admin/...`, alternatively change existing  
`GET /api/waste/materials` so `category` is **optional** and add `@PreAuthorize` for unfiltered list.

### 2. Get one (optional; admin can use existing)

```http
GET /api/admin/waste-materials/{id}
```

Same body as one element above (or reuse `WasteMaterialResponse`).

### 3. Update price

```http
PATCH /api/admin/waste-materials/{id}/price
Content-Type: application/json

{
  "pricePerKg": 5.10,
  "note": "Processor rate increase Jul 2026"
}
```

**Response** `200` — updated material (at least `id`, `pricePerKg`, `wasteName`).

**Validation:** `pricePerKg >= 0`, max 2 decimal places (match `precision = 10, scale = 2`).

**Auth:** ADMIN or FINANCE only.

Phase 2: persist `note` + actor + timestamp to an audit / price-history table.

## Frontend mapping (already wired)

| UI | Calls |
|----|--------|
| Open Market tab | `GET /api/admin/waste-materials` |
| Edit → Save | `PATCH /api/admin/waste-materials/{id}/price` |
| Filters | Client-side on loaded list (server query params optional) |

`api-client.js`:

- `fetchWasteMaterials(params?)`
- `updateWasteMaterialPrice(id, { pricePerKg, note? })`

## SecurityConfig reminder

Ensure `/api/admin/**` requires authentication and roles (method security on controller is enough if `anyRequest().authenticated()` stays).

```java
@PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
@RequestMapping("/api/admin/waste-materials")
```

## Table columns (UI)

| Column | Field |
|--------|--------|
| Material | `wasteName` |
| Category | `category` |
| Type | `wasteTypeName` |
| R / kg | `pricePerKg` |
| Value | `valueScore` |
| Recyclable | `recyclable` |
| Actions | View (detail) / Edit (modal) |
'''
