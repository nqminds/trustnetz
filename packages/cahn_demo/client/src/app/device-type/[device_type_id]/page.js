"use client";
import {
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import DeviceTypeInfoTable from "../../components/DeviceTypeInfoTable";
import withAuth from "@/app/utils/withAuth";
import AppBar from "../../components/AppBar";
import { v4 as uuidv4 } from "uuid";

const Page = ({ params }) => {
  const [deviceTypeData, setDeviceTypeData] = useState({
    CreatedAtDeviceType: "",
    DeviceTypeId: "",
    DeviceType: "",
    SBOM: {},
    Devices: [
      [
        {
          DeviceId: "",
          Idevid: "",
          Name: "",
          ManufacturerId: "",
          Manufacturer: "",
        },
      ],
    ],
  });

  const [trustVCs, setTrustVCs] = useState([
    {
      id: "",
      credentialSubject: {
        fact: {
          device_type_id: "",
          authoriser_id: "",
          created_at: 0,
        },
      },
    },
  ]);

  const privateKey = localStorage.getItem("privateKey");
  const emailAddress = localStorage.getItem("emailAddress");

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
        schemaName: "device_type_trust",
        id: uuidv4(),
        timestamp: 1716287268891,
        fact: {
          device_type_id: params.device_type_id,
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
        schemaName: "device_type_trust",
        schema: {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          $id: "https://github.com/nqminds/CAHN/blob/main/packages/schemas/src/device_trust.v.1.0.0.schema.yaml",
          title: "device_type_trust",
          description:
            "A giving of trust from an authorising user to a device to connect to the network",
          type: "object",
          properties: {
            device_type_id: {
              description: "id of the device type receiving trust",
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
          required: ["device_type_id", "authoriser_id", "created_at"],
        },
      },
    };

    const vc = new window.VerifiableCredential(data, JSON.stringify(schema));

    const privateKeyAsUint8Array = new Uint8Array(
      Buffer.from(privateKey, "base64")
    );

    const signedVc = vc.sign(privateKeyAsUint8Array).to_object();

    // Send the signed VC to the server
    axios
      .post("http://localhost:3001/upload/verifiable_credential", {
        vc: signedVc,
      })
      .then((res) => {
        console.log(res.data);
        refreshTrustVCs();
      });
  };

  const handleRemoveTrust = async (vc) => {
    try {
      // Get id from API by pinging /VC_ID/device_trust
      const response = await axios.get(
        "http://localhost:3001/VC_ID/device_type_trust",
        { params: vc }
      );
      const idToRevoke = response.data.id; // Assuming the API returns an object with an 'id' field

      const retractionClaim = {
        type: "retraction",
        id: `urn:uuid:${uuidv4()}`,
        timestamp: Date.now(),
        claim_id: idToRevoke,
      };

      const retractionVC = {
        "@context": ["https://www.w3.org/ns/credentials/v2"],
        id: `urn:uuid:${uuidv4()}`,
        type: ["VerifiableCredential", "UserCredential"],
        issuer: `urn:uuid:${uuidv4()}`, // TODO: Use an actual issuer ID?
        validFrom: new Date().toISOString(),
        credentialSchema: {
          id: "https://github.com/nqminds/ClaimCascade/blob/claim_verifier/packages/claim_verifier/user.yaml",
          type: "JsonSchema",
        },
        credentialSubject: retractionClaim,
      };

      const VC = new window.VerifiableCredential(
        retractionVC,
        "retraction_schema"
      );

      const privateKeyAsUint8Array = new Uint8Array(
        Buffer.from(privateKey, "base64")
      );

      const signedVc = VC.sign(privateKeyAsUint8Array).to_object();

      const uploadResponse = await axios.post(
        "http://localhost:3001/upload/verifiable_credential",
        {
          vc: signedVc,
        }
      );

      console.log(uploadResponse.data);
      refreshTrustVCs();
    } catch (error) {
      console.error("Error in handleRemoveTrust:", error);
      // Handle the error appropriately
    }
  };
  const refreshTrustVCs = () => {
    axios
      .get(
        "http://localhost:3001/trust_vc/device_type/" + params.device_type_id
      )
      .then((res) => {
        console.log("res.data :>> ", res.data);
        setTrustVCs(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (deviceTypeData.DeviceTypeId !== params.device_type_id) {
      axios
        .get("http://localhost:3001/deviceType/" + params.device_type_id)
        .then((res) => {
          setDeviceTypeData(res.data);
          return axios.get(
            "http://localhost:3001/trust_vc/device_type/" +
              params.device_type_id
          );
        })
        .then((res) => {
          setTrustVCs(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [params.device_id, deviceTypeData.DeviceTypeId]);

  useEffect(() => {
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

    if (!window.gen_keys || !window.VerifiableCredential) initializeWasm();
  }, []);

  return (
    <>
      <AppBar />
      <Box>
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            color: "primary.main",
            m: { xs: 1, sm: 3 },
          }}
        >
          Device Type Information
        </Typography>
        <DeviceTypeInfoTable deviceTypeData={deviceTypeData} />

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
            {deviceTypeData.DeviceType} Trust
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
          <Typography variant="h4" color="primary" gutterBottom>
            Trust submissions
          </Typography>
          <Stack
            spacing={{ xs: 1, sm: 2 }}
            direction="row"
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            {trustVCs.map((vc, index) => (
              <Card raised key={index} sx={{ maxWidth: 345, marginBottom: 2 }}>
                <CardContent>
                  <Stack spacing={0.4}>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(Number(vc.timestamp)).toLocaleString("en-GB")}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {vc.authoriserId}
                    </Typography>
                  </Stack>
                </CardContent>
                {vc.authoriserId === emailAddress && (
                  <CardActions>
                    <Button
                      variant="contained"
                      onClick={() => handleRemoveTrust(vc)}
                    >
                      Submit retraction
                    </Button>
                  </CardActions>
                )}
              </Card>
            ))}
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Button variant="contained" onClick={handleCreateTrust}>
              Add trust
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default withAuth(Page);
