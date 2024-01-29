import getDeviceTypeInfo from "./get_device_type_info.js";
import getManufacturerInfo from "./get_manufacturer_info.js";

export default async function getDeviceInfo(device, dbGet) {
  let deviceId = null;
  let vulnerable = null;
  let deviceType = null;
  let trustingUser = null;
  let manufacturer = null;
  let manufacturerTrusted = null;
  const deviceRow = await dbGet("SELECT id, name from device where id = ? OR name = ?", [device, device])
  if (!deviceRow) {
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
  const manufacturedByRow = await dbGet("SELECT manufacturer_id from manufactured where device_id =?", [deviceId]);
  if (manufacturedByRow) {
    const manufacturer_id = manufacturedByRow.manufacturer_id;
    const manufacturerInfo = await getManufacturerInfo(manufacturer_id, dbGet);
    manufacturer = manufacturerInfo.name;
    manufacturerTrusted = manufacturerInfo.trusted;
  } else {
    // THIS IS PURELY HERE FOR THE DEMO, AS THE RUST CODE HAD A BUG AND WAS NOT INSERTING A MANUFACTURED ENTRY
    const manufacturerInfo = await getManufacturerInfo("manufacturer", dbGet);
    manufacturer = manufacturerInfo.name;
    manufacturerTrusted = manufacturerInfo.trusted;
  }
  const trustRow = await dbGet("SELECT * from allow_to_connect WHERE device_id = ?", [deviceId])
  if (trustRow) {
    const userRow = await dbGet("SELECT username from user where id = ?", [trustRow.authoriser_id]);
    trustingUser = userRow.username;
  }
  const deviceData = {name: deviceRow.name, manufacturer, manufacturerTrusted, deviceType, vulnerable, trusted: Boolean(trustRow), trustingUser};
  return deviceData;
}
