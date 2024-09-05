"use client";
import { Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import DeviceInfoTable from "../../components/DeviceInfoTable";
import withAuth from "@/app/utils/withAuth";
import { v4 as uuidv4 } from "uuid";
import AppBar from "../../components/AppBar";
import { device_trust } from "@/schemas";
import TrustSubmissions from "../../components/TrustSubmissions";
import initializeWasm from "@/app/utils/initialiseWasm";

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
  const [permissionedUsers, setPermissionedUsers] = useState([]);

  const privateKey = localStorage.getItem("privateKey");
  const emailAddress = localStorage.getItem("emailAddress");

  const [trustVCs, setTrustVCs] = useState([
    {
      id: "",
      credentialSubject: {
        fact: {
          device_id: "",
          authoriser_id: "",
          created_at: 0,
        },
      },
    },
  ]);

  useEffect(() => {
    if (deviceData.DeviceId !== params.device_id) {
      axios
        .get("http://localhost:3001/device/" + params.device_id)
        .then((res) => {
          setDeviceData(res.data);
          return axios.get(
            "http://localhost:3001/trust_vc/device/" + params.device_id
          );
        })
        .then((res) => {
          setTrustVCs(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [params.device_id, deviceData.DeviceId]);

  useEffect(() => {
    initializeWasm();

    axios.get("http://localhost:3001/permissions/device/").then((res) => {
      setPermissionedUsers(res.data);
    });
  }, []);

  const handleCreateTrust = () => {
    const credentialSubject = {
      type: "fact",
      schemaName: "device_trust",
      id: uuidv4(),
      timestamp: 1716287268891,
      fact: {
        device_id: params.device_id,
        authoriser_id: emailAddress,
        created_at: Date.now(),
      },
    };

    // Deep copy device_type_trust
    const vc_data = JSON.parse(JSON.stringify(device_trust));
    // Set the credentialSubject fields of VC
    vc_data.credentialSubject = credentialSubject;
    vc_data.credentialSchema.id =
      "https://github.com/nqminds/CAHN/blob/main/packages/schemas/src/device_trust.v.1.0.0.schema.yaml";
    const vc = new window.VerifiableCredential(
      vc_data,
      JSON.stringify(device_trust)
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
      // Get id from API by pinging /VC_ID/device_trust
      const response = await axios.get(
        "http://localhost:3001/VC_ID/device_trust",
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
      .get("http://localhost:3001/trust_vc/device/" + params.device_id)
      .then((res) => {
        setTrustVCs(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const refreshData = () => {
    axios
      .get("http://localhost:3001/device/" + params.device_id)
      .then((res) => {
        setDeviceData(res.data);
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
          Device Information
        </Typography>
        <DeviceInfoTable deviceData={deviceData} />

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
