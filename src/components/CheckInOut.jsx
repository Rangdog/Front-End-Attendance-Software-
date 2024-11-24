import { useState } from "react";
import { checkIn, checkOut } from "../api/api";
import { Container, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
const CheckInOut = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const handleCheckIn = async () => {
    const response = await checkIn({ userId, date: new Date() }, token);
    if (response.status === 200) {
      setIsCheckedIn(true);
      alert("Chấm công vào thành công!");
    }
  };

  const handleCheckOut = async () => {
    const response = await checkOut({ userId, date: new Date() });
    if (response.status === 200) {
      setIsCheckedIn(false);
      alert("Chấm công ra thành công!");
    }
  };

  const handleFaceCheckIn = () => {
    navigate("/face-detection");
  };

  const handleRegisterFaceRecognition = () => {
    navigate("/register-face-recognition");
  };

  const handleAttendanceHistory = () => {
    navigate("/history");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handlePersonalInformation = () => {
    navigate("/employee-infor");
  };

  const handleSalary = () => {
    navigate("/salary");
  };

  const handleMap = () => {
    navigate("/address-manager");
  };

  const handleRequestLeave = () => {
    navigate("/request-leave");
  };

  const handleRequestLeaveManager = () => {
    navigate("/request-manager");
  };
  const handleEmployeeTable = () => {
    navigate("/employee-table");
  };

  return (
    <Container>
      <></>
      <Typography variant="h4">Chấm Công</Typography>
      {isCheckedIn ? (
        <Button variant="contained" color="secondary" onClick={handleCheckOut}>
          Chấm Công Ra
        </Button>
      ) : (
        <>
          <div>
            <Button
              onClick={handleFaceCheckIn}
              variant="contained"
              color="secondary"
              style={{ marginLeft: "10px" }}
            >
              Chấm Công Bằng Khuôn Mặt
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRegisterFaceRecognition}
              style={{ marginLeft: "10px" }}
            >
              Đăng ký khuôn mặt
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAttendanceHistory}
              style={{ marginLeft: "10px" }}
            >
              Xem lịch sủ chấm công
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRequestLeave}
              style={{ marginLeft: "10px" }}
            >
              Xin Nghỉ
            </Button>
          </div>
          <div style={{ marginTop: "20px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePersonalInformation}
              style={{ marginLeft: "10px" }}
            >
              Thông tin cá nhân
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              style={{ marginLeft: "10px" }}
            >
              Logout
            </Button>
          </div>
        </>
      )}
      {role === "[ADMIN]" ? (
        <div style={{ marginTop: "20px" }}>
          <Button variant="contained" color="primary" onClick={handleSalary}>
            Xuất bản lương
          </Button>
          <Button variant="contained" color="primary" onClick={handleMap}>
            Quản lý map
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequestLeaveManager}
          >
            Quản lý yêu cầu nghỉ
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEmployeeTable}
          >
            Quản lý nhân viên
          </Button>
        </div>
      ) : (
        ""
      )}
    </Container>
  );
};

export default CheckInOut;
