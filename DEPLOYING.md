# Deploying Rules (DHL-Raffle-git)

This app must be developed, committed, and deployed **only** from `DHL-Raffle-git`.

## Source of truth

- Repository: `CaretakerGob/DHL-Raffle-git`
- App directory: repository root (`package.json` is here)
- Firebase App Hosting build target: `DHL-Raffle-git` (monorepo-safe guard)

## Commit rules

- Make commits only in the `DHL-Raffle-git` repository.
- Do not commit deploy-related files from parent repo `DHL`.
- In VS Code Source Control, use the `DHL-Raffle-git` repo section for commits.

## Deploy rules

- GitHub Actions deploy workflow is: `.github/workflows/firebase-deploy.yml`.
- Workflow has a hard guard: it must run from `CaretakerGob/DHL-Raffle-git`.
- Workflow validates app root before App Hosting deploy.

## Quick checks before push/deploy

Run from `DHL-Raffle-git`:

```bash
git rev-parse --show-toplevel
git status --short
```

Expected top-level path ends with `DHL-Raffle-git`.

## If deploy fails with "package.json not found"

- Confirm Firebase App Hosting backend root directory is set to `DHL-Raffle-git`.
- Confirm workflow guard passes in Actions logs.
