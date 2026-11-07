# THE DECCAN TABLE

A complete local QR food-ordering demonstration built from the three original prototypes in `references/`. Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, React Context and browser storage. The existing app is now configured for static export and free GitHub Pages hosting. See [GITHUB-PAGES.md](GITHUB-PAGES.md) for deployment instructions.

## Run locally

Requires Node.js 20.9 or newer (verified here with Node 24).

```sh
npm install
npm run dev
```

Open http://localhost:3000/deccan-table-demo/. The dev server binds to `0.0.0.0` so a phone on the same Wi-Fi can open `http://YOUR_LAPTOP_IP:3000/deccan-table-demo/`. The Next.js development configuration automatically allows the laptop's local IPv4 hosts. Windows may require allowing Node through the private-network firewall. Find the laptop address with `ipconfig`.

For a production static preview at http://localhost:4173/deccan-table-demo/:

```sh
npm run build
npm start
```

## Routes

| Route                      | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `/`                        | Demo landing page and walkthrough                     |
| `/menu`                    | Customer menu, search and categories                  |
| `/cart`                    | Cart, order notes and checkout                        |
| `/order/?id=ORDER_ID`      | Confirmation and live tracking                        |
| `/order/play/?id=ORDER_ID` | Live status, games and rewards                        |
| `/vendor`                  | Overview and calculated metrics                       |
| `/vendor/orders`           | Incoming orders and status controls                   |
| `/vendor/menu`             | Shared menu editor                                    |
| `/vendor/reports`          | Daily reports, chart and CSV export                   |
| `/vendor/settings`         | Restaurant availability, location and confirmed reset |
| `/credits`                 | Full food-photo attribution and license links         |

`ORDER_ID` is the internal UUID generated at checkout. The route table uses paths relative to `/deccan-table-demo`; prepend this repository prefix when opening a URL directly. Use the confirmation links or Current order in the demo navigation to open a real order.

## Walkthrough

1. Keep `/menu` and `/vendor/orders` open in two tabs in the **same browser and origin**.
2. Add two dosas and one idli, check quantities, and open the cart. The initial total is INR 180.
3. Enter a name and optional table/notes. Choose Pay at Counter and place the demo order. Repeated clicks cannot place the same submission twice.
4. The order immediately appears in the vendor tab. Enable sound with the sound button if desired; browser audio starts only after interaction.
5. Move New to Preparing. Customer tracking updates automatically.
6. Open Play while you wait. Try Food Memory Match, Tic-Tac-Toe and Quick Reflex. Switching games preserves each game's current round.
7. Mark Ready in the vendor tab. The collection notification appears above the games without resetting them. Collect 50 points once for this order.
8. Mark Completed and open Daily insights. Completed value and status counts use India time. Export today's CSV.
9. Place another order, optionally choosing Online Payment - Demo. No financial transaction occurs and no payment details are collected. Mark Ready and collect another 50 points to unlock a demo INR 50 voucher.
10. Edit a dish or toggle availability in Menu studio. The customer menu updates immediately. Existing orders keep the dish name, price and quantity recorded at checkout.
11. Use vendor settings to reset all demo data with confirmation.

## Implemented behavior

- All original 30 dishes and eight categories, with accurate vegetarian/non-vegetarian classification.
- Forest-green, cream and gold customer UI; navy and gold vendor UI; plum and gold rewards.
- Automatic welcome reveal once per browser-tab session, replay, reduced-motion support.
- Dish details in a native accessible dialog; keyboard focus return, Escape and backdrop close.
- Search by name/description, filters, local photos, quantity controls, fixed cart summary, availability and empty states.
- Customer name, optional table and notes, two payment preferences, immutable order-item snapshots, unique order IDs and incrementing customer tokens.
- Sequential order status validation and cancellation of New/Preparing orders.
- Live shared menu/order updates through React Context and the browser storage event. Web Locks serialize mutations across tabs where supported.
- Calculated overview, searchable status-filtered queue, opt-in incoming-order audio, menu creation/edit/archive and local photo upload (JPEG, PNG, WebP; max 700 KB).
- India-time daily counts, completed order value, status bars, hourly order chart, most ordered dishes and CSV export. Spreadsheet formula prefixes are escaped in exported text.
- Full memory matching game with six distinct pairs, computer tic-tac-toe with win/draw detection and wins, randomized reflex test with early-tap detection and best/average times.
- Once-per-order reward claiming after Ready or Completed, 100-point redemption and unique demo vouchers. Redemption never changes order totals.
- Versioned data, known-v0 migration, validation and preserved malformed/unknown data with a recovery message and explicit reset.

