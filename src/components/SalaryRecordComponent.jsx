import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { getMonthSalary } from "../api/api";
import axios from "axios";

const SalaryRecordComponent = () => {
  const [employeeId, setEmployeeId] = useState(
    localStorage.getItem("employeeId")
  );
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [salaryRecord, setSalaryRecord] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  const fetchSalaryRecord = async () => {
    setLoading(true);
    setError("");
    setSalaryRecord(null);

    try {
      const response = await getMonthSalary(employeeId, year, month, token);
      if (response.status === 200) {
        setSalaryRecord(response.data);
        console.log(response.data);
      } else {
        setError("Không tìm thấy bản ghi hoặc đã xảy ra lỗi!");
      }
    } catch (err) {
      setError("Không tìm thấy bản ghi hoặc đã xảy ra lỗi!");
    } finally {
      setLoading(false);
    }
  };
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Năm (từ 2000 đến hiện tại)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        background: "linear-gradient(135deg, #f3f4f6, #ffffff)",
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ marginBottom: 3, textAlign: "center" }}
          >
            Tra cứu thông tin lương
          </Typography>

          {/* Chọn Tháng */}
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="month-select-label">Chọn tháng</InputLabel>
            <Select
              labelId="month-select-label"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              label="Chọn tháng"
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {`Tháng ${month}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Chọn Năm */}
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="year-select-label">Chọn năm</InputLabel>
            <Select
              labelId="year-select-label"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              label="Chọn năm"
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Nút Tra cứu */}
          <Button
            variant="contained"
            color="primary"
            onClick={fetchSalaryRecord}
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              padding: "10px 20px",
              marginTop: 2,
              width: "100%",
            }}
            disabled={loading || !month || !year}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Tra cứu"
            )}
          </Button>

          {/* Hiển thị lỗi */}
          {error && (
            <Typography
              variant="body1"
              sx={{ color: "red", textAlign: "center", marginTop: 2 }}
            >
              {error}
            </Typography>
          )}

          {/* Hiển thị thông tin lương */}
          {salaryRecord && (
            <Box sx={{ marginTop: 3 }}>
              <Typography variant="body1">
                <strong>Mã nhân viên:</strong> {salaryRecord.employeeId}
              </Typography>
              <Typography variant="body1">
                <strong>Tháng:</strong> {salaryRecord.id.month}
              </Typography>
              <Typography variant="body1">
                <strong>Năm:</strong> {salaryRecord.id.year}
              </Typography>
              <Typography variant="body1">
                <strong>Số ngày làm việc:</strong> {salaryRecord.totalWorkDays}
              </Typography>
              <Typography variant="body1">
                <strong>Tổng tiền phạt:</strong>{" "}
                {formatVND(salaryRecord.totalPenalty)}
              </Typography>
              <Typography variant="body1">
                <strong>Lương thực nhận:</strong>{" "}
                {formatVND(salaryRecord.netSalary)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6c757d" }}>
                (Dữ liệu được tạo lúc: {salaryRecord.createdAt})
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalaryRecordComponent;
