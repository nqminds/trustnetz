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
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import CheckIcon from "@mui/icons-material/Check";
import { StyledTableRow, StyledTableCell } from "./StyledTable";
import unixInMillisecondsToDateString from "@/utils/unixMillisecondsToDateString";

export default function ManufacturerInfoTable({ manufacturerData }) {
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
        {manufacturerData.Manufacturer}
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          margin: "auto",
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
              Manufacturer Information
            </Typography>
            <TableContainer
              sx={{
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
                    <StyledTableCell>Manufacturer Attribute</StyledTableCell>
                    <StyledTableCell align="right">Value</StyledTableCell>
                  </StyledTableRow>
                </TableHead>

                <TableBody>
                  {/* Manufacturer Fields */}
                  <StyledTableRow>
                    <StyledTableCell>Created At</StyledTableCell>
                    <StyledTableCell align="right">
                      {unixInMillisecondsToDateString(
                        manufacturerData.CreatedAtManufacturer
                      )}{" "}
                      ({manufacturerData.CreatedAtManufacturer})
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell align="right">
                      {manufacturerData.ManufacturerId}
                    </StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell align="right">
                      {manufacturerData.Manufacturer}
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <StyledTableCell>Manufacturer is Trusted</StyledTableCell>
                    <StyledTableCell align="right">
                      <Chip
                        icon={
                          manufacturerData.HasTrust ? (
                            <CheckIcon />
                          ) : (
                            <DoDisturbIcon />
                          )
                        }
                        label={manufacturerData.HasTrust.toString()}
                        color={manufacturerData.HasTrust ? "success" : "error"}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>

          <>
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
              }}
            >
              Device Types Made by {manufacturerData.Manufacturer}
            </Typography>
            <TableContainer
              sx={{
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
                    <StyledTableCell align="center">ID</StyledTableCell>
                    <StyledTableCell align="center">Name</StyledTableCell>
                    <StyledTableCell align="center">Created At</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {manufacturerData.DeviceTypes.length > 0 &&
                    manufacturerData.DeviceTypes.map((device) => (
                      <StyledTableRow key={device.DeviceTypeId}>
                        <StyledTableCell align="center">
                          {device.DeviceTypeId}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {device.DeviceType}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {unixInMillisecondsToDateString(
                            device.CreatedAtDeviceType
                          )}{" "}
                          ({device.CreatedAtDeviceType})
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        </Stack>
      </Paper>
    </Paper>
  );
}
