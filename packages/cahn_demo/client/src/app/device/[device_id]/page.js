"use client";
import {
  Typography,
  Box,
  Button,
  ButtonGroup,
  Paper,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import DeviceInfoTable from "../../components/DeviceInfoTable";
import withAuth from "@/app/utils/withAuth";

const Page = ({ params }) => {
  const [deviceData, setDeviceData] = useState({
    CreatedAtDevice: 0,
    DeviceId: "",
    Idevid: "",
    Name: "",
    CreatedAtDeviceType: 0,
    DeviceTypeId: "",
    DeviceType: "",
    CreatedAtManufactured: 0,
    ManufacturerId: "",
    CreatedAtManufacturer: 0,
    Manufacturer: "",
    CanConnect: false,
    CreatedAtUser: 0,
    UserId: "",
    Username: "",
    CanIssueDeviceTrust: false,
    CanIssueManufacturerTrust: false,
  });

  const privateKey = localStorage.getItem("privateKey");
  const emailAddress = localStorage.getItem("emailAddress");

  useEffect(() => {
    axios
      .get("http://localhost:3001/device/" + params.device_id)
      .then((res) => {
        setDeviceData(res.data);
      });

    async function initializeWasm() {
      const {
        default: init,
        gen_keys,
        VerifiableCredential,
      } = await import("../../wasm/vc_signing");
      await init();
      console.log("WASM Module initialized");

      // Store functions for later use
      window.gen_keys = gen_keys;
      window.VerifiableCredential = VerifiableCredential;
    }

    // If functions aren't already stored on the window object, initialize them
    // TODO: Extract initializeWasm to a separate file
    if (!window.genkeys || !window.sign || !window.verify) initializeWasm();
  }, []);

  const handleCreateTrust = () => {
    const data = {
      "@context": ["https://www.w3.org/ns/credentials/v2"],
      id: "urn:uuid:91cf3009-28ee-488e-8ae8-a751a289c8cb",
      type: ["VerifiableCredential", "UserCredential"],
      issuer: "urn:uuid:8bbabf61-758b-4bcb-8dab-4a4d1d493e25",
      validFrom: "2024-07-25T19:23:24Z",
      credentialSchema: {
        id: "https://github.com/nqminds/ClaimCascade/blob/claim_verifier/packages/claim_verifier/user.yaml",
        type: "JsonSchema",
      },
      credentialSubject: {
        type: "fact",
        schemaName: "device_trust",
        id: "2ed6bd67-d40e-402e-aff9-1aa6092eb43d",
        timestamp: 1716287268891,
        fact: {
          device_id: params.device_id,
          authoriser_id: emailAddress,
          created_at: Date.now(),
        },
      },
    };

    const schema = {
      "@context": ["https://www.w3.org/ns/credentials/v2"],
      id: "urn:uuid:91cf3009-28ee-488e-8ae8-a751a289c8cb",
      type: ["VerifiableCredential", "UserCredential"],
      issuer: "urn:uuid:8bbabf61-758b-4bcb-8dab-4a4d1d493e25",
      validFrom: "2024-07-25T19:23:24Z",
      credentialSchema: {
        id: "https://github.com/nqminds/ClaimCascade/blob/claim_verifier/packages/claim_verifier/user.yaml",
        type: "JsonSchema",
      },
      credentialSubject: {
        type: "schema",
        id: "e4e0ec6c-de9d-430f-b943-f5595a0d0d57",
        timestamp: 1716131759000,
        schemaName: "device_trust",
        schema: {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          $id: "https://github.com/nqminds/CAHN/blob/main/packages/schemas/src/device_trust.v.1.0.0.schema.yaml",
          title: "device_trust",
          description:
            "A giving of trust from an authorising user to a device to connect to the network",
          type: "object",
          properties: {
            device_id: {
              description: "id of the device receiving trust",
              type: "string",
            },
            authoriser_id: {
              description: "id of the authorising user",
              type: "string",
            },
            created_at: {
              description:
                "timestamp at which trust was granted in milliseconds",
              type: "integer",
            },
          },
          required: ["device_id", "authoriser_id", "created_at"],
        },
      },
    };

    const vc = new window.VerifiableCredential(data, JSON.stringify(schema));

    const privateKeyAsUint8Array = new Uint8Array(
      Buffer.from(privateKey, "base64")
    );

    const signedVc = vc.sign(privateKeyAsUint8Array);

    console.log("signedVc :>> ", signedVc.to_object());
  };

  const handleRemoveTrust = () => {
    console.log("Remove trust");
  };

  return (
    <Box>
      <Typography
        variant="h2"
        sx={{
          textAlign: "center",
          color: "primary.main",
          m: { xs: 1, sm: 3 },
        }}
      >
        Device Information
      </Typography>
      <DeviceInfoTable deviceData={deviceData} />

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          m: { xs: 1, sm: 3 },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "primary.main",
          }}
          gutterBottom
        >
          {"> "}
          {deviceData.Name} Trust
        </Typography>
        <Box
          component="pre"
          sx={{
            padding: "16px",
            borderRadius: "4px",
            overflowX: "auto",
            fontFamily: "Monaco, monospace",
            fontSize: "14px",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography component="code">
            {`Some stuff here from the Prolog environment about who trusts this device.

assert(device_trust("Henry-id",1723716151033,"HenryTrustPhone-id")).
assert(device_trust("Henry-id",1723716151033,"HenryVulnerableCamera-id")).
assert(device_trust("Ash-id",1723716151033,"AshEvilPhone-id")).
`}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
          }}
        >
          <ButtonGroup variant="contained" size="large">
            <Button onClick={handleCreateTrust}>Add trust</Button>
            <Button onClick={handleRemoveTrust}>Remove Trust</Button>
          </ButtonGroup>
        </Box>
      </Paper>
    </Box>
  );
};

export default withAuth(Page);
