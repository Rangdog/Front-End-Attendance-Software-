import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AttendanceCalendar from "./components/AttendanceCalendar";
import CheckInOut from "./components/CheckInOut";
import RequestLeave from "./components/RequestLeave"; // Import component xin nghỉ
import Payroll from "./components/Payroll"; // Import component bảng lương
import RegisterFaceRecognition from "./components/RegisterFaceRecognition"; // Import component
import FaceDetection from "./components/FaceDetection";
import { Container } from "@mui/material";
import RequestLeaveManagement from "./components/RequestLeaveManagement";
import EmployeeInfoForm from "./components/EmployeeInfoForm";
import SalaryExportComponent from "./components/SalaryExportComponent";
import AddressManager from "./components/AddressManager";
import EmployeeTable from "./components/EmployeeTable";
import PrivateRoute from "./components/PrivateRoute";
const App = () => {
  return (
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/attendance"
            element={<PrivateRoute element={<CheckInOut />} />}
          />
          <Route
            path="/history"
            element={<PrivateRoute element={<AttendanceCalendar />} />}
          />
          <Route
            path="/register-face-recognition"
            element={<PrivateRoute element={<RegisterFaceRecognition />} />}
          />
          <Route
            path="/request-leave"
            element={<PrivateRoute element={<RequestLeave />} />}
          />
          <Route
            path="/payroll"
            element={<PrivateRoute element={<Payroll />} />}
          />
          <Route
            path="/face-detection"
            element={<PrivateRoute element={<FaceDetection />} />}
          />
          <Route
            path="/request-manager"
            element={<PrivateRoute element={<RequestLeaveManagement />} />}
          />
          <Route
            path="/employee-infor"
            element={<PrivateRoute element={<EmployeeInfoForm />} />}
          />
          <Route
            path="/salary"
            element={<PrivateRoute element={<SalaryExportComponent />} />}
          />
          <Route
            path="/address-manager"
            element={<PrivateRoute element={<AddressManager />} />}
          />
          <Route
            path="/employee-table"
            element={<PrivateRoute element={<EmployeeTable />} />}
          />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
