import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TextField,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllEmployeeFace, deleteEmployeeFace } from "../api/api";

const ImageTable = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const token = localStorage.getItem("token");
  const employee_id = localStorage.getItem("employeeId");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const convertToImageUrl = (imageBytes) => {
    return `data:image/jpeg;base64,${imageBytes}`;
  };

  const handleDelete = async (id) => {
    const action = async () => {
      const res = await deleteEmployeeFace(id, token);
      if (res.status === 204) {
        console.log("thành công");
        setEmployees((prev) => prev.filter((employee) => employee.id !== id));
        setFilteredEmployees((prev) =>
          prev.filter((employee) => employee.id !== id)
        );
      }
    };
    handleConfirm("bạn muốn xóa hình ảnh khuôn mặt này?", action);
  };

  const handleSearch = () => {
    const filtered = employees.filter((employee) => {
      const matchesName = employee.employeeInfo.fullName
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesId = employee.employeeInfo.id
        .toLowerCase()
        .includes(searchId.toLowerCase());
      return matchesName && matchesId;
    });
    setFilteredEmployees(filtered);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getAllEmployeeFace(employee_id, token);
        setEmployees(response);
        setFilteredEmployees(response); // Initialize filteredEmployees
        console.log(response);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    handleSearch(); // Filter employees whenever search inputs change
  }, [searchName, searchId]);
  const handleConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };
  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h5"
        align="center"
        sx={{ marginBottom: 4, color: "#1976d2", fontWeight: "bold" }}
      >
        Hình ảnh đã đăng ký
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        {/* Search by Name */}
        <TextField
          label="Tìm kiếm theo tên"
          variant="outlined"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          sx={{ width: "300px" }}
        />
        {/* Search by ID */}
        <TextField
          label="Tìm kiếm theo ID"
          variant="outlined"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          sx={{ width: "300px" }}
        />
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f4f6f8" }}>
            <TableRow>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              >
                Ảnh
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Mã nhân viên
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Họ và tên nhân viên
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              >
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow
                key={employee.id}
                sx={{
                  "&:hover": { backgroundColor: "#f9fafb" },
                }}
              >
                <TableCell align="center">
                  <img
                    src={convertToImageUrl(employee.face)}
                    alt={employee.employeeInfo.fullName}
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </TableCell>
                <TableCell>{employee.employeeInfo.id}</TableCell>
                <TableCell>{employee.employeeInfo.fullName}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(employee.id)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      padding: "6px 16px",
                    }}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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

export default ImageTable;
