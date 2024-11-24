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
} from "@mui/material";
import { getALLRequestLeave, rejectRequest, approveRequest } from "../api/api";

const RequestLeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  // Cập nhật hàm approve với async/await và xử lý state sau khi duyệt
  const handleApprove = async (id) => {
    try {
      // Gọi API duyệt yêu cầu
      await approveRequest(id, token);

      // Cập nhật trực tiếp trong state sau khi API trả về
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, approve: true } : request
        )
      );
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id, token);

      // Lấy lại dữ liệu từ API nếu cần thiết
      const data = await getALLRequestLeave(token);
      setRequests(data);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getALLRequestLeave(token);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Gọi hàm fetch
  }, [token]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Request Leave Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.startTime}</TableCell>
                <TableCell>{request.endTime}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  {request.approve ? (
                    <Typography color="green">Approved</Typography>
                  ) : (
                    <Typography color="red">Pending</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {!request.approve && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApprove(request.id)}
                      style={{ marginRight: 8 }}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RequestLeaveManagement;
