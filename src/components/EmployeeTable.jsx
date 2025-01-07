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
  Typography,
  Box,
  Paper,
} from "@mui/material";
import {
  getAllEmployeeInfor,
  createSalary,
  getCurrentSalary,
  lockUser,
  unlockUser,
  getAllEmployeeInforAll,
} from "../api/api";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [salary, setSalary] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const token = localStorage.getItem("token");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employees = await getAllEmployeeInforAll(token);
        console.log(employees);
        setEmployees(employees);
        const salaryData = {};
        await Promise.all(
          employees.map(async (employee) => {
            try {
              const currentSalary = await getCurrentSalary(employee.id, token);
              console.log(currentSalary);
              salaryData[employee.id] = currentSalary.salary;
            } catch (error) {
              console.error(
                "Error fetching salary for user:",
                employee.id,
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
  }, [token]);

  const handleSetSalary = (employee) => {
    setSelectedEmployee(employee);
    setSalary("");
    setOpenDialog(true);
  };

  const handleSaveSalary = () => {
    if (!selectedEmployee || !salary) return;

    const action = async () => {
      const salaryData = {
        employeeId: selectedEmployee.id,
        salary: parseFloat(salary),
        dateContract: new Date().toISOString().split("T")[0],
      };
      await createSalary(salaryData, token);
      setOpenDialog(false);
      setSalaries((prevSalaries) => ({
        ...prevSalaries,
        [selectedEmployee.id]: salary,
      }));
    };

    handleConfirm(
      `Xác nhận lưu lương ${salary} VNĐ cho nhân viên ${selectedEmployee.fullName}?`,
      action
    );
  };

  const handleToggleLock = async (employee) => {
    const action = async () => {
      if (employee.locked) {
        const res = await unlockUser(employee.userId, token);
        if (res) window.location.href = "/employee-table";
      } else {
        const res = await lockUser(employee.userId, token);
        if (res) window.location.href = "/employee-table";
      }
    };

    handleConfirm(
      employee.locked
        ? "Bạn có chắc chắn muốn mở khóa tài khoản này?"
        : "Bạn có chắc chắn muốn khóa tài khoản này?",
      action
    );
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPosition =
      filterPosition === "" || employee.position.toString() === filterPosition;
    return matchesSearch && matchesPosition;
  });

  const handleConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };
  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom align="center">
        Bảng Nhân Viên
      </Typography>

      {/* Tìm kiếm và lọc */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          label="Tìm theo tên"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "300px" }}
        />
        <TextField
          label="Lọc theo chức vụ"
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          select
          SelectProps={{
            native: true,
          }}
          InputLabelProps={{
            shrink: true, // Đảm bảo label không đè lên nội dung
          }}
          variant="outlined"
          sx={{ width: "200px" }}
        >
          <option value="">Tất cả</option>
          <option value="0">Nhân viên</option>
          <option value="1">Trưởng phòng</option>
          <option value="2">Quản lý</option>
        </TextField>
      </Box>

      <Paper sx={{ padding: 2, boxShadow: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Tên</strong>
                </TableCell>
                <TableCell>
                  <strong>Chức vụ</strong>
                </TableCell>
                <TableCell>
                  <strong>Lương</strong>
                </TableCell>
                <TableCell>
                  <strong>Trạng thái</strong>
                </TableCell>
                <TableCell>
                  <strong>Hành động</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}
                >
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
                    {salaries[employee.id]
                      ? `${salaries[employee.id]} VNĐ`
                      : "Chưa có"}
                  </TableCell>
                  <TableCell>
                    {employee.locked ? "Đã khóa" : "Hoạt động"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={employee.locked ? "secondary" : "error"}
                      onClick={() => handleToggleLock(employee)}
                      sx={{ marginRight: "10px" }}
                    >
                      {employee.locked ? "Mở khóa" : "Khóa"}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSetSalary(employee)}
                      sx={{ width: "150px" }}
                    >
                      Cài đặt lương
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cài đặt lương</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Nhân viên: <strong>{selectedEmployee?.fullName}</strong>
          </Typography>
          <TextField
            label="Lương"
            type="number"
            fullWidth
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            sx={{ marginTop: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Hủy
          </Button>
          <Button
            onClick={handleSaveSalary}
            color="primary"
            variant="contained"
            sx={{ minWidth: "100px" }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>{confirmMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">
            Hủy
          </Button>
          <Button
            onClick={() => {
              confirmAction();
              setConfirmOpen(false);
            }}
            color="primary"
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeTable;
