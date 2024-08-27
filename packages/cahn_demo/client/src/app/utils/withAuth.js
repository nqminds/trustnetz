// utils/withAuth.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const [loading, setLoading] = useState(true); // State to manage loading state
    const router = useRouter();
    const emailAddress =
      typeof window !== "undefined"
        ? localStorage.getItem("emailAddress")
        : null;

    useEffect(() => {
      if (emailAddress === null) {
        router.replace("/login");
      } else {
        setLoading(false); // Set loading to false if emailAddress exists
      }
    }, [emailAddress, router]);

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
