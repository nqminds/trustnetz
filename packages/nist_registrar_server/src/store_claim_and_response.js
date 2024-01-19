export default async function storeClaimAndResponse(claimData, handlerResponse, dbGet, dbRun) {
  const vcLog = await dbGet("SELECT name FROM sqlite_master WHERE type='table' AND name= ?", ['vc_log']);
  if (!vcLog) {
    await dbRun("CREATE TABLE vc_log (log TEXT)");
  }
  const log = `claim: ${JSON.stringify(claimData)}, response: ${handlerResponse}`;
  await dbRun("INSERT INTO vc_log (log) VALUES (?)", [log]);
  return;
}