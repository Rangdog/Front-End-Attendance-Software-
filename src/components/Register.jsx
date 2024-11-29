import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Paper,
} from "@mui/material";
import {
  registerUser,
  checkExistEmployeeInfor,
  getEmployeeInfor,
  createEmployee,
  updateEmployee,
} from "../api/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [userData, setUserData] = useState({
    userName: "",
    password: "",
    role: "USER",
  });
  const [employeeData, setEmployeeData] = useState({
    fullName: "",
    birthYear: "",
    position: "",
  });
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch employee information if user already exists
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await checkExistEmployeeInfor(userId, token);
        if (res) {
          setEmployeeId(res.employeeId);
          const response = await getEmployeeInfor(res.employeeId, token);
          setEmployeeData({
            fullName: response.fullName || "",
            birthYear: response.birthYear || "",
            position: response.position || "",
          });
        }
      } catch (error) {
        console.error("Error fetching employee information:", error);
      }
    };

    fetchEmployeeInfo();
  }, []);

  // Handle user registration
  const handleRegister = async (e) => {
    
    e.preventDefault();
    setLoading(true);
    try {
      // Register user
      const registeredUser = await registerUser(userData);
      localStorage.setItem("userId", registeredUser.userId);

      // Save employee information
      const employeePayload = {
        ...employeeData,
        userId: registeredUser.userId,
      };
      if (employeeId === null) {
        await createEmployee(employeePayload, token);
      } else {
        await updateEmployee({ ...employeePayload, id: employeeId }, token);
      }
      setSuccessMessage("User and employee information saved successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(`Đăng ký không thành công. Vui lòng thử lại. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toISOString().split("T")[0]; // Format to "yyyy-MM-dd"
    setEmployeeData((prev) => ({ ...prev, birthYear: formattedDate }));
  };

  return (
    <Grid
      container
      justifyContent="center"
      sx={{ minHeight: "100vh", backgroundColor: "#f7f7f7" }}
    >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h5" align="center" mb={2} color="primary.main">
            Đăng Ký Tài Khoản và Thông Tin Nhân Viên
          </Typography>
          {error && (
            <Typography color="error" mb={2} align="center">
              {error}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* User registration fields */}
            <TextField
              label="Tên đăng nhập"
              name="userName"
              value={userData.userName}
              onChange={handleUserInputChange}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                sx: { borderRadius: "8px" },
              }}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              name="password"
              value={userData.password}
              onChange={handleUserInputChange}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                sx: { borderRadius: "8px" },
              }}
            />
            <FormControl fullWidth margin="normal" required variant="outlined">
              <InputLabel id="role-label">Vai trò</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={userData.role}
                onChange={handleUserInputChange}
                label="Vai trò"
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              >
                <MenuItem value="USER">Người dùng</MenuItem>
                <MenuItem value="ADMIN">Quản trị viên</MenuItem>
              </Select>
            </FormControl>

            {/* Employee information fields */}
            <TextField
              label="Họ và tên"
              name="fullName"
              value={employeeData.fullName}
              onChange={handleEmployeeInputChange}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                sx: { borderRadius: "8px" },
              }}
            />
            <TextField
              label="Năm sinh"
              name="birthYear"
              type="date"
              value={employeeData.birthYear}
              onChange={handleDateChange}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                sx: { borderRadius: "8px" },
              }}
            />
            <FormControl fullWidth margin="normal" required variant="outlined">
              <InputLabel id="position-label">Vị trí</InputLabel>
              <Select
                labelId="position-label"
                name="position"
                value={employeeData.position}
                onChange={handleEmployeeInputChange}
                label="Vị trí"
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              >
                <MenuItem value={0}>Nhân viên</MenuItem>
                <MenuItem value={1}>Trưởng phòng</MenuItem>
                <MenuItem value={2}>Quản lý</MenuItem>
              </Select>
            </FormControl>

            {/* Submit button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                borderRadius: "8px",
                padding: "10px",
                fontWeight: "bold",
              }}
            >
              {loading ? "Đang xử lý..." : "Đăng Ký"}
            </Button>
            {successMessage && (
              <Typography
                color="success.main"
                mt={2}
                variant="body2"
                align="center"
              >
                {successMessage}
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Register;
