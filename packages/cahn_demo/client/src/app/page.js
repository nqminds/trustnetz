import { Typography, Container, Paper } from "@mui/material";

export default function Home() {
  return (
    <Container>
      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        <Typography variant="h4">CAHN Dashboard</Typography>
      </Paper>
    </Container>
  );
}
