# Free hosting on GitHub Pages

This is the existing Deccan Table application exported as static HTML, JavaScript, CSS and local images. No Next.js server, payment provider, Firebase or paid hosting is needed.

## Enable hosting

1. Create a **public** GitHub repository named **deccan-table-demo** for hosting with GitHub Free.
2. Commit and push this project, including `package-lock.json`, `public/` and `.github/workflows/deploy-pages.yml`, to its `main` branch. Do not commit `node_modules`, `.next`, `out` or local test artifacts. If your default branch has a different name, update the workflow's `push.branches` setting.
3. In the GitHub repository, open **Settings > Pages**.
4. Under **Build and deployment > Source**, select **GitHub Actions**. There is no branch or `/docs` publishing folder to select for this workflow.
5. Open **Actions > Deploy Deccan Table to GitHub Pages > Run workflow**, or push a new commit to `main`.
6. After the build and deployment jobs succeed, open **https://YOUR_USERNAME.github.io/deccan-table-demo/**. GitHub also shows the deployed URL on Settings > Pages and in the `github-pages` environment.

The workflow installs the lockfile dependencies with `npm ci`, checks TypeScript and ESLint, runs the tests, builds the static export, uploads `out` and deploys it using GitHub's official Pages actions. Its deploy job uses only `pages: write` and `id-token: write`; no personal access token or repository secret is required. If your organization restricts Actions or environments, permit this workflow and its `github-pages` environment in your repository settings.

Do not upload `out` manually or use `next start`. No deployment has been performed from this workspace; the included workflow runs after you push the project to your GitHub repository.

## Routes

| Experience        | Hosted path                                  |
| ----------------- | -------------------------------------------- |
| Landing           | `/deccan-table-demo/`                        |
| Customer menu     | `/deccan-table-demo/menu/`                   |
| Cart              | `/deccan-table-demo/cart/`                   |
| Tracking          | `/deccan-table-demo/order/?id=ORDER_ID`      |
| Games and rewards | `/deccan-table-demo/order/play/?id=ORDER_ID` |
| Vendor            | `/deccan-table-demo/vendor/`                 |
| Live orders       | `/deccan-table-demo/vendor/orders/`          |
| Menu studio       | `/deccan-table-demo/vendor/menu/`            |
| Reports           | `/deccan-table-demo/vendor/reports/`         |
| Settings and logo | `/deccan-table-demo/vendor/settings/`        |

Orders still have unique internal IDs and customer tokens. Only the URL shape changed: IDs are read in the browser from the `id` query parameter. Both tracking pages are prebuilt static pages, so directly opening or refreshing their query URLs does not require server routing. Opening either page without an ID uses the browser's current order, if one exists. Old `/order/UUID` bookmarks must be replaced with the new query URLs.

## Run and verify locally

```sh
npm install
npm run dev
```

Development: **http://localhost:3000/deccan-table-demo/**. The root without the repository prefix is no longer the app URL.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

Static preview: **http://localhost:4173/deccan-table-demo/**. `npm start` is also a static preview alias. The preview serves only the files in `out`, mounts them at the repository path, and does not provide a Next.js runtime or SPA fallback. Set `PORT` to change its port.

To run the full browser walkthrough against the exported files in PowerShell, with the preview already running:

```powershell
$env:DEMO_ORIGIN='http://localhost:4173/deccan-table-demo'
npm run test:browser
node scripts/edge-browser-check.mjs
node scripts/responsive-check.mjs
node scripts/static-export-check.mjs
```

## Export configuration and assets

- `output: "export"` writes the deployable site into `out`.
- `basePath: "/deccan-table-demo"` is shared with the path helpers in `src/lib/utils/paths.ts`.
- `trailingSlash: true` creates `index.html` inside each route folder so GitHub Pages can resolve direct route visits.
- `images.unoptimized: true` disables Next.js server image processing. The existing optimized local WebP photos remain in use.
- Next Link/router add the base path automatically. Local public image sources are prefixed at rendering time, including references loaded from older localStorage saves. Data-URL photo/logo uploads are left intact.
- `.nojekyll` is copied from `public` so `_next` assets are served as static files.

If you rename the repository, change `BASE_PATH` in `src/lib/utils/paths.ts` and the matching base in `scripts/serve-static.mjs`, then rebuild. Update the browser-test base URL and these instructions as needed. `basePath` is compiled into the export.

## Demo persistence and public access

All existing customer, vendor, game, reward, menu-photo and restaurant-logo features remain browser-local. GitHub Pages does **not** synchronize orders across devices or add authentication. Vendor pages remain public demo pages.

Localhost data does not transfer automatically to `YOUR_USERNAME.github.io`: localStorage belongs to a browser origin. Your existing localhost data is not deleted. The first visit to the hosted origin initializes a separate demo. Customer and vendor tabs on the same hosted origin still update each other immediately.

No real payment processing, WhatsApp notifications, server reward validation or external database is connected.

Official references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
