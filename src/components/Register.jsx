import { useState } from "react";
import { registerUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography } from "@mui/material";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ userName, password, role });
      navigate("/login");
    } catch (err) {
      setError(`Đăng ký không thành công. Vui lòng thử lại. ${err.message}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Đăng Ký</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleRegister}>
        <TextField
          label="Tên đăng nhập"
          variant="outlined"
          fullWidth
          margin="normal"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <TextField
          label="Mật khẩu"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Vai trò"
          select
          SelectProps={{
            native: true,
          }}
          variant="outlined"
          fullWidth
          margin="normal"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="USER">Người dùng</option>
          <option value="ADMIN">Quản trị viên</option>
        </TextField>
        <Button type="submit" variant="contained" color="primary">
          Đăng Ký
        </Button>
      </form>
    </Container>
  );
};

export default Register;
