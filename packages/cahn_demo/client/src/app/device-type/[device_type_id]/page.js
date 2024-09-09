"use client";
import { Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import DeviceTypeInfoTable from "../../components/DeviceTypeInfoTable";
import withAuth from "@/app/utils/withAuth";
import AppBar from "../../components/AppBar";
import { v4 as uuidv4 } from "uuid";
import { device_type_trust, retraction } from "@/schemas";
import TrustSubmissions from "@/app/components/TrustSubmissions";
import initializeWasm from "@/app/utils/initialiseWasm";
import createUnsignedRetractionVC from "@/app/utils/createUnsignedRetractionVC";

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
    HasTrust: false,
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

  const [permissionedUsers, setPermissionedUsers] = useState([]);
  const privateKey = localStorage.getItem("privateKey");
  const emailAddress = localStorage.getItem("emailAddress");

  const handleCreateTrust = () => {
    const credentialSubject = {
      type: "fact",
      schemaName: "device_type_trust",
      id: uuidv4(),
      timestamp: 1716287268891,
      fact: {
        device_type_id: params.device_type_id,
        authoriser_id: emailAddress,
        created_at: Date.now(),
      },
    };

    // Deep copy device_type_trust
    const vc_data = JSON.parse(JSON.stringify(device_type_trust));
    // Set the credentialSubject fields of VC
    vc_data.credentialSubject = credentialSubject;
    vc_data.credentialSchema.id =
      "https://github.com/nqminds/CAHN/blob/main/packages/schemas/src/device_type_trust.v.1.0.0.schema.yaml";
    const vc = new window.VerifiableCredential(
      vc_data,
      JSON.stringify(device_type_trust)
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
      // Get id from API by pinging /VC_ID/device_type_trust
      const response = await axios.get(
        "http://localhost:3001/VC_ID/device_type_trust",
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
        "http://localhost:3001/trust_vc/device_type/" + params.device_type_id
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
      .get("http://localhost:3001/deviceType/" + params.device_type_id)
      .then((res) => {
        setDeviceTypeData(res.data);
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
    initializeWasm();

    axios.get("http://localhost:3001/permissions/device_type").then((res) => {
      setPermissionedUsers(res.data);
    });
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

        <TrustSubmissions
          trustVCs={trustVCs}
          permissionedUsers={permissionedUsers}
          emailAddress={emailAddress}
          handleCreateTrust={handleCreateTrust}
          handleRemoveTrust={handleRemoveTrust}
        />
      </Box>
    </>
  );
};

export default withAuth(Page);
