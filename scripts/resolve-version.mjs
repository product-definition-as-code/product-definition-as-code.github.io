// Resolve the current stable @prodshape/cli version.
// Prefers PRODSHAPE_VERSION, set when the productshape release workflow
// triggers this build via repository_dispatch. Falls back to the npm
// registry's dist-tags.latest for any other trigger (push, workflow_dispatch,
// the spec repo's spec-updated dispatch, local runs).
import { fileURLToPath } from 'node:url';

const REGISTRY_URL = 'https://registry.npmjs.org/@prodshape/cli';

export async function resolveVersion(env = process.env) {
  if (env.PRODSHAPE_VERSION) return env.PRODSHAPE_VERSION;

  const res = await fetch(REGISTRY_URL);
  if (!res.ok) {
    throw new Error(`npm registry request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const version = data['dist-tags'] && data['dist-tags'].latest;
  if (!version) {
    throw new Error('npm registry response is missing dist-tags.latest');
  }
  return version;
}

// Standalone usage: node scripts/resolve-version.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const version = await resolveVersion();
  console.log(version);
}
