import {
  Typography,
  Paper,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Box,
  TableHead,
  TableRow,
  Chip,
  Button,
  ButtonGroup,
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

function unixInMillisecondsToDateString(unixInMilliseconds) {
  return new Date(unixInMilliseconds).toDateString();
}

export default function SpecificDeviceInformationBoard({ deviceData }) {
  return (
    <Paper
      sx={{
        m: { xs: 1, sm: 3 },
        p: { xs: 1, sm: 2 },
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
        {deviceData.Name}
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          margin: "auto",
          width: "60%",
        }}
      >
        <TableContainer
          sx={{
            // maxHeight: 500,
            // overflow: "auto",
            margin: "auto",
          }}
        >
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
                <StyledTableCell>
                  <b>Device</b> Created At
                </StyledTableCell>
                <StyledTableCell align="right">
                  {unixInMillisecondsToDateString(deviceData.CreatedAtDevice)} (
                  {deviceData.CreatedAtDevice})
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>
                  <b>Device</b> ID
                </StyledTableCell>
                <StyledTableCell align="right">
                  {deviceData.DeviceId}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>
                  <b>Device</b> IDevID
                </StyledTableCell>
                <StyledTableCell align="right">
                  {deviceData.Idevid}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>
                  <b>Device</b> Name
                </StyledTableCell>
                <StyledTableCell align="right">
                  {deviceData.Name}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>
                  <b>Device Type</b> Created At
                </StyledTableCell>
                <StyledTableCell align="right">
                  {unixInMillisecondsToDateString(
                    deviceData.CreatedAtDeviceType
                  )}{" "}
                  ({deviceData.CreatedAtDeviceType})
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>
                  <b>Device Type</b> ID
                </StyledTableCell>
                <StyledTableCell align="right">
                  {deviceData.DeviceTypeId}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>
                  <b>Device Type</b> Name
                </StyledTableCell>
                <StyledTableCell align="right">
                  {deviceData.DeviceType}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>
                  <b>Manufacturer</b> ID
                </StyledTableCell>
                <StyledTableCell align="right">
                  {deviceData.ManufacturerId}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>
                  <b>Manufacturer</b> Name
                </StyledTableCell>
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
                      deviceData.CanConnect ? <CheckIcon /> : <DoDisturbIcon />
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
        }}
      >
        <ButtonGroup variant="contained" size="large">
          <Button>
            <Typography variant="button">Button 1</Typography>
          </Button>
          <Button>
            <Typography variant="button">Button 2</Typography>
          </Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );
}
