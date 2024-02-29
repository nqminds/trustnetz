export default async function getMudInfo(mud, dbGet) {
  const mudRow = await dbGet("SELECT id, name, mud from mud where id = ? OR name = ?", [mud, mud])
  if (!mudRow) {
    return `No device with id or name ${device}`;
  } else {
    return mudRow;
  }
}
