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

export default function SpecificDeviceInformationBoard({ manufacturerData }) {
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
          width: "40%",
          margin: "auto",
        }}
      >
        <TableContainer
          sx={{
            // maxHeight: 500,
            // overflow: "auto",
            maxWidth: 1000,
            minWidth: 500,
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

            <TableBody></TableBody>
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
