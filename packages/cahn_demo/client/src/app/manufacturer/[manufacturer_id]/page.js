import { Typography, Container } from "@mui/material";

export default function Page({ params }) {
  return (
    <Container>
      <Typography>Manufacturer id: {params.manufacturer_id}</Typography>
    </Container>
  );
}
