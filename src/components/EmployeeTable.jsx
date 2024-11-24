import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  getAllEmployeeInfor,
  createSalary,
  getCurrentSalary,
} from "../api/api";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [salary, setSalary] = useState("");
  const token = localStorage.getItem("token");

  // Fetch employees from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const employees = await getAllEmployeeInfor(token);
        setEmployees(employees);
        const salaryData = {};
        await Promise.all(
          employees.map(async (employee) => {
            try {
              const currentSalary = await getCurrentSalary(
                employee.userId,
                token
              );
              salaryData[employee.userId] = currentSalary.salary; // Gắn lương
            } catch (error) {
              console.error(
                "Error fetching salary for user:",
                employee.userId,
                error
              );
            }
          })
        );
        setSalaries(salaryData);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchData();
  }, []);

  // Open dialog
  const handleSetSalary = (employee) => {
    setSelectedEmployee(employee);
    setSalary(""); // Reset salary
    setOpenDialog(true);
  };

  // Save salary
  const handleSaveSalary = () => {
    if (!selectedEmployee) return;
    const salaryData = {
      userId: selectedEmployee.userId,
      salary: parseFloat(salary),
      dateContract: new Date().toISOString().split("T")[0], // Ngày hiện tại
    };
    createSalary(salaryData, token);
    setOpenDialog(false);
    window.location.reload(); // Refresh dữ liệu
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Bảng nhân viên
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Current Salary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.fullName}</TableCell>
                <TableCell>
                  {employee.position === 0
                    ? "Nhân viên"
                    : employee.position === 1
                    ? "Trưởng phòng"
                    : "Quản lý"}
                </TableCell>
                <TableCell>
                  {salaries[employee.userId]
                    ? `${salaries[employee.userId]} VNĐ`
                    : "Chưa có"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSetSalary(employee)}
                  >
                    Set Salary
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for setting salary */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Set Salary</DialogTitle>
        <DialogContent>
          <p>Employee: {selectedEmployee?.fullName}</p>
          <TextField
            label="Salary"
            type="number"
            fullWidth
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveSalary}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmployeeTable;
