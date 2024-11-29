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
} from "../api/api";

const EmployeeInfoForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    birthYear: "",
    position: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Fetch employee data on component mount
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const res = await checkExistEmployeeInfor(userId, token);
        if (res) {
          setEmployeeId(res.employeeId);
          const response = await getEmployeeInfor(res.employeeId, token);
          setFormData({
            fullName: response.fullName || "",
            birthYear: response.birthYear || "",
            position: response.position,
          });
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeInfo();
  }, [employeeId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle form submission
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
      setSuccessMessage("Employee information updated successfully!");
    } catch (error) {
      console.error("Error updating employee information:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toISOString().split("T")[0]; // Format to "yyyy-MM-dd"
    setFormData((prevState) => ({ ...prevState, birthYear: formattedDate }));
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
            Update Employee Information
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                sx: { borderRadius: "8px" },
              }}
            />
            <TextField
              label="Birth Year"
              name="birthYear"
              type="date"
              value={formData.birthYear}
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
              <InputLabel id="position-label">Position</InputLabel>
              <Select
                labelId="position-label"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                label="Position"
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
              {loading ? "Saving..." : "Save Changes"}
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
