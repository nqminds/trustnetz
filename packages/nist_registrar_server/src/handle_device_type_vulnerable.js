const demoVulnerabilityId = '9dce9345-e306-4786-b7f0-536827351d21';

export default async function handleDeviceTypeVulnerable(claimData, dbGet, dbRun) {
  const {deviceType, vulnerable, issuanceDate} = claimData;
  let deviceTypeId = null;
  const deviceTypeRow = await dbGet("SELECT id from device_type where id = ? OR name = ?", [deviceType, deviceType])
  if (!deviceTypeRow) {
    console.log(`No device type found for ID or name: ${deviceType}`);
    return `No device type with id or name ${deviceType}`;
  } else {
    deviceTypeId = deviceTypeRow.id;
  }
  const demoVulnerability = await dbGet("SELECT id from vulnerability where id = ?", [demoVulnerabilityId]);
  if (!demoVulnerability) {
    await dbRun("INSERT INTO vulnerability (id, name, severity, url, created_at) VALUES (?, ?, ?, ?, ?)", [demoVulnerabilityId, 'Security Flaw',	'Critical',	'https://example.com', '2024-01-16 14:13:55.849160']);
  }
  const has_demo_vulnerability = await dbGet("SELECT * from has_vulnerability WHERE device_type_id = ? AND vulnerability_id = ?", [deviceTypeId, demoVulnerabilityId]);
  console.log("has_demo_vuln: ", has_demo_vulnerability);
  if (vulnerable) {
    if (has_demo_vulnerability) {
      return `device type ${deviceType} is already classified as vulnerable`;
    } else {
      await dbRun("INSERT INTO has_vulnerability (device_type_id, vulnerability_id) VALUES (?, ?)",
        [deviceTypeId, demoVulnerabilityId]);
      return `device type ${deviceType} is now classified as vulnerable`;
    }
  } else {
    if (has_demo_vulnerability) {
      await dbRun("DELETE FROM has_vulnerability WHERE (device_type_id = ? AND vulnerability_id = ?)",
        [deviceTypeId, demoVulnerabilityId]);
      return `device type ${deviceType} is now no longer vulnerable`;
    } else {
      return `device type ${deviceType} has already been classified not vulnerable`;
    }
  }
}
