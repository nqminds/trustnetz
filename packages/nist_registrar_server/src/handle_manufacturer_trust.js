export default async function handle_manufacturer_trust(claimData, dbGet, dbRun) {
  const {user, manufacturer, trust, issuanceDate} = claimData;
  let manufacturerId = null;
  console.log(`manufacturer: ${manufacturer}`)
  const manufacturerRow = await dbGet("SELECT id from manufacturer where id = ? OR name = ?", [manufacturer, manufacturer])
  if (!manufacturerRow) {
    console.log(`No manufacturer found for ID or name: ${manufacturer}`);
    return `No manufacturer with id or name ${manufacturer}`;
  } else {
    manufacturerId = manufacturerRow.id;
  }
  let userId = null;
  const userRow = await dbGet("SELECT id from user where id = ? OR username = ?", [user, user])
  if (!userRow) {
    console.log(`No user found for ID or name: ${user}`);
    return `No user with id or name ${user}`;
  } else {
    userId = userRow.id;
  }
  const trustRow = await dbGet("SELECT * from trusts WHERE user_id = ? AND manufacturer_id = ?", [userId, manufacturerId])
  if (trust) {
    if (!trustRow) {
      await dbRun("INSERT INTO trusts (user_id, manufacturer_id, created_at) VALUES (?, ?, ?)",
        [userId, manufacturerId, issuanceDate]);
      return `Trust added to manufacturer ${manufacturer} by user ${user}`;
    } else {
      return `Manufacturer ${manufacturer} is already trusted by user ${user}`;
    }
  } else {
    if (!trustRow) {
      return `Manufacturer ${manufacturer} is not trusted by user ${user}`;
    } else {
      await dbRun("DELETE FROM trusts WHERE user_id = ? AND manufacturer_id = ?", [userId, manufacturerId]);
      return `Trust removed from manufacturer ${manufacturer} by user ${user}`;
    }
  }
}
