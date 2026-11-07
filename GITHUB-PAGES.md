# Free hosting on GitHub Pages

This is the existing Deccan Table application exported as static HTML, JavaScript, CSS and local images. No Next.js server, payment provider, Firebase or paid hosting is needed.

## Enable hosting

1. Create a **public** GitHub repository named **deccan-table-demo** for hosting with GitHub Free.
2. Commit and push this project, including `package-lock.json`, `public/` and `.github/workflows/deploy-pages.yml`, to its `main` branch. Do not commit `node_modules`, `.next`, `out` or local test artifacts. If your default branch has a different name, update the workflow's `push.branches` setting.
3. In the GitHub repository, open **Settings > Pages**.
4. Under **Build and deployment > Source**, select **GitHub Actions**. There is no branch or `/docs` publishing folder to select for this workflow.
5. Open **Actions > Deploy Deccan Table to GitHub Pages > Run workflow**, or push a new commit to `main`.
6. After the build and deployment jobs succeed, open **https://YOUR_USERNAME.github.io/deccan-table-demo/**. GitHub also shows the deployed URL on Settings > Pages and in the `github-pages` environment.

The workflow installs the lockfile dependencies with `npm ci`, checks TypeScript and ESLint, runs the tests, builds the static export, uploads `out` and deploys it using GitHub's official Pages actions. The workflow grants `contents: read`, `pages: write` and `id-token: write` to its jobs. After manually enabling Pages, no personal access token or repository secret is required. If your organization restricts Actions or environments, permit this workflow and its `github-pages` environment in your repository settings.

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

## Fixing `Get Pages site failed` / HTTP 404

A successful application build does not automatically create a GitHub Pages site. The normal setup requires a repository administrator to open **Settings > Pages** and select **GitHub Actions** under **Build and deployment > Source**, then rerun the workflow. For GitHub Free, use a public repository. Confirm the repository is named `deccan-table-demo` and the workflow is on `main` (or adjust its branch filter).

The workflow now grants `contents: read`, `pages: write` and `id-token: write` without job-level overrides that reduce them. If an organization policy blocks Pages, official Actions, or the `github-pages` environment, an administrator must allow them. If the environment requires approval or restricts deployment branches, approve the deployment or allow `main` under **Settings > Environments > github-pages**.

### Optional automatic initialization

`actions/configure-pages@v5` explicitly documents that its `enablement` option needs a token **other than `GITHUB_TOKEN`** to create a Pages site. Setting `enablement: true` with the default token alone is therefore not a reliable fix.

If you want the workflow to initialize Pages automatically, add an authorized setup token as a repository Actions secret named **PAGES_SETUP_TOKEN** under **Settings > Secrets and variables > Actions**. Scope it to this repository and grant the permissions required to create a Pages site: a suitable classic PAT with `repo` scope, or a suitable fine-grained/GitHub App token with Pages write and Administration write permissions. The account or app must be authorized to manage the repository's Pages settings. Do not put the token in a file or commit it.

When this secret is present, the existing workflow passes it to `configure-pages` and evaluates `enablement` to **true**. When absent, it uses `github.token` and leaves initialization off; manually enable Pages as described above. Actual deployment always uses the workflow's normal GitHub token. You do not need to create this secret if you use manual setup.

This workspace change does not modify your live GitHub repository settings or trigger deployment. Push the updated workflow, enable Pages manually or provide the optional setup secret, and rerun **Actions > Deploy Deccan Table to GitHub Pages**.

Action's enablement/token contract: https://github.com/actions/configure-pages/blob/v5/action.yml
