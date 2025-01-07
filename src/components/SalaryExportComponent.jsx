import { useState } from "react";
import {
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Snackbar,
  IconButton,
} from "@mui/material";
import { exportSalary } from "../api/api";
import { Close } from "@mui/icons-material";
import * as XLSX from "xlsx-js-style";

const SalaryExportComponent = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current Month
  const [year, setYear] = useState(new Date().getFullYear()); // Current Year
  const [salaryData, setSalaryData] = useState([]);
  const [fileName, setFileName] = useState("Bảng_Lương");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Notification
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const token = localStorage.getItem("token");

  // Handle Month Change
  const handleMonthChange = (event) => setMonth(event.target.value);

  // Handle Year Change
  const handleYearChange = (event) => setYear(event.target.value);

  // Fetch Salary Data
  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await exportSalary({ month, year }, token);
      setSalaryData(response); // Update Salary Data
      console.log(response);
      setSnackbarMessage("Dữ liệu lương đã được tải thành công!");
    } catch (error) {
      console.error("Error fetching salary data:", error);
      setSnackbarMessage("Không thể tải dữ liệu lương!");
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };
  const formatDate = (dateArray) => {
    if (Array.isArray(dateArray) && dateArray.length === 3) {
      const [year, month, day] = dateArray;
      const formattedDate = `${String(day).padStart(2, "0")}/${String(
        month
      ).padStart(2, "0")}/${year}`;
      return formattedDate;
    }
    return null; // Trả về null nếu dateArray không hợp lệ
  };
  // Export Data to Excel
  const exportSalaryToExcel = async () => {
    setIsLoading(true);
    try {
      // Bước 1: Gọi API để lấy dữ liệu lương
      const response = await exportSalary({ month, year }, token);
      const salaryData = response; // Gán dữ liệu từ API vào salaryData

      // Bước 2: Chuẩn bị dữ liệu cho Excel
      const combinedData = [];
      salaryData?.forEach((item) => {
        item.dailyDetails.forEach((detail) => {
          combinedData.push({
            "Mã nhân viên": item["userId"],
            "Tên Nhân viên": item["Tên"],
            "Vị trí": item["Vị trí"],
            "Ngày chấm công": formatDate(detail["ngày"]),
            "Thời gian checkin": detail["Thời gian chấm công vào"],
            "Thời gian checkout": detail["thời gian chấm công ra"],
            "Ngày công": detail["ngày công"],
            "Tiền phạt": detail["tiền phạt"],
            "Tổng lương": item["Tổng lương"],
            "Tổng ngày công": item["Tổng ngày công"],
            "Tổng tiền phạt": item["Tổng tiền phạt"],
            "Tiền thực nhận": item["Tiền thực nhận"],
          });
        });
      });

      // Bước 3: Tạo sheet Excel với dữ liệu và màu sắc
      const ws = XLSX.utils.json_to_sheet(combinedData);

      const userIdColors = {};
      let colorIndex = 0;
      const colors = [
        "FFDDC1", // Peach
        "FFABAB", // Light Red
        "FFC3A0", // Salmon
        "D5AAFF", // Lavender
        "85E3FF", // Light Blue
        "B9FBC0", // Mint
      ];

      combinedData.forEach((row, index) => {
        if (!userIdColors[row["Mã nhân viên"]]) {
          userIdColors[row["Mã nhân viên"]] =
            colors[colorIndex % colors.length];
          colorIndex++;
        }
        const color = userIdColors[row["Mã nhân viên"]];

        Object.keys(row).forEach((key, colIndex) => {
          const cellAddress = XLSX.utils.encode_cell({
            r: index + 1,
            c: colIndex,
          });
          if (!ws[cellAddress]) ws[cellAddress] = {};
          ws[cellAddress].s = {
            fill: {
              fgColor: { rgb: color },
            },
            alignment: {
              vertical: "center", // Căn giữa dọc
              horizontal: "center", // Căn giữa ngang
            },
          };
        });
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Salary Data");

      // Bước 4: Xuất file Excel
      XLSX.writeFile(wb, `${fileName}.xlsx`);

      setSnackbarMessage("Dữ liệu đã được tải và xuất thành công!");
    } catch (error) {
      console.error("Error exporting salary data:", error);
      setSnackbarMessage("Không thể tải hoặc xuất dữ liệu lương!");
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography
            variant="h4"
            sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
          >
            Xuất Bảng Lương
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
            Chọn tháng và năm để tải dữ liệu lương, sau đó xuất ra file Excel.
          </Typography>

          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tháng</InputLabel>
                <Select value={month} onChange={handleMonthChange}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Năm</InputLabel>
                <Select value={year} onChange={handleYearChange}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <MenuItem key={year - i} value={year - i}>
                      {year - i}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={exportSalaryToExcel}
              >
                Xuất Excel
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default SalaryExportComponent;
