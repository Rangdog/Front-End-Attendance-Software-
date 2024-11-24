// src/components/Attendance.js
import { useState } from "react";
import { checkIn, checkOut, getAttendanceHistory } from "../api/api";
import PropTypes from "prop-types";
const Attendance = ({ token, userId }) => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [message, setMessage] = useState("");
  const handleCheckIn = async () => {
    try {
      const attendanceData = { userId, date: new Date() }; // Cung cấp dữ liệu chấm công
      await checkIn(attendanceData, token);
      setMessage("Check-in thành công!");
      fetchAttendanceHistory(); // Cập nhật lịch sử chấm công
    } catch (error) {
      setMessage(`Check-in thất bại! : ${error.message}`);
    }
  };

  const handleCheckOut = async () => {
    try {
      const attendanceData = { userId, date: new Date() }; // Cung cấp dữ liệu chấm công
      await checkOut(attendanceData, token);
      setMessage("Check-out thành công!");
      fetchAttendanceHistory(); // Cập nhật lịch sử chấm công
    } catch (error) {
      setMessage(`Check-out thất bại! : ${error.message}`);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await getAttendanceHistory(userId, token);
      setAttendanceHistory(response.data);
    } catch (error) {
      setMessage(`Không thể lấy lịch sử chấm công! : ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Chấm Công</h2>
      <button onClick={handleCheckIn}>Check In</button>
      <button onClick={handleCheckOut}>Check Out</button>
      {message && <p>{message}</p>}
      <h3>Lịch sử chấm công</h3>
      <ul>
        {attendanceHistory.map((attendance) => (
          <li key={attendance.id}>
            Ngày: {attendance.date}, Check-in: {attendance.checkIn}, Check-out:{" "}
            {attendance.checkOut}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Attendance;

Attendance.propTypes = {
  token: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};
