import { useEffect, useState } from "react";
import { getAttendanceHistory } from "../api/api"; // Import hàm API
import { Container, Typography, Box, Chip, Paper } from "@mui/material";
import AttendanceDetailsModal from "./AttendanceDetailsModal";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/AttendanceCalendar.css"; // Tạo file CSS tùy chỉnh

const AttendanceCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDateRecords, setSelectedDateRecords] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const token = localStorage.getItem("token");

  const fetchAttendanceHistory = async (startDate, endDate) => {
    const userId = localStorage.getItem("userId");
    const response = await getAttendanceHistory(
      userId,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
      token
    );
    setAttendanceRecords(response);
  };

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      const userId = localStorage.getItem("userId");
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const response = await getAttendanceHistory(
        userId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        token
      );
      const records = Array.isArray(response) ? response : [];
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
      if (Array.isArray(attendanceRecords)) {
        const record = attendanceRecords.find((r) => r.date === formattedDate);
        if (record) {
          return record.finish ? "tile-finish-true" : "tile-finish-false";
        }
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
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Paper
        style={{
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography
            variant="h4"
            component="h1"
            style={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Lịch Chấm Công
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Xem trạng thái chấm công của bạn theo từng ngày
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" mb={2}>
          <Chip
            label="Hoàn thành"
            style={{
              backgroundColor: "#4caf50",
              color: "#fff",
              marginRight: "8px",
            }}
          />
          <Chip
            label="Chưa hoàn thành"
            style={{ backgroundColor: "#f44336", color: "#fff" }}
          />
        </Box>

        <Calendar
          onChange={handleDateChange}
          onActiveStartDateChange={handleMonthChange}
          value={date}
          tileClassName={getTileClassName}
          className="custom-calendar"
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
