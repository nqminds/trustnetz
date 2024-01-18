export default async function getManufacturerInfo(manufacturer, dbGet) {
  let manufacturerId = null;
  let trusted = false;
  let trustingUser = null;
  const manufacturerRow = await dbGet("SELECT id, name from manufacturer where id = ? OR name = ?", [manufacturer, manufacturer]);
  if (!manufacturerRow) {
    console.log(`No manufacturer found for ID or name: ${manufacturer}`);
    return `No manufacturer with id or name ${manufacturer}`;
  } else {
    manufacturerId = manufacturerRow.id;
  }
  const trustRow = await dbGet("SELECT * from trusts WHERE manufacturer_id = ?", [manufacturerId])
  if (trustRow) {
    trusted = true;
    const userId = trustRow.user_id;
    const user = await dbGet("SELECT * from user WHERE id = ?", [userId]);
    trustingUser = user.name;
  }
  const manufacturerData = {name: manufacturerRow.name, trusted, trustingUser};
  return manufacturerData;
}