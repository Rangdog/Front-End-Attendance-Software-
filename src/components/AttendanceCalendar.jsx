import { useEffect, useState } from "react";
import { getAttendanceHistory } from "../api/api"; // Import hàm API
import { Container, Typography } from "@mui/material";
import AttendanceDetailsModal from "./AttendanceDetailsModal";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/AttendanceCalendar.css"; // Tạo file CSS cho các kiểu dáng tùy chỉnh

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
    console.log("Attendance Records:", response);
    setAttendanceRecords(response);
  };

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      const userId = localStorage.getItem("userId");
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      console.log(endDate);
      const response = await getAttendanceHistory(
        userId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        token
      );
      console.log(response);
      setAttendanceRecords(response);
    };
    fetchAttendanceHistory();
  }, [date]);

  const handleDateChange = (value) => {
    setDate(value);
    // Cộng thêm 1 ngày vào value
    const nextDay = new Date(value);
    nextDay.setDate(nextDay.getDate() + 1);

    // Chuyển ngày thành định dạng ISO và lấy phần ngày
    const formattedDate = nextDay.toISOString().split("T")[0];

    // Lọc các bản ghi phù hợp với ngày đã cộng thêm
    const recordsForSelectedDate = attendanceRecords.filter(
      (record) => record.date === formattedDate
    );

    setSelectedDateRecords(recordsForSelectedDate);
    setOpenModal(true);
  };

  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = date.toISOString().split("T")[0];
      if (!Array.isArray(attendanceRecords)) {
        console.error("attendanceRecords is not an array", attendanceRecords);
        return ""; // Hoặc giá trị mặc định
      }
      const record = attendanceRecords.find((r) => {
        // Chuyển r.date thành đối tượng Date
        const recordDate = new Date(r.date);
        // Giảm 1 ngày
        recordDate.setDate(recordDate.getDate() - 1);
        // So sánh với formattedDate (ngày đã chọn)
        const formattedRecordDate = recordDate.toISOString().split("T")[0]; // Chuyển ngày đã giảm thành chuỗi YYYY-MM-DD
        return formattedRecordDate === formattedDate;
      });

      if (record) {
        return record.finish ? "tile-finish-true" : "tile-finish-false";
      }
    }
    return null;
  };

  const handleMonthChange = ({ activeStartDate }) => {
    const startDate = activeStartDate; // Ngày đầu tháng mới
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    ); // Ngày cuối tháng mới
    fetchAttendanceHistory(startDate, endDate);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Lịch Chấm Công
      </Typography>
      <Calendar
        onChange={handleDateChange}
        onActiveStartDateChange={handleMonthChange}
        value={date}
        tileClassName={getTileClassName}
      />
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
