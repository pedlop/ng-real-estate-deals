# ng-real-estate-deals

Angular 17 + Angular Material app for browsing and managing real estate deals.

## Tech stack

- Angular 17 (standalone components, lazy loaded routes)
- Angular Material
- RxJS
- `ngx-mask` for currency/number input masks
- Jest (`jest-preset-angular`) for unit testing
- GitHub Actions (CI + Pages deployment)

## Features

- Public deals page with:
  - Search by name
  - Min/Max purchase price filters
  - Reset filters
  - Sorting by columns
  - Highlighted search matches
- Deal form dialog with:
  - Masked currency inputs
  - Live cap-rate calculation
  - Validation and range hints
- Auth flow with login dialog and guard-protected admin area
- Admin table controls:
  - Edit/delete actions
  - Audit metadata columns (last updated at/by)
- Snackbar feedback for key actions
- Version badge in header (`vX.Y.Z`) sourced from `package.json`

## Project structure

```text
src/
  app/
    auth/
    core/
    features/
      deals/
      admin/
    models/
    shared/
  environments/
```

## Routing

Routes are defined in `src/app/app.routes.ts`:

- `/deals` (public)
- `/admin` (protected via `authGuard`)
- `/login` (dialog entry route)

The app uses hash-based routing (`withHashLocation()`) to avoid 404 refresh issues on GitHub Pages.

## Local data

This app uses `localStorage` as a mock backend:

- Deals key: `ng-real-estate-deals.deals`
- Auth key: `ng-real-estate-deals.auth.user`

If deals storage is empty, the app seeds a realistic initial dataset.

## Path aliases

Configured in `tsconfig.json`:

- `@core/*` -> `src/app/core/*`
- `@auth/*` -> `src/app/auth/*`
- `@shared/*` -> `src/app/shared/*`
- `@models/*` -> `src/app/models/*`
- `@environments/*` -> `src/environments/*`

Jest alias mapping is mirrored in `jest.config.js`.

## Environments and versioning

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Both expose `version`, loaded from `package.json`.

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 9+

## Getting started

Install dependencies:

```bash
npm ci
```

Run locally:

```bash
npm start
```

Open: `http://localhost:4200`

## Scripts

- `npm start` - serve app in development
- `npm run build` - production build
- `npm run watch` - development build in watch mode
- `npm run test` - run Jest tests (`--runInBand`)
- `npm run deploy` - deploy to GitHub Pages

## Testing

Jest is configured with:

- `jest.config.js`
- `setup-jest.ts`
- `tsconfig.spec.json`

Run tests:

```bash
npm test
```

## Deployment (GitHub Pages)

Manual deploy:

```bash
npm run deploy
```

This runs:

```bash
ng deploy --base-href=/ng-real-estate-deals/
```

Deployment target directory:

- `dist/ng-real-estate-deals/browser`

Live URL format:

- `https://<your-github-username>.github.io/ng-real-estate-deals/`

## CI/CD

### Pull request validation

Workflow: `.github/workflows/ci.yml`

Runs on PRs targeting `master` and `develop`:

- `npm ci`
- `npx ng lint`
- `npm run test`

### Auto deploy

Workflow: `.github/workflows/deploy.yml`

Runs on push to `master`:

- `npm ci`
- `ng build --configuration production --base-href=/ng-real-estate-deals/`
- Deploy via `peaceiris/actions-gh-pages`

## Troubleshooting

- **Stale local data:** clear localStorage keys listed above.
- **GitHub Pages route refresh issues:** app already uses hash routing.
- **Build budget warnings:** current Angular budget warns above default threshold; this is non-blocking unless converted to error.
