"use client";
import { Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import ManufacturerInfoTable from "../../components/ManufacturerInfoTable";
import withAuth from "@/app/utils/withAuth";
import AppBar from "../../components/AppBar";
import { v4 as uuidv4 } from "uuid";
import { manufacturer_trust, retraction } from "@/schemas";
import TrustSubmissions from "@/app/components/TrustSubmissions";
import initializeWasm from "@/app/utils/initialiseWasm";
import createUnsignedRetractionVC from "@/app/utils/createUnsignedRetractionVC";

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
    initializeWasm();

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

      const vcToUpload = createUnsignedRetractionVC(idToRevoke);

      const privateKeyAsUint8Array = new Uint8Array(
        Buffer.from(privateKey, "base64")
      );

      const signedVc = vcToUpload.sign(privateKeyAsUint8Array).to_object();

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
