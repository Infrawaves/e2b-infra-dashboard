# Buildkite CI

`pipeline.yml` mirrors the GitHub Actions in `.github/workflows/`:

| Step | Script | GHA equivalent |
| --- | --- | --- |
| Lint | `biome ci --linter-enabled` | `code-quality.yml` → lint |
| Knip | `bun run knip:ci` | `code-quality.yml` → knip |
| Unit Tests | `bun run test:unit` | `test.yml` → unit-tests |
| Integration Tests | `bun run test:integration` | `test.yml` → integration-tests |
| Build | `bun run build` | (new) |

Every step runs inside the pinned `oven/bun:1.2.20` image via the Docker
plugin, so agents only need Docker installed.

## One-time Buildkite setup

1. **Create the pipeline** (org owner):
   - Buildkite → *Add Pipeline* → connect the `Infrawaves/e2b-infra-dashboard`
     GitHub repo.
   - Under *Steps*, use the default `buildkite-agent pipeline upload` so it reads
     this `.buildkite/pipeline.yml` from the repo.

2. **Agents**: register at least one agent with Docker available. On the agent
   host, pre-create the shared Bun cache dir so the volume mount works:
   ```sh
   sudo mkdir -p /var/cache/buildkite-bun && sudo chown buildkite-agent /var/cache/buildkite-bun
   ```

3. **GitHub webhook**: enabled automatically when you connect the repo through
   the Buildkite GitHub App. Builds then trigger on push + pull request.

4. **Branch protection** (optional): in GitHub → *Settings → Branches* add the
   Buildkite status check as required for `main`.

## Secrets

The integration + build steps use throwaway test values (matching the GHA
workflow) that are safe to keep in `pipeline.yml`. If you later need real
secrets, inject them via the
[buildkite-agent secrets](https://buildkite.com/docs/pipelines/security/secrets)
or an env hook on the agent — do NOT commit real secrets here.
