import {
  Typography,
  Paper,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Container,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { styled } from "@mui/material/styles";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CheckIcon from "@mui/icons-material/Check";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.background.paper,
  },
}));
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.common.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export default function SpecificDeviceInformationBoard({ deviceData }) {
  return (
    <Paper
      sx={{
        m: { xs: 1, sm: 3 },
        p: { xs: 2, sm: 3 },
        minWidth: 300,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: "primary.main",
        }}
        gutterBottom
      >
        {"> "}
        {deviceData.Name} Information
      </Typography>
      <Stack
        spacing={0}
        divider={<Divider orientation="vertical" flexItem />}
        justifyContent="space-evenly"
        sx={{ mt: 3 }}
        direction="row"
        useFlexGap
        flexWrap="wrap"
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
          }}
        >
          <TableContainer>
            <Table
              sx={{
                [`& .${tableCellClasses.root}`]: {
                  borderBottom: "none",
                },
              }}
            >
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Field</StyledTableCell>
                  <StyledTableCell align="right">Value</StyledTableCell>
                </StyledTableRow>
              </TableHead>

              <TableBody>
                <StyledTableRow>
                  <StyledTableCell>Created at Device</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.CreatedAtDevice}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Device ID</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.DeviceId}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Device IDevID</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.Idevid}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Device Name</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.Name}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Created at Device Type</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.CreatedAtDeviceType}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Device Type ID</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.DeviceTypeId}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Device Type</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.DeviceType}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Manufacturer ID</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.ManufacturerId}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Manufacturer</StyledTableCell>
                  <StyledTableCell align="right">
                    {deviceData.Manufacturer}
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <StyledTableCell>Can Connect</StyledTableCell>
                  <StyledTableCell align="right">
                    <Chip
                      icon={
                        deviceData.CanConnect ? (
                          <CheckIcon />
                        ) : (
                          <DoDisturbIcon />
                        )
                      }
                      label={deviceData.CanConnect.toString()}
                      color={deviceData.CanConnect ? "success" : "error"}
                    />
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    </Paper>
  );
}
