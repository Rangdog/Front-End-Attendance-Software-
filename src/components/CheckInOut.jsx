import React, { useState } from "react";
import {
  Container,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { checkIn, checkOut } from "../api/api";

const CheckInOut = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const userId = localStorage.getItem("userId");
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

  const navigationHandlers = {
    handleFaceCheckIn: () => navigate("/face-detection"),
    handleRegisterFaceRecognition: () => navigate("/register-face-recognition"),
    handleAttendanceHistory: () => navigate("/history"),
    handleLogout: () => {
      localStorage.clear();
      navigate("/");
    },
    handlePersonalInformation: () => navigate("/employee-infor"),
    handleSalary: () => navigate("/salary"),
    handleMap: () => navigate("/address-manager"),
    handleRequestLeave: () => navigate("/request-leave"),
    handleRequestLeaveManager: () => navigate("/request-manager"),
    handleEmployeeTable: () => navigate("/employee-table"),
    handleRegisterFingerPrint: () => navigate("/register-fingerprint"),
    handleRecognizeFingerPrint: () => navigate("/recognize-fingerprint"),
    handleRegisterAcc: () => navigate("/register"),
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Quản Lý Chấm Công
        </Typography>
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            {isCheckedIn ? (
              <Box textAlign="center">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCheckOut}
                  size="large"
                >
                  Chấm Công Ra
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={navigationHandlers.handleFaceCheckIn}
                  >
                    Chấm Công Bằng Khuôn Mặt
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={navigationHandlers.handleRegisterFaceRecognition}
                  >
                    Đăng Ký Khuôn Mặt
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={navigationHandlers.handleRegisterFingerPrint}
                  >
                    Đăng Ký Vân Tay
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={navigationHandlers.handleRecognizeFingerPrint}
                  >
                    Chấm Công Bằng Vân Tay
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={navigationHandlers.handleAttendanceHistory}
                  >
                    Xem Lịch Sử Chấm Công
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={navigationHandlers.handleRequestLeave}
                  >
                    Xin Nghỉ
                  </Button>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        <Box mt={3}>
          <Typography variant="h5" gutterBottom>
            Quản Lý Thông Tin
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={navigationHandlers.handlePersonalInformation}
              >
                Thông Tin Cá Nhân
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={navigationHandlers.handleLogout}
              >
                Logout
              </Button>
            </Grid>
          </Grid>
        </Box>

        {role === "[ADMIN]" && (
          <Box mt={5}>
            <Typography variant="h5" gutterBottom>
              Dành Cho Admin
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={navigationHandlers.handleSalary}
                >
                  Xuất Bản Lương
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={navigationHandlers.handleMap}
                >
                  Quản Lý Map
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={navigationHandlers.handleRequestLeaveManager}
                >
                  Quản Lý Yêu Cầu Nghỉ
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={navigationHandlers.handleEmployeeTable}
                >
                  Quản Lý Nhân Viên
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={navigationHandlers.handleRegisterAcc}
                >
                  Đăng ký nhân viên
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CheckInOut;
