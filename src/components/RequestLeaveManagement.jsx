import { useState, useEffect } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  CircularProgress,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  getALLRequestLeave,
  rejectRequest,
  approveRequest,
  approveRequestPaid,
  checkOutOfTime,
} from "../api/api";

const RequestLeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getALLRequestLeave(token);
        setRequests(data);
        setFilteredRequests(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await approveRequest(id, token);
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, approve: true } : request
        )
      );
      setSnackbarMessage("Yêu cầu đã được duyệt!");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error approving request:", error);
      setSnackbarMessage("Có lỗi khi duyệt yêu cầu!");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
    window.location.reload();
  };

  const handleApprovePaid = async (id, requestLeave) => {
    const res = await checkOutOfTime(requestLeave.employee_id, token);
    console.log(res.data === false);
    if (res.data === true) {
      setLoading(true);
      try {
        await approveRequestPaid(id, token);
        setRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === id ? { ...request, approve: true } : request
          )
        );
        setSnackbarMessage("Yêu cầu đã được duyệt!");
        setSnackbarSeverity("success");
        window.location.reload();
      } catch (error) {
        console.error("Error approving request:", error);
        setSnackbarMessage("Có lỗi khi duyệt yêu cầu!");
        setSnackbarSeverity("error");
      } finally {
        setLoading(false);
        setOpenSnackbar(true);
      }
    } else {
      setSnackbarMessage(
        "Nhân viên này trong tháng đã quá thời hạn duyệt có lương"
      );
      setSnackbarSeverity("error");
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    try {
      await rejectRequest(id, token);
      const data = await getALLRequestLeave(token);
      setRequests(data);
      setSnackbarMessage("Yêu cầu đã bị từ chối!");
      setSnackbarSeverity("warning");
    } catch (error) {
      console.error("Error rejecting request:", error);
      setSnackbarMessage("Có lỗi khi từ chối yêu cầu!");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
    window.location.reload();
  };

  const handleSearchAndFilter = () => {
    const lowerCaseSearchName = searchName.toLowerCase();
    const filtered = requests.filter((request) => {
      const nameMatch = request.name
        .toLowerCase()
        .includes(lowerCaseSearchName);
      const startTime = new Date(request.startTime);
      const endTime = new Date(request.endTime);

      const startDateMatch = startDate
        ? startTime >= new Date(startDate)
        : true;
      const endDateMatch = endDate ? endTime <= new Date(endDate) : true;

      const statusMatch =
        statusFilter === "" ? true : Number(statusFilter) === request.approve;

      return nameMatch && startDateMatch && endDateMatch && statusMatch;
    });
    setFilteredRequests(filtered);
  };

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchName, startDate, endDate, statusFilter, requests]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Quản Lý Yêu Cầu Nghỉ
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Tìm kiếm theo tên"
            variant="outlined"
            fullWidth
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Thời gian bắt đầu"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Thời gian kết thúc"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            label="Trạng thái"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            variant="outlined"
            fullWidth
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="0">Chờ duyệt</MenuItem>
            <MenuItem value="1">Duyệt có lương</MenuItem>
            <MenuItem value="2">Duyệt không lương</MenuItem>
            <MenuItem value="3">Từ chối</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f4f6f8" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Thời gian bắt đầu</TableCell>
              <TableCell>Thời gian kết thúc</TableCell>
              <TableCell>Lý do</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow
                key={request.id}
                sx={{
                  "&:hover": { backgroundColor: "#f1f1f1" },
                  transition: "all 0.2s ease",
                }}
              >
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.name}</TableCell>
                <TableCell>
                  {new Date(request.startTime).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(request.endTime).toLocaleString()}
                </TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  {request.approve === 0 && (
                    <Typography color="orange">Chờ duyệt</Typography>
                  )}
                  {request.approve === 1 && (
                    <Typography color="green">Duyệt có lương</Typography>
                  )}
                  {request.approve === 2 && (
                    <Typography color="blue">Duyệt không lương</Typography>
                  )}
                  {request.approve === 3 && (
                    <Typography color="red">Từ chối</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {request.approve === 0 && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleApprovePaid(request.id, request)} // Duyệt có lương
                        sx={{ mr: 1 }}
                      >
                        Duyệt có lương
                      </Button>
                      <Button
                        variant="contained"
                        color="info"
                        onClick={() => handleApprove(request.id, 2)} // Duyệt không lương
                        sx={{ mr: 1 }}
                      >
                        Duyệt không lương
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleReject(request.id)}
                        sx={{ mt: 1 }} // Từ chối
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RequestLeaveManagement;
