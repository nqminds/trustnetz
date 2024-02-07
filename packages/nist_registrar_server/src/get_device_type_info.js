const demoSafeSbomId = 'e944293e-8ee8-416d-8063-44ae588058b6';

export default async function getDeviceTypeInfo(deviceType, dbGet) {
  let deviceTypeId = null;
  const deviceTypeRow = await dbGet("SELECT id, name from device_type where id = ? OR name = ?", [deviceType, deviceType])
  if (!deviceTypeRow) {
    return `No device type with id or name ${deviceType}`;
  } else {
    deviceTypeId = deviceTypeRow.id;
  }
  const has_safe_sbom = await dbGet("SELECT * from has_sbom WHERE device_type_id = ? AND sbom_id = ?", [deviceTypeId, demoSafeSbomId]);
  const deviceTypeData = {name: deviceTypeRow.name, vulnerable: !Boolean(has_safe_sbom)};
  return deviceTypeData;
}