import { useEffect, useState } from "react";
import { getPayroll } from "../api/api"; // Thêm hàm api cho bảng lương
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const Payroll = () => {
  const [payrollData, setPayrollData] = useState([]);
  const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchPayroll = async () => {
      const response = await getPayroll(userId, month, year);
      setPayrollData(response.data);
    };

    fetchPayroll();
  }, [userId, month, year]);

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  return (
    <Container>
      <Typography variant="h4">Bảng Lương</Typography>
      <div>
        <select value={month} onChange={handleMonthChange}>
          {[...Array(12)].map((_, index) => (
            <option key={index} value={index + 1}>
              Tháng {index + 1}
            </option>
          ))}
        </select>

        <select value={year} onChange={handleYearChange}>
          {[2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tháng</TableCell>
            <TableCell>Năm</TableCell>
            <TableCell>Tổng Giờ</TableCell>
            <TableCell>Lương</TableCell>
            <TableCell>Phạt</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payrollData.map((payroll) => (
            <TableRow key={payroll.id}>
              <TableCell>{payroll.month}</TableCell>
              <TableCell>{payroll.year}</TableCell>
              <TableCell>{payroll.totalHours}</TableCell>
              <TableCell>{payroll.salary}</TableCell>
              <TableCell>{payroll.penalties}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default Payroll;
