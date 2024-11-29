import { useEffect, useState } from "react";
import { getAttendanceHistory } from "../api/api";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Box,
} from "@mui/material";

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await getAttendanceHistory(userId);
      setHistory(response.data === "" ? [] : response.data);
    };
    fetchHistory();
  }, [userId]);

  return (
    <Container maxWidth="md" style={{ marginTop: "30px" }}>
      <Box
        sx={{
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          style={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Lịch sử chấm công
        </Typography>
        <Typography variant="subtitle1" style={{ color: "rgba(0, 0, 0, 0.6)" }}>
          Xem lại thông tin chấm công chi tiết của bạn
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#1976d2" }}>
              <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                Ngày
              </TableCell>
              <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                Hành động
              </TableCell>
              <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                Thời gian
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length > 0 ? (
              history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {new Date(record.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{record.action}</TableCell>
                  <TableCell>
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography
                    variant="body1"
                    style={{ color: "rgba(0, 0, 0, 0.6)" }}
                  >
                    Không có dữ liệu chấm công
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AttendanceHistory;
