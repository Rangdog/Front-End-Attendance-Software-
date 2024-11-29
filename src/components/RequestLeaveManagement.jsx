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
} from "@mui/material";
import { getALLRequestLeave, rejectRequest, approveRequest } from "../api/api";

const RequestLeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const token = localStorage.getItem("token");

  // Cập nhật hàm approve với async/await và xử lý state sau khi duyệt
  const handleApprove = async (id) => {
    setLoading(true);
    try {
      // Gọi API duyệt yêu cầu
      await approveRequest(id, token);

      // Cập nhật trực tiếp trong state sau khi API trả về
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
  };

  const handleReject = async (id) => {
    setLoading(true);
    try {
      await rejectRequest(id, token);

      // Lấy lại dữ liệu từ API sau khi từ chối yêu cầu
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
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getALLRequestLeave(token);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Gọi hàm fetch
  }, [token]);

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

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f4f6f8" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Thời gian bắt đầu</TableCell>
              <TableCell>Thời gian kết thúc</TableCell>
              <TableCell>Lý do</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request.id}
                sx={{
                  "&:hover": { backgroundColor: "#f1f1f1" },
                  transition: "all 0.2s ease",
                }}
              >
                <TableCell>{request.id}</TableCell>
                <TableCell>
                  {new Date(request.startTime).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(request.endTime).toLocaleString()}
                </TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  {request.approve ? (
                    <Typography color="green">Đã duyệt</Typography>
                  ) : (
                    <Typography color="orange">Chờ duyệt</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {!request.approve && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApprove(request.id)}
                      sx={{ mr: 2 }}
                    >
                      Duyệt
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleReject(request.id)}
                  >
                    Từ chối
                  </Button>
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
