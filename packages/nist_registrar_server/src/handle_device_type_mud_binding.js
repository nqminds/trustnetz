
export default async function handleDeviceTypeMudBinding(claimData, dbGet, dbRun) {
  const {deviceType, mud, issuanceDate} = claimData;
  let deviceTypeId = null;
  let mudId = null;
  const deviceTypeRow = await dbGet("SELECT id from device_type where id = ? OR name = ?", [deviceType, deviceType])
  if (!deviceTypeRow) {
    return `No device type with id or name ${deviceType}`;
  } else {
    deviceTypeId = deviceTypeRow.id;
  }
  const mudRow = await dbGet("SELECT id from mud where id = ? OR name = ?", [mud, mud])
  if (!mudRow) {
    return `No mud with id ${mud}`;
  } else {
    mudId = mudRow.id;
  }
  let has_mud = await dbGet("SELECT * from has_mud WHERE device_type_id = ? AND mud_id = ?", [deviceTypeId, mudId]);
  if (has_mud) {
    return `device type ${deviceType} already bound to mud ${mud}`;
  } else {
    await dbRun("DELETE FROM has_mud where device_type_id = ?", [deviceTypeId]);
    await dbRun("INSERT INTO has_mud (device_type_id, mud_id) VALUES (?, ?)", [deviceTypeId, mudId]);
    return `device type ${deviceType} is now bound to mud ${mud}`;
  }
}
