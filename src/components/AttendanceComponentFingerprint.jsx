import React, { useState, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import {
  checkInFinger,
  checkOutFinger,
  checkCheckIntoday,
  checkIfOnLeave,
} from "../api/api";
import CheckInModalFingerprint from "./CheckInModalFingerprint";
import { useNavigate } from "react-router-dom";
const AttendanceComponent = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const employeeId = localStorage.getItem("employeeId");
  const [file, setFile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [isCheckinToday, setisCheckinToday] = useState(false);
  const [isFinish, setIsFinish] = useState(false);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [message, setMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const handleCheckinSuccess = (name, time, title) => {
    setEmployeeName(name);
    setCheckinTime(time);
    setTitle(title);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    navigate("/attendance");
  };
  const handleRegisterAttendance = async () => {
    if (!selectedImage) {
      alert("Hình chưa được chọn");
      return;
    }
    const formData = new FormData();
    formData.append("fingerprint", file);
    const response = await checkInFinger(formData, employeeId, token);
    console.log(response);
    if (response.status === 200) {
      const currentTime = new Date().toLocaleTimeString("vi-VN"); // Lấy giờ hiện tại
      handleCheckinSuccess(
        response.data.name,
        currentTime,
        "Chấm công vào thành công"
      );
    } else {
      setMessage("Thất bại vui lòng thử lại");
    }
  };

  const handleCheckout = async () => {
    if (!selectedImage) {
      alert("Hình chưa được chọn");
      return;
    }
    const formData = new FormData();
    formData.append("fingerprint", file);
    if (attendance != null) {
      formData.append("attendanceId", attendance.id);
    } else {
      return;
    }
    const response = await checkOutFinger(formData, employeeId, token);
    console.log(response);
    if (response.status === 200) {
      const currentTime = new Date().toLocaleTimeString("vi-VN"); // Lấy giờ hiện tại
      handleCheckinSuccess(
        response.data.name,
        currentTime,
        "Chấm công ra thành công"
      );
    } else {
      setMessage("Thất bại vui lòng thử lại");
    }
  };

  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await checkCheckIntoday(employeeId, token);
      if (data === "") {
        return;
      }
      setAttendance(data);
      if (data.checkIn !== "") {
        setisCheckinToday(true);
      }
      if (data.checkOut !== "") {
        setIsFinish(true);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await checkIfOnLeave(employeeId, token);
      setIsOnLeave(data);
    };
    fetchData();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
        borderRadius: "20px",
        padding: "30px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
        width: "350px",
        margin: "40px auto",
        textAlign: "center",
      }}
    >
      <CheckInModalFingerprint
        open={openModal}
        handleClose={handleCloseModal}
        name={employeeName}
        time={checkinTime}
        title={title}
      />
      <Typography
        sx={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: 2,
          color: "#1976d2",
        }}
      >
        Chấm công bằng vân tay
      </Typography>

      {selectedImage && (
        <Box
          sx={{
            width: "100%",
            height: "250px",
            marginBottom: "20px",
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <img
            src={selectedImage}
            alt="Selected"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{
          marginBottom: "16px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #1976d2",
          fontSize: "16px",
          width: "100%",
          textAlign: "center",
          background: "#f0f8ff",
          cursor: "pointer",
        }}
      />

      {!isFinish ? (
        !isCheckinToday ? (
          <Button
            variant="contained"
            onClick={handleRegisterAttendance}
            disabled={isOnLeave}
            sx={{
              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "10px 20px",
              borderRadius: "8px",
              "&:hover": {
                background: "linear-gradient(90deg, #42a5f5, #1976d2)",
              },
              marginTop: "10px",
            }}
          >
            <FingerprintIcon sx={{ marginRight: "8px" }} />
            Chấm công vào
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleCheckout}
            disabled={isOnLeave}
            sx={{
              background: "linear-gradient(90deg, #ff8a65, #ff7043)",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "10px 20px",
              borderRadius: "8px",
              "&:hover": {
                background: "linear-gradient(90deg, #ff7043, #ff8a65)",
              },
              marginTop: "10px",
            }}
          >
            <FingerprintIcon sx={{ marginRight: "8px" }} />
            Chấm công ra
          </Button>
        )
      ) : (
        <Typography
          variant="body1"
          sx={{
            marginTop: "20px",
            color: "green",
            fontWeight: "bold",
          }}
        >
          Bạn đã hoàn thành chấm công hôm nay
        </Typography>
      )}
      {message && (
        <Typography
          variant="body1"
          sx={{
            marginTop: 3,
            color: message.includes("thành công") ? "green" : "red",
            textAlign: "center",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default AttendanceComponent;
