const demoVulnerabilityId = '9dce9345-e306-4786-b7f0-536827351d21';

export default async function getDeviceTypeInfo(deviceType, dbGet) {
  let deviceTypeId = null;
  const deviceTypeRow = await dbGet("SELECT id, name from device_type where id = ? OR name = ?", [deviceType, deviceType])
  if (!deviceTypeRow) {
    return `No device type with id or name ${deviceType}`;
  } else {
    deviceTypeId = deviceTypeRow.id;
  }
  const has_demo_vulnerability = await dbGet("SELECT * from has_vulnerability WHERE device_type_id = ? AND vulnerability_id = ?", [deviceTypeId, demoVulnerabilityId]);
  const deviceTypeData = {name: deviceTypeRow.name, vulnerable: Boolean(has_demo_vulnerability)};
  return deviceTypeData;
}