## Structure

```text
src/app/                    App Router pages, styles and layout
src/components/customer/    Menu, cart, confirmation and tracking
src/components/vendor/      Operations workspace and editors
src/components/games/       Three independent playable games
src/components/rewards/     Wallet and voucher interface
src/components/shared/      Brand, accessible dialog and demo navigation
src/lib/data/               Original 30-dish seed and categories
src/lib/store/              Context, persistence, validation and synchronization
src/lib/utils/domain.ts     Testable cart/order/reward/report/game rules
src/types/                  Shared TypeScript data contracts
public/images/dishes/       Local WebP photographs, originals and credits.json
references/                 Three unchanged source HTML prototypes
scripts/                    Browser walkthrough and image preparation
tests/                     Domain, storage and asset tests
```

The domain rules operate on typed data independently of the UI. Replace the storage adapter with a server-backed implementation for a future Firebase version; move order validation, rewards and payment verification to the server before production use.

## Photographs

All **30/30** seeded dishes have distinct, visually reviewed, licensed Wikimedia Commons photographs. There are **zero seeded placeholders**. Optimized WebP files total approximately **1.52 MB**. Next.js Image serves local assets; third-party image services are not used at runtime. The original files and the full source/author/license manifest are retained alongside the optimized assets. See `/credits` and `public/images/dishes/credits.json`.

These are illustrative photographs, not photographs of a real Deccan Table kitchen. Plating and recipes vary. The Alfredo photograph uses fettuccine; its description says pasta, rather than claiming the photograph shows penne. Invalid or missing uploaded photos fall back to a clearly labelled dish placeholder.

`scripts/fetch-images.py` documents reproducible Wikimedia metadata requests and selected source candidates. `node scripts/prepare-images.mjs` creates optimized WebP assets. Network rate limits can affect re-downloading; all final assets are already included.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

The browser walkthrough uses Playwright. With the app running at port 3000:

```sh
npm run test:browser
```

On Windows the walkthrough uses installed Microsoft Edge. Other environments use a Playwright Chromium installation (`npx playwright install chromium`). Set `PLAYWRIGHT_CHANNEL` if you need another installed browser channel. Additional focused checks:

```sh
node scripts/edge-browser-check.mjs
node scripts/responsive-check.mjs
```

The LAN smoke test is available in `scripts/lan-browser-check.mjs`; update its laptop IP if your network address changes. Screenshots, CSV and machine-readable results are written under `test-results/`. See `VERIFICATION.md` for the executed results and verification scope.

## Demo boundaries

- Persistence belongs to the browser profile and origin (host plus port). A phone and laptop have separate data, as do `localhost` and a laptop's LAN address. For a live demonstration on a phone, open both customer and vendor views on that phone. Cross-device synchronization requires a future backend.
- No authentication, Firebase, WhatsApp messaging, real payments, financial settlement or real discounts are connected. All vendor controls are public because this is a local demo.
- Reward rules and customer ownership are not tamper-resistant in localStorage. They must move to an authenticated server for production.
- Browser quotas apply to uploaded photos. Write failures display an error and preserve the prior saved state. Reset removes only this app's data, not unrelated browser data.
- Web Locks are available in secure browser contexts such as localhost. LAN HTTP still supports ordering and storage-event updates, but simultaneous writes across tabs use the browser's simpler read/write fallback. UUID creation uses `crypto.getRandomValues`, which also works over LAN HTTP.
- No kitchen preparation estimate is fabricated. Order readiness changes only when the vendor updates it.
- The seeded token sequence continues across days until reset; daily reports still filter by Asia/Kolkata calendar date.

## Restaurant and hotel logo

Open `/vendor/settings` and use **Restaurant / hotel logo** to upload a PNG, JPEG or WebP file up to 700 KB. Uploads save automatically and appear in customer/vendor headers, the footer and the welcome reveal. Replace or remove the logo from the same panel. The logo is saved in this browser and synchronizes across tabs on the same origin, like the rest of the demo data.
