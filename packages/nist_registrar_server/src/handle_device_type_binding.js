export default async function handleDeviceTypeBinding(claimData, dbGet, dbRun) {
  const {device, deviceType, issuanceDate} = claimData;
  let deviceId = null;
  console.log(`device: ${device}`)
  const deviceRow = await dbGet("SELECT id from device where id = ? OR name = ?", [device, device])
  if (!deviceRow) {
    console.log(`No device found for ID or name: ${device}`);
    return `No device with id or name ${device}`;
  } else {
    deviceId = deviceRow.id;
  }
  let deviceTypeId = null;
  const deviceTypeRow = await dbGet("SELECT id from device_type where id = ? OR name = ?", [deviceType, deviceType])
  if (!deviceTypeRow) {
    console.log(`No device type found for ID or name: ${deviceType}`);
    return `No device type with id or name ${deviceType}`;
  } else {
    deviceTypeId = deviceTypeRow.id;
  }
  const isOfTypeRow = await dbGet("SELECT * from is_of_type WHERE device_type_id = ? AND device_id = ?", [deviceTypeId, deviceId])
  if (isOfTypeRow) {
    return `device ${device} is already bound to type deviceType ${deviceType}`;
  } else {
    await dbRun("DELETE FROM is_of_type WHERE device_id = ?", [deviceId]); // delete any old type bindings
    await dbRun("INSERT INTO is_of_type (device_type_id, device_id) VALUES (?, ?)", [deviceTypeId, deviceId]); // insert new type binding
    return `device ${device} bound to deviceType ${deviceType}`;
  }
}
