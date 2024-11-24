import { useState } from "react";
import {
  Button,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import * as XLSX from "xlsx"; // Importing the library
import { exportSalary } from "../api/api";

const SalaryExportComponent = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current Month
  const [year, setYear] = useState(new Date().getFullYear()); // Current Year
  const [salaryData, setSalaryData] = useState([]);
  const [fileName, setFileName] = useState("Bảng_Lương");
  const token = localStorage.getItem("token");

  // Handle Month Change
  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  // Handle Year Change
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  // Fetch Salary Data
  const handleExport = async () => {
    try {
      const response = await exportSalary({ month, year }, token);
      console.log(response);
      setSalaryData(response); // Update Salary Data
    } catch (error) {
      console.error("Error fetching salary data:", error);
      alert("Không thể tải dữ liệu lương!");
    }
  };

  // Export Data to Excel
  const exportToExcel = () => {
    // Reorder the columns
    const reorderedData = salaryData.map((item) => ({
      userId: item.userId,
      name: item.name,
      month: item.month,
      year: item.year,
      position: item.position,
      effectiveDays: item.effectiveDays,
      totalSalary: item.totalSalary,
    }));

    const ws = XLSX.utils.json_to_sheet(reorderedData); // Convert reordered data to a sheet
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, "Salary Data"); // Append the sheet to the workbook
    XLSX.writeFile(wb, `${fileName}.xlsx`); // Trigger the download of the file
  };

  return (
    <Box sx={{ p: 4 }}>
      <FormControl sx={{ m: 2, minWidth: 120 }}>
        <InputLabel>Tháng</InputLabel>
        <Select value={month} onChange={handleMonthChange}>
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {i + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ m: 2, minWidth: 120 }}>
        <InputLabel>Năm</InputLabel>
        <Select value={year} onChange={handleYearChange}>
          {Array.from({ length: 5 }, (_, i) => (
            <MenuItem key={year - i} value={year - i}>
              {year - i}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        onClick={handleExport}
        sx={{ m: 2 }}
      >
        Tải Dữ Liệu Lương
      </Button>

      {salaryData.length > 0 && (
        <Button
          variant="contained"
          color="secondary"
          onClick={exportToExcel}
          sx={{ m: 2 }}
        >
          Xuất Excel
        </Button>
      )}
    </Box>
  );
};

export default SalaryExportComponent;
