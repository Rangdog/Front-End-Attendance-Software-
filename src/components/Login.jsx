import { useState } from "react";
import { loginUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setError("");
    try {
      const response = await loginUser({ username, password });
      localStorage.setItem("token", response.jwt);
      const tokenData = getTokenData(response.jwt);
      localStorage.setItem("role", tokenData.role);
      localStorage.setItem("userId", tokenData.userId);
      navigate("/attendance");
    } catch (err) {
      setError("Thông tin đăng nhập không chính xác. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceRecognition = async (faceImage) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/face-recognition",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ face_image: faceImage }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userId", data.user_id);
        navigate("/attendance");
      } else {
        setError("Nhận diện khuôn mặt không thành công.");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi nhận diện khuôn mặt.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = () => {
    const faceImage = ""; // Lấy dữ liệu ảnh từ camera
    handleFaceRecognition(faceImage);
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: "50px" }}>
      <Box
        sx={{
          boxShadow: 3,
          padding: 3,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Đăng Nhập
        </Typography>
        {error && (
          <Typography color="error" variant="body2" align="center" gutterBottom>
            {error}
          </Typography>
        )}
        <form onSubmit={handleLogin}>
          <TextField
            label="Tên đăng nhập"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!error && !username}
            helperText={error && !username ? "Tên đăng nhập là bắt buộc." : ""}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error && !password}
            helperText={error && !password ? "Mật khẩu là bắt buộc." : ""}
          />
          <Box display="flex" justifyContent="center" mt={2}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ width: "100%" }}
                >
                  Đăng Nhập
                </Button>
                <Button
                  onClick={handleFaceLogin}
                  variant="contained"
                  color="secondary"
                  sx={{ marginLeft: 2, width: "100%" }}
                >
                  Đăng Nhập Bằng Khuôn Mặt
                </Button>
              </>
            )}
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
