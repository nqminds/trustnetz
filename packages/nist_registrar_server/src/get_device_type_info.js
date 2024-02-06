const demoVulnerableSbomId = '9062a818-a03d-4fef-b570-593e62d01681';

export default async function getDeviceTypeInfo(deviceType, dbGet) {
  let deviceTypeId = null;
  const deviceTypeRow = await dbGet("SELECT id, name from device_type where id = ? OR name = ?", [deviceType, deviceType])
  if (!deviceTypeRow) {
    return `No device type with id or name ${deviceType}`;
  } else {
    deviceTypeId = deviceTypeRow.id;
  }
  const has_demo_sbom = await dbGet("SELECT * from has_sbom WHERE device_type_id = ? AND sbom_id = ?", [deviceTypeId, demoVulnerableSbomId]);
  const deviceTypeData = {name: deviceTypeRow.name, vulnerable: Boolean(has_demo_sbom)};
  return deviceTypeData;
}