# Deploying Rules (DHL-Raffle)

This app must be developed, committed, and deployed **only** from `DHL-Raffle`.

## Source of truth

- Repository: `CaretakerGob/DHL-Raffle`
- App directory: repository root (`package.json` is here)
- Firebase App Hosting build target: `DHL-Raffle` (monorepo-safe guard)

## Commit rules

- Make commits only in the `DHL-Raffle` repository.
- Do not commit deploy-related files from parent repo `DHL`.
- In VS Code Source Control, use the `DHL-Raffle` repo section for commits.

## Deploy rules

- GitHub Actions deploy workflow is: `.github/workflows/firebase-deploy.yml`.
- Workflow has a hard guard: it must run from `CaretakerGob/DHL-Raffle`.
- Workflow validates app root before App Hosting deploy.

## Quick checks before push/deploy

Run from `DHL-Raffle`:

```bash
git rev-parse --show-toplevel
git status --short
```

Expected top-level path ends with `DHL-Raffle`.

## If deploy fails with "package.json not found"

- Confirm Firebase App Hosting backend root directory is set to `DHL-Raffle`.
- Confirm workflow guard passes in Actions logs.
