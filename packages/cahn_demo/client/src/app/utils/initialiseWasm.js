async function initializeWasm() {
  if (window.gen_keys && window.VerifiableCredential) return;
  const {
    default: init,
    gen_keys,
    VerifiableCredential,
  } = await import("@/app/wasm/vc_signing");
  await init();
  console.log("WASM Module initialized");
  // Store functions for later use

  window.gen_keys = gen_keys;
  window.VerifiableCredential = VerifiableCredential;
}

export default initializeWasm;
