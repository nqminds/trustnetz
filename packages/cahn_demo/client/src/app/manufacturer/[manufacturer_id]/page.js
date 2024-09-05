"use client";
import { Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import ManufacturerInfoTable from "../../components/ManufacturerInfoTable";
import withAuth from "@/app/utils/withAuth";
import AppBar from "../../components/AppBar";
import { v4 as uuidv4 } from "uuid";
import { manufacturer_trust } from "@/schemas";
import TrustSubmissions from "@/app/components/TrustSubmissions";

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

    HasTrust: false,
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
          authoriserId: "",
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
    const credentialSubject = {
      type: "fact",
      schemaName: "manufacturer_trust",
      id: uuidv4(),
      timestamp: 1716287268891,
      fact: {
        manufacturer_id: params.manufacturer_id,
        authoriser_id: emailAddress,
        created_at: Date.now(),
      },
    };

    // Deep copy manufacturer_trust
    const vc_data = JSON.parse(JSON.stringify(manufacturer_trust));
    console.log("vc_data :>> ", vc_data);
    // Set the credentialSubject fields of VC
    vc_data.credentialSubject = credentialSubject;
    vc_data.credentialSchema.id =
      "https://github.com/nqminds/ClaimCascade/blob/claim_verifier/packages/claim_verifier/user.yaml";

    const vc = new window.VerifiableCredential(
      vc_data,
      JSON.stringify(manufacturer_trust)
    );

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
        refreshData();
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
      refreshData();
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

  const refreshData = () => {
    axios
      .get("http://localhost:3001/manufacturer/" + params.manufacturer_id)
      .then((res) => {
        setManufacturerData(res.data);
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
        <TrustSubmissions
          trustVCs={trustVCs}
          permissionedUsers={permissionedUsers}
          emailAddress={emailAddress}
          handleRemoveTrust={handleRemoveTrust}
          handleCreateTrust={handleCreateTrust}
        />
      </Box>
    </>
  );
};

export default withAuth(Page);
