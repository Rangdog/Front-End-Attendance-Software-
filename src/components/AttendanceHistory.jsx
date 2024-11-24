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
    <Container>
      <Typography variant="h4">Lịch sử chấm công</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ngày</TableCell>
            <TableCell>Hành động</TableCell>
            <TableCell>Thời gian</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                {new Date(record.timestamp).toLocaleDateString()}
              </TableCell>
              <TableCell>{record.action}</TableCell>
              <TableCell>
                {new Date(record.timestamp).toLocaleTimeString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default AttendanceHistory;
