# GitHub Pages static-export verification - 7 November 2026

The application is now exported with `output: "export"`, `basePath: "/deccan-table-demo"`, `trailingSlash: true` and `images.unoptimized: true`. All application pages are static, including `/order/?id=...` and `/order/play/?id=...`. No dynamic order directories remain.

Verified against the actual `out` files served at **http://localhost:4173/deccan-table-demo/** by `scripts/serve-static.mjs`, without a Next.js runtime or catch-all SPA fallback:

- TypeScript validation and ESLint passed.
- Production static export passed; `out` contains the HTML, client bundles, local photographs and `.nojekyll`.
- **23 unit and asset tests passed**, including prefix handling and query-based order links.
- **15 integrated browser checkpoints passed**, including ordering, duplicate prevention, live vendor updates, all three games, reward claiming/redemption, reports/CSV, menu updates, image loads, refresh persistence and storage recovery. Zero browser runtime errors.
- **7 edge-case browser checkpoints passed** against the static export.
- **40 responsive checks passed**: all ten primary routes at 320, 390, 768 and 1440 pixels.
- **5 static-host checks passed**: direct route/query loads, repository-prefixed script/photo URLs, no image-optimization endpoint requests, preserved file-picker-cancel behavior, and logo upload/refresh persistence.

Machine-readable results are saved in `test-results/browser-results.json`, `edge-results.json`, `responsive-results.json` and `static-export-results.json`. Earlier verification notes below describe the pre-export version and its former development URLs.

The GitHub Actions workflow and setup guide are included. No GitHub deployment or repository settings change has been performed; enable Pages and push the source as described in [GITHUB-PAGES.md](GITHUB-PAGES.md).

---

# Verification - 7 November 2026

Executed locally on Windows with Node.js 24.14.0 and headless Microsoft Edge through Playwright. Mobile checks use emulated viewports; a physical Android phone was not controlled during testing.

| Check                                            | Result                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Dependency installation                          | Passed; package-lock.json included                                    |
| TypeScript (`npm run typecheck`)                 | Passed                                                                |
| ESLint (`npm run lint`)                          | Passed; zero warnings                                                 |
| Production build (`npm run build`)               | Passed; all requested routes plus photo credits                       |
| Unit, storage and image-asset tests (`npm test`) | 21 passed, 0 failed                                                   |
| Integrated browser walkthrough                   | 15 checkpoints passed; zero browser runtime errors                    |
| Focused browser edge cases                       | 7 checkpoints passed                                                  |
| Responsive route matrix                          | 40 checks passed: 10 routes at 320, 390, 768 and 1440 pixels          |
| LAN HTTP mobile-viewport checkout                | Passed at http://192.168.31.125:3000                                  |
| Seeded food images                               | 30 distinct local licensed images; all decode/load; zero placeholders |
| Optimized WebP asset size                        | 1,518,932 bytes total                                                 |
| Dependency audit after patching lint tooling     | Zero vulnerabilities reported by npm                                  |

## Integrated browser walkthrough

- Logo reveal and 30 seeded dishes
- All categories and description search
- Cart, checkout, duplicate prevention and immediate vendor synchronization
- Live preparing/ready tracking, uninterrupted game progress, once-only reward claim
- Food Memory Match completed all six pairs
- Tic-Tac-Toe computer round and restart; reflex early tap, signal and reaction stats
- Completed value, daily report and CSV download
- Simulated online preference, second eligible claim and 100-point voucher redemption
- Shared menu edits, price updates and live availability
- Vendor dish creation and archive synchronize across tabs
- All ten routes without horizontal overflow at 320, 390, 768 and 1440 pixels
- Every displayed dish photograph loads
- Order and reward persistence after reload
- Corrupted storage preserved with recoverable error and confirmed reset
- No browser runtime errors

## Additional edge cases

- Reduced-motion welcome and replay respect the preference
- Accessible modal Escape closes and returns keyboard focus
- Broken image fallback, upload size validation and valid replacement recover live
- Quantity zero removes the item and clears the cart
- Closed restaurant rejects checkout; eligible cancellation updates tracking and blocks rewards
- Reset dismissal preserves data; confirmed reset restores seed across tabs
- Unknown order state and all thirty accessible photo credit entries

## Unit coverage

Cart totals, quantity limits and removal; immutable order snapshots; duplicate-submission protection; missing name and empty-cart rejection; unavailable/archived dishes and restaurant closure; sequential status transitions and eligible cancellations; Asia/Kolkata midnight boundaries; daily counts and completed value; ready/completed reward eligibility, repeated-claim rejection and voucher redemption; tic-tac-toe lines, draw and computer moves; six distinct memory pairs; schema validation and non-destructive version-0 migration; unique UUID creation without secure-context randomUUID; and all 30 local image assets and attribution records.

## Image review

Each photo was checked in a labelled contact sheet and its file metadata/licensing inspected. Wrong-dish candidates were rejected and replaced before the seed was connected to the final assets. Photographs are illustrative: they are not photographs of a real Deccan Table kitchen. The Alfredo photo shows white-sauce fettuccine, and the seed description correctly says pasta rather than penne. Recipe and plating variations are disclosed on `/credits`.

Next.js Image loads the optimized local WebP files. Every displayed photograph was scrolled into view and decoded during the final walkthrough. Broken images and uploaded-image recovery were also tested separately. Original files, source URLs, authors, individual licenses and resize/compression notes are retained in `public/images/dishes/credits.json` and displayed at `/credits`.

## Desktop/mobile artifacts

- `test-results/browser-results.json`: final integrated browser results.
- `test-results/edge-results.json`: focused edge-case results.
- `test-results/responsive-results.json`: the 40-route viewport matrix.
- `test-results/menu-desktop.png`, `vendor-desktop.png`, `games-desktop.png`: walkthrough screenshots.
- `test-results/menu-mobile.png`: full mobile menu.
- `test-results/*-mobile-viewport.png`: mobile viewport review captures.
- `test-results/daily-orders.csv`: downloaded daily export.
- `public/images/contact-sheet.jpg`: all 30 original photo candidates retained in the final seed, labelled by dish ID.

## Scope and limits

The LAN checkout was verified in a browser with `isSecureContext === false` and `crypto.randomUUID === undefined`; order creation still succeeded using `crypto.getRandomValues`. Next.js allows the laptop's current local IPv4 hosts in development so its development connection works over Wi-Fi. The laptop's current Wi-Fi address is `192.168.31.125`; it can change after reconnecting to another network.

The server already running in this workspace at port 3000 was reused and left running. No hosted deployment was created.

Browser storage is device/profile/origin-local. The walkthrough verifies customer/vendor synchronization across two tabs sharing one origin, not synchronization between different devices. Firebase, authentication, real payments, WhatsApp notifications and real vouchers remain unconnected as requested. Reward integrity and authorization require server enforcement before production. Audio activation and incoming-order handling were exercised; a human listening test was not performed in the headless browser.
