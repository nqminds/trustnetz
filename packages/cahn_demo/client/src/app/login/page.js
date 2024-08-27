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
    const email = localStorage.getItem("email");
    const privateKey = localStorage.getItem("privateKey");

    if (email && privateKey) {
      // Redirect to the home page
      router.push("/");
    }
  }, []);

  const generateKey = () => {
    // TODO: Change this to use the WASM key generation
    return "fakeKey";
  };

  const handleLogin = () => {
    const privateKey = generateKey();
    axios
      .post("http://localhost:3001/sign_in", { email, privateKey })
      .then((res) => {
        if (res.status === 200) {
          setEmailIsSent(true);

          // Start pinging the server to check if the private key has been approved
          const interval = setInterval(() => {
            axios
              .get(
                `http://localhost:3001/check_key?email=${email}?privateKey=${privateKey}`
              )
              .then((res) => {
                if (res.status === 200) {
                  clearInterval(interval);
                  localStorage.setItem("emailAddress", email);
                  localStorage.setItem("privateKey", privateKey);
                  router.push("/");
                }
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
