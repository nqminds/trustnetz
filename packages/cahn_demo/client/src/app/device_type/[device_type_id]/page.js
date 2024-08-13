import { Typography, Container } from "@mui/material";

export default function Page({ params }) {
  return (
    <Container>
      <Typography>Device type id: {params.device_type_id}</Typography>
    </Container>
  );
}
