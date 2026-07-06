// This module is intentionally disabled.
// The earlier vendor GLB layer loaded uncurated low-poly assets at inconsistent scales and made the scene look worse.
// Keep the file as a safe no-op so old imports do not break, but do not install any world dressing from here.

export function installVendorAssetLayer() {
  return false;
}
