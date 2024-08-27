import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";

// utils/withAuth.js

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const [loading, setLoading] = useState(true); // State to manage loading state
    const router = useRouter();
    const { emailAddress, publicKey, privateKey } =
      typeof window !== "undefined"
        ? {
            emailAddress: localStorage.getItem("emailAddress"),
            publicKey: localStorage.getItem("publicKey"),
            privateKey: localStorage.getItem("privateKey"),
          }
        : { emailAddress: null, publicKey: null, privateKey: null };

    useEffect(() => {
      if (emailAddress === null || publicKey === null || privateKey === null) {
        router.replace("/login");
      } else {
        setLoading(false); // Set loading to false if emailAddress and publicKey exist
      }
    }, [emailAddress, publicKey, router, privateKey]);

    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          Loading...
        </Box>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
