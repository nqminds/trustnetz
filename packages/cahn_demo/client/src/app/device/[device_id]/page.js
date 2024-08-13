import { Typography, Container } from "@mui/material";

export default function Page({ params }) {
  return (
    <Container>
      <Typography>Device id: {params.device_id}</Typography>
    </Container>
  );
}
