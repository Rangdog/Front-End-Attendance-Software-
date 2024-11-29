import React, { useState, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import {
  checkInFinger,
  checkOutFinger,
  checkCheckIntoday,
  checkIfOnLeave,
} from "../api/api";

const AttendanceComponent = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const token = localStorage.getItem("token"); // Assuming you store the token in localStorage
  const userId = localStorage.getItem("userId");
  const [file, setFile] = useState(null); // Lưu trữ file đã chọn
  const [attendance, setAttendance] = useState(null);
  const [isCheckinToday, setisCheckinToday] = useState(false);
  const [isFinish, setIsFinish] = useState(false);
  const [isOnLeave, setIsOnLeave] = useState(false);

  const handleRegisterAttendance = async () => {
    if (!selectedImage) {
      alert("No image selected!");
      return;
    }
    const formData = new FormData();
    formData.append("fingerprint", file);
    const response = await checkInFinger(formData, userId, token);
    console.log(response);
    window.location.reload();
  };

  const handleCheckout = async () => {
    if (!selectedImage) {
      alert("No image selected!");
      return;
    }
    const formData = new FormData();
    formData.append("fingerprint", file);
    if (attendance != null) {
      formData.append("attendanceId", attendance.id);
    } else {
      return;
    }
    const response = await checkOutFinger(formData, userId, token);
    console.log(response);
    window.location.reload();
  };

  const handleImageChange = (e) => {
    setFile(event.target.files[0]);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // Set the image data URL
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const data = await checkCheckIntoday(userId, token); // Dùng await để chờ kết quả từ API
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

    fetchData(); // Gọi hàm bất đồng bộ để lấy dữ liệu
  }, []); // Thêm dependencies để hàm chạy lại khi userId hoặc token thay đổi
  useEffect(() => {
    const fetchData = async () => {
      const data = await checkIfOnLeave(userId, token); // Dùng await để chờ kết quả từ API
      setIsOnLeave(data);
    };

    fetchData(); // Gọi hàm bất đồng bộ để lấy dữ liệu
  }, []); // Thêm dependencies để hàm chạy lại khi userId hoặc token thay đổi
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        borderRadius: "15px",
        padding: 4,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        width: "300px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: 2,
          color: "#333",
        }}
      >
        Fingerprint Attendance
      </Typography>

      {/* Display image preview if selected */}
      {selectedImage && (
        <Box
          sx={{
            width: "100%",
            height: "300px",
            marginBottom: 2,
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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

      {/* Input file for image */}
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
        }}
      />

      {/* Mark Attendance Button */}
      {!isFinish ? (
        // Kiểm tra nếu isFinish là false
        !isCheckinToday ? (
          <Button
            variant="contained"
            onClick={handleRegisterAttendance} // Thực hiện Check In
            disabled={isOnLeave} // Disabled nếu không thỏa điều kiện
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              padding: 2,
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              marginTop: "10px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography>Check In</Typography>
            </Box>
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleCheckout} // Thực hiện Check Out
            disabled={isOnLeave} // Disabled nếu không thỏa điều kiện
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              padding: 2,
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              marginTop: "10px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography>Check Out</Typography>
            </Box>
          </Button>
        )
      ) : (
        // Nếu isFinish là true, hiển thị thông báo đã hoàn thành
        <Typography variant="body1" sx={{ marginTop: "10px" }}>
          Bạn đã hoàn thành Check In và Check Out hôm nay
        </Typography>
      )}
    </Box>
  );
};

export default AttendanceComponent;
