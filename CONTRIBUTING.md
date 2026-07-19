# Contributing

## Releasing (Changesets)

This project uses [Changesets](https://github.com/changesets/changesets) to
version and publish `jsbuffer` to npm. Releases are automated — you never run
`npm publish` by hand.

### When you open a PR

If your change should be released (anything that affects published code — a
fix, a feature, a breaking change), add a changeset:

```bash
npx changeset
```

Pick the bump type and write a short, user-facing summary:

- **patch** — bug fixes, internal changes that don't alter the API
- **minor** — backwards-compatible new features
- **major** — breaking changes

This creates a markdown file under `.changeset/`. Commit it with your PR.
Docs-only or CI-only PRs don't need a changeset.

### What happens after merge

On every push to `master`, the [Release workflow](.github/workflows/release.yml)
runs Changesets, which:

1. **Collects** pending changesets into a **"Version Packages" PR** that bumps
   the version in `package.json` and updates `CHANGELOG.md`.
2. **Publishes** to npm (plus a git tag and GitHub release) once that
   "Version Packages" PR is merged.

So a release is two merges: your feature PR (with its changeset), then the
auto-generated version PR.

### Maintainer setup (one-time)

- Add an npm **Automation** access token as the `NPM_TOKEN` repo secret.
- In **Settings → Actions → General → Workflow permissions**, enable
  **"Allow GitHub Actions to create and approve pull requests"**.
