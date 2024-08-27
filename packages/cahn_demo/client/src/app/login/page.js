"use client";
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useState } from "react";

const Page = () => {
  const [email, setEmail] = useState("");
  const [emailIsSent, setEmailIsSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const emailAddress = localStorage.getItem("emailAddress");
    const publicKey = localStorage.getItem("publicKey");
    const privateKey = localStorage.getItem("privateKey");

    if (emailAddress && publicKey && privateKey) {
      // Redirect to the home page
      router.push("/");
    }

    async function initializeWasm() {
      const {
        default: init,
        gen_keys,
        sign,
        verify,
      } = await import("../wasm/vc_signing");
      await init();
      console.log("WASM Module initialized");

      // Store functions for later use
      window.gen_keys = gen_keys;
    }

    // If functions aren't already stored on the window object, initialize them
    // TODO: Extract initializeWasm to a separate file
    if (!window.genkeys || !window.sign || !window.verify) initializeWasm();
  }, []);

  const handleLogin = () => {
    const publicKey = Buffer.from(window.gen_keys().public_key()).toString(
      "base64"
    );

    const privateKey = Buffer.from(window.gen_keys().private_key()).toString(
      "base64"
    );

    axios
      .post("http://localhost:3001/sign_in", { email, publicKey })
      .then((res) => {
        if (res.status === 200) {
          setEmailIsSent(true);

          // Start pinging the server to check if the private key has been approved
          const interval = setInterval(() => {
            axios
              .post("http://localhost:3001/check_key", { email, publicKey })
              .then((res) => {
                if (res.status === 200) {
                  clearInterval(interval);
                  localStorage.setItem("emailAddress", email);
                  localStorage.setItem("publicKey", publicKey);
                  localStorage.setItem("privateKey", privateKey);
                  router.push("/");
                }
              })
              .catch((_err) => {
                // Don't do anything
              });
          }, 1000);
        }
      });
  };

  return (
    <Box>
      <Typography
        variant="h2"
        sx={{ textAlign: "center", color: "primary.main", m: { xs: 1, sm: 3 } }}
      >
        Login
      </Typography>
      <Container>
        <Paper>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
            }}
          >
            <Typography variant="h4" sx={{ color: "primary.main" }}>
              Welcome to the CAHN Demo
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              sx={{ color: "primary.main" }}
            >
              Please log in to continue
            </Typography>
            {/* Email input */}
            <TextField
              id="email-input"
              label="Email address"
              variant="outlined"
              margin="normal"
              sx={{ width: "50%" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => {
                handleLogin();
              }}
            >
              Log in
            </Button>
            {emailIsSent && (
              <Alert
                variant="outlined"
                icon={<CheckIcon fontSize="inherit" />}
                severity="success"
                sx={{ m: 2 }}
              >
                An email has been sent to {email}. Please check your inbox.
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
export default Page;
