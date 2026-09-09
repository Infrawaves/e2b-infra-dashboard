# Buildkite CI

`pipeline.yml` mirrors the GitHub Actions in `.github/workflows/`, plus a
build and an optional Playwright E2E step:

| Step | Script | GHA equivalent |
| --- | --- | --- |
| Lint | `biome ci --linter-enabled` | code-quality.yml → lint |
| Knip | `bun run knip:ci` | code-quality.yml → knip |
| Unit Tests | `bun run test:unit` | test.yml → unit-tests |
| Integration Tests | `bun run test:integration` | test.yml → integration-tests |
| Build | `bun run build` | (new) |
| E2E (pr) | `bun run e2e:test:pr` | (new, soft-fail) |

Every step runs inside the pinned Bun image via the Docker plugin, so agents
only need Docker.

## Tuning knobs (single source of truth)

Edit these two YAML anchors at the top of `pipeline.yml` — they propagate to
every step:

- `_bun_image: &bun_image "oven/bun:1.2.20"` — **Bun version**. Bump this one
  line to change the Bun/image tag everywhere.
- `_bun_cache: &bun_cache "/var/cache/buildkite-bun:/root/.bun/install/cache"`
  — **install-cache mount** (host path : container path).

## One-time Buildkite setup

1. **Create the pipeline**: Buildkite → *Add Pipeline* → connect
   `Infrawaves/e2b-infra-dashboard` via the Buildkite GitHub App. Keep the
   default `buildkite-agent pipeline upload` so it reads this file.
2. **Agents**: register at least one agent with Docker. Pre-create the shared
   Bun cache dir (the host side of `_bun_cache`):
   ```sh
   sudo mkdir -p /var/cache/buildkite-bun && sudo chown buildkite-agent /var/cache/buildkite-bun
   ```
3. **Webhook**: auto-configured by the GitHub App → builds on push + PR.
4. **Branch protection** (optional): require the Buildkite check on `main`.

## Secrets

- **Integration + Build** use throwaway test values (same as the GHA workflow),
  safe to keep in `pipeline.yml`.
- **E2E (pr)** is different — it targets a **deployed preview URL** and needs
  REAL values, so it is `soft_fail: true` and self-skips where
  `playwright.config.ts` is absent (e.g. current `main`). To enable it, inject
  via [agent secrets](https://buildkite.com/docs/pipelines/security/secrets) or
  an agent env hook (never commit these):
  - `PLAYWRIGHT_BASE_URL`  — deployed preview URL to test against
  - `TEST_USER_EMAIL`      — test account email
  - `TEST_USER_PASSWORD`   — test account password (min 8 chars)
  - `VERCEL_AUTOMATION_BYPASS_SECRET` — only if the preview is protected

  E2E also requires the app to actually have Playwright (the `e2e:test:pr`
  script + `playwright.config.ts`), which currently lives on the
  `feat-ory-oauth-integrate-hk` branch — the step activates once that lands on
  the branch being built.
