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
  checkExistEmployeeInfor,
  getEmployeeInfor,
  createEmployee,
  updateEmployee,
  getAllEmployeeInfor,
} from "../api/api";

const EmployeeInfoForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    birthYear: "",
    position: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const employeeIdtmp = localStorage.getItem("employeeId");
  const [employeeId, setEmployeeId] = useState(employeeIdtmp);
  const [userOptions, setUserOptions] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const response = await getEmployeeInfor(employeeId, token);
        console.log(response);
        setFormData({
          fullName: response.fullName || "",
          birthYear: response.birthYear || "",
          position: response.position,
        });
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeInfo();
  }, [employeeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    const updatedFormData = {
      ...formData,
      userId: userId,
    };
    try {
      if (employeeId === null) {
        await createEmployee(updatedFormData, token);
      } else {
        const updatedFormDataUpdate = {
          ...updatedFormData,
          id: employeeId,
        };
        await updateEmployee(updatedFormDataUpdate, token);
      }
      setSuccessMessage("Cập nhập thông tin thành công");
    } catch (error) {
      console.error("Có lỗi", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toISOString().split("T")[0];
    setFormData((prevState) => ({ ...prevState, birthYear: formattedDate }));
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
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
      }}
    >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
          }}
        >
          {role === "[ADMIN]" && (
            <Grid item xs={12} sx={{ marginBottom: "16px" }}>
              <FormControl variant="outlined" fullWidth required>
                <InputLabel id="username-select-label">
                  Tên người dùng
                </InputLabel>
                <Select
                  labelId="username-select-label"
                  value={username}
                  onChange={(e) => {
                    const selectedUser = userOptions.find(
                      (user) => user.id === e.target.value
                    );
                    setUsername(selectedUser.id);
                    setEmployeeId(selectedUser.id);
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
          <Typography
            variant="h6"
            align="center"
            mb={3}
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Thông tin cá nhân
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
            <TextField
              label="Ngày sinh"
              name="birthYear"
              type="date"
              value={formData.birthYear}
              onChange={handleDateChange}
              fullWidth
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
            <FormControl fullWidth required>
              <InputLabel id="position-label">Vị trí</InputLabel>
              <Select
                labelId="position-label"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                label="Position"
                disabled={role !== "[ADMIN]"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              >
                <MenuItem value={0}>Nhân viên</MenuItem>
                <MenuItem value={1}>Trưởng phòng</MenuItem>
                <MenuItem value={2}>Quản lý</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                borderRadius: "12px",
                padding: "10px 0",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                "&:hover": {
                  background: "linear-gradient(90deg, #42a5f5, #1976d2)",
                },
              }}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
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

export default EmployeeInfoForm;
