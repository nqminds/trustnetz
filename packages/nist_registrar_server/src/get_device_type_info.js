const demoSafeSbomId = 'e944293e-8ee8-416d-8063-44ae588058b6';
const VULNERABILITY_THRESHOLD = 6;

export default async function getDeviceTypeInfo(deviceType, dbGet) {
  let deviceTypeId = null;
  let sbomId = null;
  let sbomVulnerabilityScore = null;
  let sbomVulnerabilityScoreUpdated = null;
  let mudId = null;
  let mudName = null;
  const deviceTypeRow = await dbGet("SELECT id, name from device_type where id = ? OR name = ?", [deviceType, deviceType])
  if (!deviceTypeRow) {
    return `No device type with id or name ${deviceType}`;
  } else {
    deviceTypeId = deviceTypeRow.id;
  }
  const has_sbom = await dbGet("SELECT * from has_sbom WHERE device_type_id = ?", [deviceTypeId]);
  if (has_sbom) {
    const sbom = await dbGet("SELECT id, vulnerability_score, vulnerability_score_updated FROM sbom WHERE id = ?", [has_sbom.sbom_id]);
    sbomId = sbom.id;
    sbomVulnerabilityScore = sbom.vulnerability_score;
    sbomVulnerabilityScoreUpdated = sbom.vulnerability_score_updated;
  }
  const vulnerable = has_sbom ? sbomVulnerabilityScore > VULNERABILITY_THRESHOLD : true;
  const has_mud = await dbGet("SELECT * from has_mud WHERE device_type_id = ?", [deviceTypeId]);
  if (has_mud) {
    const mud = await dbGet("SELECT id, name FROM mud WHERE id = ?", [has_mud.mud_id]);
    mudId = mud.id;
    mudName = mud.name;
  }
  const deviceTypeData = {name: deviceTypeRow.name, sbomId, sbomVulnerabilityScore, vulnerable, sbomVulnerabilityScoreUpdated, mudId, mudName};
  return deviceTypeData;
}