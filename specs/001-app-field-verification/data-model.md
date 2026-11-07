# Data Model: Card Field Limits & Layout Safety Matrix

## 1. Entities & Field Budgets

### CardTextLimits (`CARD_TEXT_LIMITS`)

| Field Name | Max Length (chars) | Clamping / Fallback Policy | Where Used |
| :--- | :--- | :--- | :--- |
| `displayName` | 48 | Hard limit | Card header, share sheet |
| `professionalName` | 32 | `fitProfessionalName` (adaptive shortening) | Main card hero line (all professional layouts) |
| `namePart` (`firstName`, `middleName`, `lastName`) | 24 | Hard limit & combined budget | Profile and onboarding form fields |
| `prefix` | 12 | Hard limit | Professional honorific (Dr., Prof., etc.) |
| `suffix` | 12 | Hard limit | Professional suffix (PhD, Esq., etc.) |
| `cardTag` | 24 | Hard limit & pill clamp (`numberOfLines={1}`) | Card badge indicator |
| `title` | 32 | `fitCardText` (word-boundary safe) | Job title across all card faces |
| `company` | 32 | `fitCardText` (word-boundary safe) | Company / organization name |
| `accreditations` | 24 | `fitAccreditationsToViewport` & pill clamp | Accreditations pills (`numberOfLines={1}`) |
| `tagline` | 48 | `fitTaglineToViewport` (2-line safe) | Sub-headline |
| `bio` | 180 | `fitCardText` | Biography section |

### ContactTextLimits (`CONTACT_TEXT_LIMITS`)

| Field Name | Max Length (chars) | Clamping Policy |
| :--- | :--- | :--- |
| `name` | 48 | Hard limit |
| `title` | 32 | Hard limit |
| `company` | 32 | Hard limit |
| `eventName` | 48 | Hard limit |
| `phone` | 32 | Hard limit |
| `email` | 80 | Truncated middle / wrapped |
| `website` | 96 | Truncated middle / wrapped |
| `address` | 120 | Multiline capped |
| `notes` | 500 | Multiline capped |

---

## 2. Layout Enumerations

### Identity Layouts (8 styles)
- `classic` (`layout-1`), `minimal` (`layout-2`), `spotlight` (`layout-5`), `editorial` (`layout-6`)
- `classic-new` (`layout-1-new`), `minimal-new` (`layout-2-new`), `spotlight-new` (`layout-5-new`), `editorial-new` (`layout-6-new`)

### Professional Layouts (8 styles)
- `classic` (`layout-1`), `spotlight` (`layout-3`), `banner` (`layout-4`), `badge` (`layout-5`)
- `classic-new` (`layout-1-new`), `spotlight-new` (`layout-3-new`), `banner-new` (`layout-4-new`), `badge-new` (`layout-5-new`)

### Connection Layouts (8 styles)
- `classic`, `banner`, `editorial`, `compact`
- `classic-new`, `banner-new`, `editorial-new`, `compact-new`

---

## 3. Surface Dimensions & Constraints

| Surface | Width Range | Aspect Ratio / Constraints | Text Overflow Strategy |
| :--- | :--- | :--- | :--- |
| **Home Preview Card** | 280px – 390px | Popl aspect ratio (1:1.6) | Scaled font sizes, `numberOfLines={1}` on headers/tags |
| **Full Card Modal** | 320px – 480px | Flexible scrollable height | 2-line caps on contact fields, 6-line cap on bio |
| **Web Share View** | Fixed 520px max | Fixed container, desktop/mobile web safe | Responsive tagline & single-line font scaling formulas |
| **Wallet Stack / Pass** | 280px – 340px | Apple/Google Pass fixed field ratios | Strict 32-char professional name, no tagline in pass |
