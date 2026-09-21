# MFD Token Sync

Local Figma Design plugin for the one-way repository-to-Figma token workflow. The generated
`packages/tokens/dist/figma/variables.json` manifest is the only accepted source. The plugin does
not fetch data, publish libraries, or write token changes back to the repository.

## Build and load

~~~sh
corepack pnpm --filter @mflisikowski/figma-token-sync build
~~~

In the Figma desktop app, choose **Plugins → Development → Import plugin from manifest…** and
select `tools/figma-token-sync/manifest.json`. The development-only manifest ID keeps plugin data
stable for this local installation; create a Figma-assigned ID before any future distribution.

## Workflow

1. Build tokens with `corepack pnpm --filter @mflisikowski/tokens build`.
2. Open the plugin in the DS Core Library file.
3. Choose `packages/tokens/dist/figma/variables.json` and run **Check**.
4. Review the complete create, update, unchanged, conflict, and stale report.
5. Run **Apply repository values**. Apply creates and updates only MFD-managed entries. A managed
   conflict resolves to the repository value; an unmanaged name collision blocks Apply.
6. If stale managed entries are expected, choose **Prune stale**, type `PRUNE`, and confirm the
   separate destructive operation.
7. Review representative variables in all four color modes and both density modes. Publishing the
   library remains a separate manual owner action.

Canonical token paths are stored as plugin data and remain the identity across Figma object IDs.
Each applied variable stores its repository snapshot fingerprint so Check can distinguish a normal
repository update from direct Figma drift. The root records the manifest schema version, source
revision, and content hash after a successful mutating operation.
