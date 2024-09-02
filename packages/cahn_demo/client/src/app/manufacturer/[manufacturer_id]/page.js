"use client";
import {
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip,
  CardActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import ManufacturerInfoTable from "../../components/ManufacturerInfoTable";
import withAuth from "@/app/utils/withAuth";
import AppBar from "../../components/AppBar";
import { v4 as uuidv4 } from "uuid";
import CheckIcon from "@mui/icons-material/Check";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
const Page = ({ params }) => {
  const [manufacturerData, setManufacturerData] = useState({
    CreatedAtManufacturer: "",
    ManufacturerId: "",
    Manufacturer: "",
    DeviceTypes: [
      {
        DeviceTypeId: "",
        CreatedAtDeviceType: "",
        DeviceType: "",
      },
    ],

    CanIssueManufacturerTrust: false,
  });

  const [permissionedUsers, setPermissionedUsers] = useState([]);

  const privateKey = localStorage.getItem("privateKey");
  const emailAddress = localStorage.getItem("emailAddress");

  const [trustVCs, setTrustVCs] = useState([
    {
      id: "",
      credentialSubject: {
        fact: {
          manufacturer_id: "",
          userId: "",
          created_at: 0,
        },
      },
    },
  ]);

  useEffect(() => {
    if (manufacturerData.ManufacturerId !== params.manufacturer_id) {
      axios
        .get("http://localhost:3001/manufacturer/" + params.manufacturer_id)
        .then((res) => {
          setManufacturerData(res.data);
          return axios.get(
            "http://localhost:3001/trust_vc/manufacturer/" +
              params.manufacturer_id
          );
        })
        .then((res) => {
          console.log("res.data :>> ", res.data);
          setTrustVCs(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [params.manufacturer_id, manufacturerData.ManufacturerId]);

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

    axios.get("http://localhost:3001/permissions/manufacturer").then((res) => {
      setPermissionedUsers(res.data);
    });
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
        schemaName: "manufacturer_trust",
        id: uuidv4(),
        timestamp: 1716287268891,
        fact: {
          manufacturer_id: params.manufacturer_id,
          user_id: emailAddress,
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
        id: "https://github.com/nqminds/ClaimCascade/blob/claim_verifier/packages/claim_verifier/manufacturer_trust.yaml",
        type: "JsonSchema",
      },
      credentialSubject: {
        type: "schema",
        id: "e4e0ec6c-de9d-430f-b943-f5595a0d0d57",
        timestamp: 1716131759000,
        schemaName: "manufacturer_trust",
        schema: {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          $id: "https://github.com/nqminds/CAHN/blob/main/packages/schemas/src/device_trust.v.1.0.0.schema.yaml",
          title: "manufacturer_trust",
          description:
            "A giving of trust from an authorising user to a device to connect to the network",
          type: "object",
          properties: {
            device_id: {
              description: "id of the device receiving trust",
              type: "string",
            },
            user_id: {
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
      // Get id from API by pinging /VC_ID/manufacturer_trust
      const response = await axios.get(
        "http://localhost:3001/VC_ID/manufacturer_trust",
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
        "http://localhost:3001/trust_vc/manufacturer/" + params.manufacturer_id
      )
      .then((res) => {
        setTrustVCs(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
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
          Manufacturer Information
        </Typography>
        <ManufacturerInfoTable manufacturerData={manufacturerData} />
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
            {manufacturerData.Manufacturer} Trust Submissions
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
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {new Date(Number(vc.timestamp)).toLocaleString("en-GB")}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {vc.userId}
                  </Typography>
                  <Chip
                    icon={
                      permissionedUsers.includes(vc.userId) ? (
                        <CheckIcon />
                      ) : (
                        <DoDisturbIcon />
                      )
                    }
                    label={
                      permissionedUsers.includes(vc.userId)
                        ? "Can issue trust"
                        : "Cannot issue trust"
                    }
                    color={
                      permissionedUsers.includes(vc.userId)
                        ? "success"
                        : "error"
                    }
                  />
                </CardContent>
                {vc.userId === emailAddress && (
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
