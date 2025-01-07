import { useEffect, useState } from "react";
import { getAttendanceHistory } from "../api/api";
import {
  Container,
  Typography,
  Box,
  Chip,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/AttendanceCalendar.css"; // Tạo file CSS tùy chỉnh
import AttendanceDetailsModal from "./AttendanceDetailsModal";

const AttendanceCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDateRecords, setSelectedDateRecords] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const token = localStorage.getItem("token");

  const fetchAttendanceHistory = async (startDate, endDate) => {
    const employee_id = localStorage.getItem("employeeId");
    const response = await getAttendanceHistory(
      employee_id,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
      token
    );
    setAttendanceRecords(response);
  };

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      const employeeId = localStorage.getItem("employeeId");
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const response = await getAttendanceHistory(
        employeeId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        token
      );
      const records = Array.isArray(response) ? response : [];
      console.log(employeeId);
      console.log(records);
      setAttendanceRecords(records);
    };
    fetchAttendanceHistory();
  }, [date]);

  const handleDateChange = (value) => {
    setDate(value);
    const adjustedDate = new Date(value);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    const selectedDate = adjustedDate.toISOString().split("T")[0];
    const recordsForSelectedDate = attendanceRecords.filter(
      (record) => record.date === selectedDate
    );
    setSelectedDateRecords(recordsForSelectedDate);
    setOpenModal(true);
  };

  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      const formattedDate = adjustedDate.toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];

      if (new Date(date).getDay() === 0 || new Date(date).getDay() === 6) {
        return "tile-weekend";
      }

      if (Array.isArray(attendanceRecords)) {
        const record = attendanceRecords.find((r) => r.date === formattedDate);
        if (record) {
          return record.finish ? "tile-finish-true" : "tile-finish-false";
        }
      }

      if (adjustedDate < new Date() && formattedDate < today) {
        return "tile-missing";
      }
    }
    return null;
  };

  const handleMonthChange = ({ activeStartDate }) => {
    const startDate = activeStartDate;
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );
    fetchAttendanceHistory(startDate, endDate);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.8), rgba(33,150,243,0.8))",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        <Box textAlign="center" mb={3}>
          <Avatar
            sx={{
              bgcolor: "#4caf50",
              width: 60,
              height: 60,
              mx: "auto",
              mb: 2,
            }}
          >
            🗓️
          </Avatar>
          <Typography variant="h4" fontWeight="bold">
            Lịch Chấm Công
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Theo dõi trạng thái chấm công hàng ngày của bạn
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
          <Chip
            label="Hoàn thành"
            sx={{
              bgcolor: "#4caf50",
              color: "#fff",
              fontWeight: "bold",
              px: 2,
            }}
          />
          <Chip
            label="Chưa hoàn thành"
            sx={{
              bgcolor: "#f44336",
              color: "#fff",
              fontWeight: "bold",
              px: 2,
            }}
          />
          <Chip
            label="Cuối tuần"
            sx={{
              bgcolor: "#9e9e9e",
              color: "#fff",
              fontWeight: "bold",
              px: 2,
            }}
          />
        </Stack>

        <Calendar
          onChange={handleDateChange}
          onActiveStartDateChange={handleMonthChange}
          value={date}
          tileClassName={getTileClassName}
          className="custom-calendar modern-calendar"
        />
      </Paper>

      <AttendanceDetailsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        records={selectedDateRecords}
        selectedDate={date}
      />
    </Container>
  );
};

export default AttendanceCalendar;
