import { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  Input,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { registerFingerprints, getAllEmployeeInfor } from "../api/api";

const RegisterFingerprint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // Lưu URL tạm thời của ảnh
  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [userOptions, setUserOptions] = useState([]);
  const [username, setUsername] = useState("");

  const handleRegister = async () => {
    setIsLoading(true);
    setMessage("");
    if (username === "") {
      setMessage("Vui lòng chọn nhân viên cần đăng ký dấu vân tay");
      setIsLoading(false);
      return;
    }
    try {
      if (!file) {
        setMessage("Vui lòng chọn một file ảnh vân tay để tải lên.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("fingerprint", file);

      const response = await registerFingerprints(formData, token);
      if (response.status === 200) {
        setMessage(`Thành công: ${response.message || "Đã đăng ký vân tay!"}`);
      } else {
        setMessage(`Có lỗi xảy ra: ${response.message}`);
      }
    } catch (error) {
      setMessage(
        `Lỗi: ${error.response?.message || "Không thể đăng ký vân tay."}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // Lưu Data URL của ảnh
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewImage(null);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllEmployeeInfor(token);
        setUserOptions(response);
        console.log(response);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
        padding: "20px",
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        }}
      >
        {role === "[ADMIN]" && (
          <Grid item xs={12} sx={{ marginBottom: "16px", padding: "16px" }}>
            <FormControl variant="outlined" fullWidth required>
              <InputLabel id="username-select-label">Tên người dùng</InputLabel>
              <Select
                labelId="username-select-label"
                value={username}
                onChange={(e) => {
                  const selectedUser = userOptions.find(
                    (user) => user.id === e.target.value
                  );
                  setUsername(selectedUser.id);
                }}
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              >
                {userOptions.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        <CardContent>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 3,
              color: "#0288d1",
            }}
          >
            Đăng ký vân tay
          </Typography>

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
                marginBottom: 3,
                width: "100%",
                background: "linear-gradient(90deg, #ff6f61, #ff8a65)",
                "&:hover": {
                  background: "linear-gradient(90deg, #ff8a65, #ff6f61)",
                },
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              Chọn ảnh vân tay
            </Button>
          </label>

          {/* Placeholder for Image Preview */}
          {previewImage ? (
            <Box
              sx={{
                width: "100%",
                height: "250px",
                marginBottom: 3,
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <img
                src={previewImage}
                alt="Fingerprint Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "250px",
                marginBottom: 3,
                borderRadius: "16px",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9e9e9e",
                fontStyle: "italic",
              }}
            >
              Chưa có ảnh được chọn
            </Box>
          )}

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
              width: "100%",
              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
              "&:hover": {
                background: "linear-gradient(90deg, #42a5f5, #1976d2)",
              },
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Đăng ký vân tay"
            )}
          </Button>

          {message && (
            <Typography
              variant="body1"
              sx={{
                marginTop: 3,
                color: message.startsWith("Thành công") ? "green" : "red",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterFingerprint;
