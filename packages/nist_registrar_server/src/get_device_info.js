import getDeviceTypeInfo from "./get_device_type_info.js";

export default async function getDeviceInfo(device, dbGet) {
  let deviceId = null;
  let vulnerable = null;
  let deviceType = null;
  let trustingUser = null;
  const deviceRow = await dbGet("SELECT id, name from device where id = ? OR name = ?", [device, device])
  if (!deviceRow) {
    console.log(`No device found for ID or name: ${device}`);
    return `No device with id or name ${device}`;
  } else {
    deviceId = deviceRow.id;
  }
  const isOfTypeRow = await dbGet("SELECT * from is_of_type WHERE device_id = ?", [deviceId])
  if (isOfTypeRow) {
    const boundTypeId = isOfTypeRow.device_type_id;
    const deviceTypeInfo = await getDeviceTypeInfo(boundTypeId, dbGet);
    deviceType = deviceTypeInfo.name;
    vulnerable = deviceTypeInfo.vulnerable;
  }
  const trustRow = await dbGet("SELECT * from allow_to_connect WHERE device_id = ?", [deviceId])
  if (trustRow) {
    const userRow = await dbGet("SELECT username from user where id = ?", [trustRow.authoriser_id]);
    trustingUser = userRow.username;
  }
  const manufacturerData = {name: deviceRow.name, deviceType, vulnerable, trusted: Boolean(trustRow), trustingUser};
  return manufacturerData;
}
