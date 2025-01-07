import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  requestLeave,
  getRequestLeaveById,
  updateRequestLeave,
  deleteRequestLeave,
} from "../api/api";
import "../css/CustomCalendar.css"; // CSS tùy chỉnh cho Calendar
import dayjs from "dayjs";
import { CalendarMonth } from "@mui/icons-material";
import { useSnackbar } from "../components/SnackbarContext";

const RequestLeave = () => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveHours, setLeaveHours] = useState(0);
  const token = localStorage.getItem("token");
  const employeeId = localStorage.getItem("employeeId");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // "success" or "error"
  const { showSnackbar } = useSnackbar(); // Sử dụng Snackbar Context
  const [requestLeaveData, setRequestLeaveData] = useState([]);
  const [currentRequest, setCurrentRequest] = useState(null); // Request Leave hiện tại

  const isDateSelectable = (date) => {
    const today = new Date();
    const dayOfWeek = date.getDay(); // Lấy ngày trong tuần (0 = Chủ nhật, 6 = Thứ 7)
    return (
      date.getTime() >= today.getTime() && dayOfWeek !== 0 && dayOfWeek !== 6
    );
  };

  const handleDateChange = (value) => {
    if (isDateSelectable(value)) {
      const formattedDate = dayjs(value).format("YYYY-MM-DD");

      // Tìm request leave tương ứng với ngày được chọn
      const existingRequest = requestLeaveData.find((request) => {
        const rawDate = request.startTime;
        const [datePart] = rawDate.split(" "); // Lấy phần "16/12/2024" trước dấu cách
        const [day, month, year] = datePart.split("/"); // Tách thành ngày, tháng, năm
        const requestDate = `${year}-${month}-${day}`; // Chuyển sang dạng "YYYY-MM-DD"
        return requestDate === formattedDate;
      });

      if (existingRequest) {
        // Đã có request leave -> Cập nhật
        setCurrentRequest(existingRequest);
        const [datePart, hour] = existingRequest.startTime.split(" ");
        const [hours, minutes] = hour.split(":");
        // Kết hợp lại thành định dạng HH:mm
        const formattedTime = `${hours}:${minutes}`;
        setStartTime(formattedTime);
        const [datePartEnd, hourEnd] = existingRequest.endTime.split(" ");
        const [hoursEnd, minutesEnd] = hourEnd.split(":");
        // Kết hợp lại thành định dạng HH:mm
        const formattedTimeEnd = `${hoursEnd}:${minutesEnd}`;
        setEndTime(formattedTimeEnd);
        setReason(existingRequest.reason);
      } else {
        // Chưa có request leave -> Tạo mới
        setCurrentRequest(null);
        setStartTime("08:00");
        setEndTime("17:00");
        setReason("");
      }
      setDate(value);
      setIsModalOpen(true);
    }
  };

  const calculateLeaveHours = () => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end - start) / (1000 * 60 * 60);
    setLeaveHours(hours > 0 ? hours : 0);
  };

  const handleSubmit = async () => {
    const startDateTime = dayjs(date)
      .set("hour", parseInt(startTime.split(":")[0]))
      .set("minute", parseInt(startTime.split(":")[1]));
    const endDateTime = dayjs(date)
      .set("hour", parseInt(endTime.split(":")[0]))
      .set("minute", parseInt(endTime.split(":")[1]));

    const requestLeaveData = {
      id: currentRequest ? currentRequest.id : null,
      startTime: startDateTime.format("DD/MM/YYYY HH:mm:ss"),
      endTime: endDateTime.format("DD/MM/YYYY HH:mm:ss"),
      reason: reason,
      employee_id: localStorage.getItem("employeeId"),
    };

    let res;
    if (currentRequest) {
      // Gọi API cập nhật
      res = await updateRequestLeave(requestLeaveData, token);
    } else {
      // Gọi API tạo mới
      res = await requestLeave(requestLeaveData, token);
    }

    if (res && res.status === 200) {
      showSnackbar(
        currentRequest ? "Cập nhật thành công" : "Xin nghỉ thành công",
        "success"
      );
      setIsModalOpen(false);
      setCurrentRequest(null);
    } else {
      showSnackbar("Có lỗi xảy ra", "error");
    }
  };

  useEffect(() => {
    calculateLeaveHours();
  }, [startTime, endTime]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  useEffect(() => {
    // Kiểm tra nếu có thông báo trong localStorage
    const storedMessage = localStorage.getItem("snackbarMessage");
    const storedSeverity = localStorage.getItem("snackbarSeverity");

    if (storedMessage) {
      setSnackbarMessage(storedMessage);
      setSnackbarSeverity(storedSeverity || "error");
      setSnackbarOpen(true);

      // Xóa thông báo sau khi đã hiển thị
      localStorage.removeItem("snackbarMessage");
      localStorage.removeItem("snackbarSeverity");
    }
  }, []);
  useEffect(() => {
    const fectchData = async () => {
      const res = await getRequestLeaveById(employeeId, token);
      setRequestLeaveData(res.data);
      console.log(res.data);
    };
    fectchData();
  }, [employeeId, token, isModalOpen]);
  const isDateHasRequest = (dateToCheck) => {
    for (const request of requestLeaveData) {
      const rawDate = request.startTime;
      const [datePart] = rawDate.split(" "); // Lấy phần "16/12/2024" trước dấu cách
      const [day, month, year] = datePart.split("/"); // Tách thành ngày, tháng, năm
      const requestDate = `${year}-${month}-${day}`; // Chuyển sang dạng "YYYY-MM-DD"
      const calendarDate = dayjs(dateToCheck).format("YYYY-MM-DD");
      if (requestDate === calendarDate) {
        return true; // Trả về true nếu tìm thấy ngày trùng khớp
      }
    }
    return false; // Trả về false nếu không có ngày nào khớp
  };
  const handleDelete = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa yêu cầu này?"
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteRequestLeave(id, token);
      if (res && res.status === 200) {
        showSnackbar("Xóa yêu cầu thành công", "success");
        setIsModalOpen(false);
        setCurrentRequest(null);
      } else {
        showSnackbar("Có lỗi xảy ra khi xóa", "error");
      }
    } catch (error) {
      console.error("Error deleting request leave:", error);
      showSnackbar("Có lỗi xảy ra khi xóa", "error");
    }
  };
  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    if (newStartTime > endTime) {
      showSnackbar("Giờ bắt đầu không được lớn hơn giờ kết thúc", "error");
      return;
    }
    setStartTime(newStartTime);
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    if (newEndTime < startTime) {
      showSnackbar("Giờ kết thúc không được nhỏ hơn giờ bắt đầu", "error");
      return;
    }
    setEndTime(newEndTime);
  };
  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: 800,
        margin: "auto",
        background: "linear-gradient(135deg, #f3f4f6, #ffffff)",
        borderRadius: "16px",
        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            sx={{
              marginBottom: 2,
              fontWeight: "bold",
              textAlign: "center",
              color: "#1976d2",
            }}
          >
            Đăng ký nghỉ phép
          </Typography>

          <Tooltip title="Chọn ngày nghỉ" arrow>
            <Box
              sx={{
                marginBottom: 4,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CalendarMonth sx={{ marginRight: 2, color: "#1976d2" }} />
              <Calendar
                value={date}
                onClickDay={handleDateChange}
                tileClassName={({ date, view }) => {
                  if (view === "month") {
                    const formattedDate = dayjs(date).format("YYYY-MM-DD");
                    const request = requestLeaveData.find((req) => {
                      const rawDate = req.startTime;
                      const [datePart] = rawDate.split(" ");
                      const [day, month, year] = datePart.split("/");
                      const requestDate = `${year}-${month}-${day}`;
                      return requestDate === formattedDate;
                    });

                    // Trả về class tương ứng với giá trị approve
                    if (request) {
                      switch (request.approve) {
                        case 0:
                          return "approve-pending"; // Màu cho trạng thái chờ duyệt
                        case 1:
                          return "approve-approved"; // Màu cho trạng thái đã duyệt
                        case 2:
                          return "approve-rejected"; // Màu cho trạng thái từ chối
                        case 3:
                          return "approve-canceled"; // Màu cho trạng thái hủy
                        default:
                          return null;
                      }
                    }
                  }
                  return null; // Không có class nếu không có request
                }}
                className="custom-calendar"
              />
            </Box>
          </Tooltip>

          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 500,
                bgcolor: "white",
                boxShadow: 24,
                borderRadius: 3,
                p: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  marginBottom: 2,
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#1976d2",
                }}
              >
                {currentRequest
                  ? "Cập nhật yêu cầu nghỉ phép"
                  : "Thông tin nghỉ phép"}
              </Typography>

              {/* Input Giờ bắt đầu */}
              <TextField
                label="Giờ bắt đầu"
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
                inputProps={{
                  step: 300,
                  min: "08:00",
                  max: "17:00",
                }}
                fullWidth
                margin="normal"
                sx={{ "& label.Mui-focused": { color: "#1976d2" } }}
              />

              {/* Input Giờ kết thúc */}
              <TextField
                label="Giờ kết thúc"
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
                inputProps={{
                  step: 300,
                  min: "08:00",
                  max: "17:00",
                }}
                fullWidth
                margin="normal"
                sx={{ "& label.Mui-focused": { color: "#1976d2" } }}
              />

              {/* Input Lý do */}
              <TextField
                label="Lý do nghỉ phép"
                placeholder="Nhập lý do của bạn..."
                value={reason} // Hiển thị giá trị từ state
                onChange={(e) => setReason(e.target.value)} // Cập nhật state
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />

              <Typography
                variant="body1"
                sx={{
                  marginTop: 2,
                  marginBottom: 3,
                  color: "#555",
                  textAlign: "center",
                }}
              >
                Số giờ nghỉ: <b>{leaveHours}</b> giờ
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={currentRequest && currentRequest.approve !== 0}
                sx={{
                  padding: "12px 20px",
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #2196F3, #21CBF3)",
                  ":hover": {
                    background: "linear-gradient(45deg, #21CBF3, #2196F3)",
                  },
                }}
              >
                {currentRequest ? "Cập nhật yêu cầu" : "Gửi yêu cầu"}
              </Button>
              {currentRequest && currentRequest.approve === 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => handleDelete(currentRequest.id)}
                  sx={{
                    marginTop: 2,
                    padding: "12px 20px",
                    fontWeight: "bold",
                  }}
                >
                  Xóa yêu cầu
                </Button>
              )}
            </Box>
          </Modal>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            borderRadius: "8px",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RequestLeave;
