export default async function handle_device_trust(claimData, res, dbGet, dbRun) {
  const {user, device, trust, issuanceDate} = claimData;
  let deviceId = null;
  console.log(`device: ${device}`)
  const deviceRow = await dbGet("SELECT id from device where id = ? OR name = ?", [device, device])
  if (!deviceRow) {
    console.log(`No device found for ID or name: ${device}`);
    res.send(`No device with id or name ${device}`)
    return
  } else {
    deviceId = deviceRow.id;
  }
  let userId = null;
  const userRow = await dbGet("SELECT id from user where id = ? OR username = ?", [user, user])
  if (!userRow) {
    console.log(`No user found for ID or name: ${user}`);
    res.send(`No user with id or name ${user}`)
    return
  } else {
    userId = userRow.id;
  }
  const trustRow = await dbGet("SELECT * from allow_to_connect WHERE authoriser_id = ? AND device_id = ?", [userId, deviceId])
  if (trust) {
    if (!trustRow) {
      await dbRun("INSERT INTO allow_to_connect (authoriser_id, device_id) VALUES (?, ?)",
        [userId, deviceId]);
      res.send(`Trust added to device ${device} by user ${user}`)
    } else {
      res.send(`device ${device} is already trusted by user ${user}`)
    }
  } else {
    if (!trustRow) {
      res.send(`device ${device} is not trusted by user ${user}`)
    } else {
      await dbRun("DELETE FROM allow_to_connect WHERE authoriser_id = ? AND device_id = ?", [userId, deviceId]);
      res.send(`Trust removed from device ${device} by user ${user}`)
    }
  }
}
