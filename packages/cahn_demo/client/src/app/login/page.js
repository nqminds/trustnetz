"use client";
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("email");
    const privateKey = localStorage.getItem("privateKey");

    if (email && privateKey) {
      // Redirect to the home page
      router.push("/");
    }
  }, []);
  const handleLogin = () => {
    // Console log the email that is in the email input
    console.log("email :>> ", email);
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
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
export default Page;
