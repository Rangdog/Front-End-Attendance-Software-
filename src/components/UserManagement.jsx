import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUser } from "../api/api"; // Thêm các hàm API
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Container,
  Typography,
  TextField,
} from "@mui/material";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState({
    id: null,
    username: "",
    role: "USER",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getAllUsers();
      setUsers(response.data);
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    await deleteUser(id);
    setUsers(users.filter((user) => user.id !== id)); // Cập nhật danh sách người dùng
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setIsEditing(true);
  };

  const handleUpdateUser = async () => {
    await updateUser(editUser.id, editUser);
    setUsers(users.map((user) => (user.id === editUser.id ? editUser : user))); // Cập nhật danh sách người dùng
    setIsEditing(false);
    setEditUser({ id: null, username: "", role: "USER" }); // Reset form
  };

  return (
    <Container>
      <Typography variant="h4">Quản Lý Người Dùng</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tên Đăng Nhập</TableCell>
            <TableCell>Vai Trò</TableCell>
            <TableCell>Hành Động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button onClick={() => handleEditUser(user)} color="primary">
                  Sửa
                </Button>
                <Button
                  onClick={() => handleDeleteUser(user.id)}
                  color="secondary"
                >
                  Xóa
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isEditing && (
        <div>
          <Typography variant="h6">Chỉnh Sửa Người Dùng</Typography>
          <TextField
            label="Tên Đăng Nhập"
            value={editUser.username}
            onChange={(e) =>
              setEditUser({ ...editUser, username: e.target.value })
            }
          />
          <TextField
            label="Vai Trò"
            select
            value={editUser.role}
            onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            <option value="USER">Người dùng</option>
            <option value="ADMIN">Quản trị viên</option>
          </TextField>
          <Button onClick={handleUpdateUser} color="primary">
            Cập Nhật
          </Button>
        </div>
      )}
    </Container>
  );
};

export default UserManagement;
