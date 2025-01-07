import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Fingerprint,
  Face,
  History,
  Logout,
  Person,
  WorkOff,
  Business,
  AccountTree,
  AttachMoney,
  HowToReg,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { checkIn, checkOut, checkHasRequestLeave } from "../api/api";
import { useSnackbar } from "../components/SnackbarContext";
import MoodIcon from "@mui/icons-material/Mood";
const CheckInOut = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // "success" or "error"
  const { showSnackbar } = useSnackbar(); // Sử dụng Snackbar Context

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
      showSnackbar("Đăng xuất thành công!", "success");
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
    handleFaceImage: () => navigate("/face-image"),
    handleFaceImageUser: () => navigate("/face-image-user"),
    handleFingerPrint: () => navigate("/fingerprint-image"),
    handleMonthlySalary: () => navigate("/monthly-salary"),
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  useEffect(() => {
    // Kiểm tra nếu có thông báo trong localStorage
    const storedMessage = localStorage.getItem("snackbarMessage");
    const storedSeverity = localStorage.getItem("snackbarSeverity");

    if (storedMessage) {
      setSnackbarMessage(storedMessage);
      setSnackbarSeverity(storedSeverity || "error");
      setSnackbarOpen(true);

      // Xóa thông báo sau khi đã hiển thị
      localStorage.removeItem("snackbarMessage");
      localStorage.removeItem("snackbarSeverity");
    }
  }, []);

  useEffect(() => {
    const check = async () => {
      if (role === "[ADMIN]") {
        const res = await checkHasRequestLeave(token);
        if (res.data) {
          showSnackbar(
            "Có đơn xin nghỉ chưa được duyệt vui lòng kiểm tra",
            "success"
          );
        }
      }
    };
    check();
  }, [token, role]);
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
        }}
      >
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Quản Lý Chấm Công
        </Typography>

        {isCheckedIn ? (
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCheckOut}
              size="large"
              sx={{
                backgroundColor: "#f44336",
                "&:hover": { backgroundColor: "#d32f2f" },
              }}
            >
              Chấm Công Ra
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <Face sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Chấm Công Bằng Khuôn Mặt
                </Typography>
                <Button
                  variant="contained"
                  onClick={navigationHandlers.handleFaceCheckIn}
                >
                  Thực hiện
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <Face sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Chấm Công Bằng Vân tay
                </Typography>
                <Button
                  variant="contained"
                  onClick={navigationHandlers.handleRecognizeFingerPrint}
                >
                  Thực hiện
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <History sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Xem Lịch Sử Chấm Công
                </Typography>
                <Button
                  variant="contained"
                  onClick={navigationHandlers.handleAttendanceHistory}
                >
                  Thực hiện
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <HowToReg sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Đăng Ký Khuôn Mặt
                </Typography>
                <Button
                  variant="contained"
                  onClick={navigationHandlers.handleRegisterFaceRecognition}
                >
                  Thực hiện
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <HowToReg sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Xem các khuôn mặt đã đăng ký
                </Typography>
                <Button
                  variant="contained"
                  onClick={navigationHandlers.handleFaceImageUser}
                >
                  Thực hiện
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <WorkOff sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Xin Nghỉ
                </Typography>
                <Button
                  variant="contained"
                  onClick={navigationHandlers.handleRequestLeave}
                >
                  Thực hiện
                </Button>
              </Card>
            </Grid>
          </Grid>
        )}

        <Box mt={5}>
          <Typography variant="h5" gutterBottom>
            Quản Lý Thông Tin
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <Person sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Thông Tin Cá Nhân
                </Typography>
                <Button
                  variant="contained"
                  onClick={navigationHandlers.handlePersonalInformation}
                >
                  Xem chi tiết
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <AttachMoney sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Lương tháng
                </Typography>
                <Button
                  variant="contained"
                  onClick={navigationHandlers.handleMonthlySalary}
                >
                  Thực hiện
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                <Logout sx={{ fontSize: 50, color: "#d32f2f", mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Đăng Xuất
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={navigationHandlers.handleLogout}
                >
                  Đăng xuất
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {role === "[ADMIN]" && (
          <Box mt={5}>
            <Typography variant="h5" gutterBottom>
              Dành Cho Admin
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                  <AttachMoney sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Xuất Bảng Lương
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={navigationHandlers.handleSalary}
                  >
                    Thực hiện
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                  <LocationOn sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Quản Lý Map
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={navigationHandlers.handleMap}
                  >
                    Thực hiện
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                  <AccountTree sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Quản Lý Yêu Cầu Nghỉ
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={navigationHandlers.handleRequestLeaveManager}
                  >
                    Thực hiện
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                  <Business sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Quản Lý Nhân Viên
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={navigationHandlers.handleEmployeeTable}
                  >
                    Thực hiện
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                  <HowToReg sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Đăng ký nhân viên
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={navigationHandlers.handleRegisterAcc}
                  >
                    Thực hiện
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                  <MoodIcon sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Quản lý khuôn mặt
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={navigationHandlers.handleFaceImage}
                  >
                    Thực hiện
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                  <Fingerprint sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Đăng Ký Vân Tay
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={navigationHandlers.handleRegisterFingerPrint}
                  >
                    Thực hiện
                  </Button>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ textAlign: "center", p: 2 }}>
                  <MoodIcon sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Quản lý vân tay
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={navigationHandlers.handleFingerPrint}
                  >
                    Thực hiện
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            borderRadius: "8px",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CheckInOut;
