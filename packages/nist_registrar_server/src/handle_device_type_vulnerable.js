const demoVulnerableSbomId = '9062a818-a03d-4fef-b570-593e62d01681';

const vulnerableSbom = `
{
  "bomFormat": "CycloneDX",
  "components": [
    {
      "cpe": "cpe:/a:busybox:busybox:1.33.2",
      "group": "",
      "licenses": [
        {
          "license": {
            "name": "GPL-2.0-or-later"
          }
        }
      ],
      "name": "busybox",
      "supplier": {
        "name": "Organization: OpenWrt ()"
      },
      "type": "application",
      "version": "1.33.2"
    },
    {
      "cpe": "cpe:/a:thekelleys:dnsmasq:2.85",
      "group": "",
      "licenses": [
        {
          "license": {
            "name": "GPL-2.0"
          }
        }
      ],
      "name": "dnsmasq",
      "supplier": {
        "name": "Organization: OpenWrt ()"
      },
      "type": "application",
      "version": "2.85"
    },
    {
      "cpe": "cpe:/a:matt_johnston:dropbear_ssh_server:2020.81",
      "group": "",
      "licenses": [
        {
          "license": {
            "name": "MIT"
          }
        }
      ],
      "name": "dropbear",
      "supplier": {
        "name": "Organization: OpenWrt ()"
      },
      "type": "application",
      "version": "2020.81"
    },
    {
      "cpe": "cpe:/a:gnome:glib:2.66.4",
      "group": "",
      "licenses": [
        {
          "license": {
            "name": "LGPL-2.1-or-later"
          }
        }
      ],
      "name": "glib2",
      "supplier": {
        "name": "Organization: OpenWrt ()"
      },
      "type": "application",
      "version": "2.66.4"
    }
  ],
  "serialNumber": "urn:uuid:00000000-0000-0000-0000-000000000000",
  "specVersion": "1.4",
  "version": 1
}
`

export default async function handleDeviceTypeVulnerable(claimData, dbGet, dbRun) {
  const {deviceType, vulnerable, issuanceDate} = claimData;
  let deviceTypeId = null;
  const deviceTypeRow = await dbGet("SELECT id from device_type where id = ? OR name = ?", [deviceType, deviceType])
  if (!deviceTypeRow) {
    return `No device type with id or name ${deviceType}`;
  } else {
    deviceTypeId = deviceTypeRow.id;
  }
  const demoSbom = await dbGet("SELECT id from sbom where id = ?", [demoVulnerableSbomId]);
  if (!demoSbom) {
    await dbRun("INSERT INTO sbom (id, sbom, vulnerability_score, vulnerability_score_updated) VALUES (?, ?, ?, ?, ?)", [demoVulnerableSbomId, vulnerableSbom, '2024-02-05T16:21:27.870Z']);
  }
  const has_demo_sbom = await dbGet("SELECT * from has_sbom WHERE device_type_id = ? AND sbom_id = ?", [deviceTypeId, demoVulnerableSbomId]);
  if (vulnerable) {
    if (has_demo_sbom) {
      return `device type ${deviceType} is already classified as vulnerable`;
    } else {
      await dbRun("INSERT INTO has_sbom (device_type_id, sbom_id) VALUES (?, ?)",
        [deviceTypeId, demoVulnerableSbomId]);
      return `device type ${deviceType} is now classified as vulnerable`;
    }
  } else {
    if (has_demo_sbom) {
      await dbRun("DELETE FROM has_sbom WHERE (device_type_id = ? AND sbom_id = ?)",
        [deviceTypeId, demoVulnerableSbomId]);
      return `device type ${deviceType} is now no longer vulnerable`;
    } else {
      return `device type ${deviceType} has already been classified not vulnerable`;
    }
  }
}
