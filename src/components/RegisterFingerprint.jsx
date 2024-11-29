import { useState } from "react";
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  Input,
} from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { registerFingerprints } from "../api/api";

const RegisterFingerprint = () => {
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [message, setMessage] = useState(""); // Thông báo phản hồi
  const [file, setFile] = useState(null); // Lưu trữ file đã chọn
  const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage
  const token = localStorage.getItem("token");

  // Hàm xử lý khi nhấn nút
  const handleRegister = async () => {
    setIsLoading(true); // Hiển thị loading
    setMessage(""); // Xóa thông báo cũ

    try {
      // Kiểm tra nếu chưa chọn file
      if (!file) {
        setMessage("Vui lòng chọn một file ảnh để tải lên.");
        setIsLoading(false);
        return;
      }

      // Gửi request đến API với file
      const formData = new FormData();
      formData.append("username", userId);
      formData.append("fingerprint", file); // Đính kèm file vào form data

      const response = await registerFingerprints(formData, token);
      // Hiển thị thông báo thành công
      setMessage(`Thành công: ${response.message || "Đã đăng ký vân tay!"}`);
    } catch (error) {
      // Hiển thị thông báo lỗi
      setMessage(
        `Lỗi: ${error.response?.message || "Không thể đăng ký vân tay."}`
      );
    } finally {
      setIsLoading(false); // Tắt loading
    }
  };

  // Hàm xử lý khi người dùng chọn file
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      {/* Nút chọn file ảnh */}
      <Input
        accept="image/*"
        id="upload-file"
        type="file"
        onChange={handleFileChange}
        sx={{
          display: "none",
        }}
      />
      <label htmlFor="upload-file">
        <Button
          variant="contained"
          color="secondary"
          component="span"
          sx={{
            fontSize: "1rem",
            padding: "10px 20px",
            borderRadius: "30px",
            textTransform: "none",
            marginBottom: 2,
          }}
        >
          Chọn ảnh vân tay
        </Button>
      </label>

      {/* Nút đăng ký vân tay */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleRegister}
        startIcon={<FingerprintIcon />}
        sx={{
          fontSize: "1.2rem",
          padding: "10px 20px",
          borderRadius: "30px",
          textTransform: "none",
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Đăng ký vân tay"
        )}
      </Button>

      {/* Thông báo phản hồi */}
      {message && (
        <Typography
          variant="body1"
          sx={{
            marginTop: 2,
            color: message.startsWith("Thành công") ? "green" : "red",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default RegisterFingerprint;
