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
          console.log(formData);
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
      userId: userId, // Thêm userId vào formData trước khi gửi
    };
    try {
      if (employeeId === null) {
        await createEmployee(updatedFormData, token);
      } else {
        const updatedFormDataUpdate = {
          ...updatedFormData,
          id: employeeId, // Thêm userId vào formData trước khi gửi
        };
        await updateEmployee(updatedFormDataUpdate, token);
      }
      await setSuccessMessage("Employee information updated successfully!");
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 500, mx: "auto", p: 3, boxShadow: 3, borderRadius: 2 }}
    >
      <Typography variant="h5" mb={3}>
        Update Employee Information
      </Typography>
      <TextField
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        required
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
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="position-label">Position</InputLabel>
        <Select
          labelId="position-label"
          name="position"
          value={formData.position}
          onChange={handleInputChange}
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
        sx={{ mt: 2 }}
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>
      {successMessage && (
        <Typography color="success.main" mt={2}>
          {successMessage}
        </Typography>
      )}
    </Box>
  );
};

export default EmployeeInfoForm;
