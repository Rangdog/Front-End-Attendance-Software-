import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { getFaceEmployeeByID } from "../api/api";

const ImageTableUser = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const token = localStorage.getItem("token");
  const employee_id = localStorage.getItem("employeeId");

  const convertToImageUrl = (imageBytes) => {
    return `data:image/jpeg;base64,${imageBytes}`;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getFaceEmployeeByID(employee_id, token);
        setEmployees(response);
        setFilteredEmployees(response); // Initialize filteredEmployees
        console.log(response);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEmployees();
  }, []);

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
      ></Box>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow
                key={employee.id}
                sx={{
                  "&:hover": { backgroundColor: "#f9fafb" },
                }}
              >
                <TableCell align="center">
                  <img
                    src={convertToImageUrl(employee.face)}
                    alt="hình ảnh khuôn mặt"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ImageTableUser;
