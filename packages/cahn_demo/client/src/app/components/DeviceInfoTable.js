import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CheckIcon from "@mui/icons-material/Check";
import { StyledTableRow, StyledTableCell } from "./StyledTable";
import unixInMillisecondsToDateString from "@/utils/unixMillisecondsToDateString";

export default function DeviceInfoTable({ deviceData }) {
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
          mx: "auto",
          width: "60%",
        }}
      >
        <Stack divider={<Divider />} spacing={2}>
          <>
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
              }}
            >
              Device Information
            </Typography>
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
                    <StyledTableCell>Device Attribute</StyledTableCell>
                    <StyledTableCell align="right">Value</StyledTableCell>
                  </StyledTableRow>
                </TableHead>

                <TableBody>
                  <StyledTableRow>
                    <StyledTableCell>Created At</StyledTableCell>
                    <StyledTableCell align="right">
                      {unixInMillisecondsToDateString(
                        deviceData.CreatedAtDevice
                      )}{" "}
                      ({deviceData.CreatedAtDevice})
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceData.DeviceId}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>IDevID</StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceData.Idevid}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceData.Name}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
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
          </>
          {/* Device type */}
          <>
            {" "}
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
              }}
            >
              Device Type Information
            </Typography>
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
                    <StyledTableCell>Device Type Attribute</StyledTableCell>
                    <StyledTableCell align="right">Value</StyledTableCell>
                  </StyledTableRow>
                </TableHead>

                <TableBody>
                  <StyledTableRow>
                    <StyledTableCell>Created At</StyledTableCell>
                    <StyledTableCell align="right">
                      {unixInMillisecondsToDateString(
                        deviceData.CreatedAtDeviceType
                      )}{" "}
                      ({deviceData.CreatedAtDeviceType})
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceData.DeviceTypeId}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceData.DeviceType}
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
          <>
            {/* Manufacturer */}
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
              }}
            >
              Manufacturer Information
            </Typography>
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
                    <StyledTableCell>Manufacturer Attribute</StyledTableCell>
                    <StyledTableCell align="right">Value</StyledTableCell>
                  </StyledTableRow>
                </TableHead>

                <TableBody>
                  <StyledTableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceData.ManufacturerId}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell align="right">
                      {deviceData.Manufacturer}
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        </Stack>
      </Paper>
    </Paper>
  );
}
