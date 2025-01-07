import { useState, useEffect } from "react";
import { loginUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSnackbar } from "../components/SnackbarContext";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // "success" or "error"
  const { showSnackbar } = useSnackbar(); // Sử dụng Snackbar Context
  const navigate = useNavigate();

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
  const getTokenData = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ username, password });
      localStorage.setItem("token", response.jwt);
      localStorage.setItem("token", response.jwt);
      const tokenData = getTokenData(response.jwt);
      localStorage.setItem("employeeId", tokenData.employeeId);
      localStorage.setItem("role", tokenData.role);
      localStorage.setItem("userId", tokenData.userId);
      showSnackbar("Đăng nhập thành công!", "success"); // Hiển thị thông báo
      navigate("/attendance");
    } catch (err) {
      showSnackbar(
        "Thông tin đăng nhập không chính xác. Vui lòng thử lại.",
        "error"
      );
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="xs" sx={{ marginTop: 10 }}>
      <Box
        sx={{
          boxShadow: 6,
          padding: 5,
          borderRadius: 4,
          background: "linear-gradient(135deg, #f1f8e9, #ffffff)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            textShadow: "0px 2px 3px rgba(25, 118, 210, 0.4)",
          }}
        >
          HỆ THỐNG CHẤM CÔNG
        </Typography>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 500,
            color: "#424242",
            marginBottom: 3,
          }}
        >
          Đăng Nhập
        </Typography>
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <TextField
            label="Tên đăng nhập"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
              "& .MuiInputLabel-root": {
                color: "#9e9e9e",
              },
            }}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
              "& .MuiInputLabel-root": {
                color: "#9e9e9e",
              },
            }}
          />
          <Box
            display="flex"
            justifyContent="center"
            mt={3}
            flexDirection="column"
            gap={2}
          >
            {loading ? (
              <CircularProgress color="primary" />
            ) : (
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: "12px",
                  padding: "10px",
                  fontWeight: "bold",
                  background: "linear-gradient(90deg, #42a5f5, #1976d2)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                  },
                  transition: "background 0.3s ease",
                }}
              >
                Đăng Nhập
              </Button>
            )}
          </Box>
        </form>
      </Box>
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

export default Login;
