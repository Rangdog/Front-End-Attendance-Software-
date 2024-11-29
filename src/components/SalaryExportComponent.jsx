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
import * as XLSX from "xlsx";
import { exportSalary } from "../api/api";
import { Close } from "@mui/icons-material";

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
      setSnackbarMessage("Dữ liệu lương đã được tải thành công!");
    } catch (error) {
      console.error("Error fetching salary data:", error);
      setSnackbarMessage("Không thể tải dữ liệu lương!");
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Export Data to Excel
  const exportToExcel = () => {
    const reorderedData = salaryData.map((item) => ({
      userId: item.userId,
      name: item.name,
      month: item.month,
      year: item.year,
      position: item.position,
      effectiveDays: item.effectiveDays,
      totalSalary: item.totalSalary,
    }));
    const ws = XLSX.utils.json_to_sheet(reorderedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary Data");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    setSnackbarMessage("Dữ liệu đã được xuất thành công!");
    setSnackbarOpen(true);
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
                color="primary"
                fullWidth
                onClick={handleExport}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Tải Dữ Liệu"}
              </Button>
            </Grid>

            {salaryData.length > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={exportToExcel}
                >
                  Xuất Excel
                </Button>
              </Grid>
            )}
          </Grid>

          {salaryData.length === 0 && !isLoading && (
            <Typography
              variant="body2"
              sx={{
                mt: 4,
                textAlign: "center",
                color: "gray",
              }}
            >
              Không có dữ liệu để hiển thị.
            </Typography>
          )}
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
