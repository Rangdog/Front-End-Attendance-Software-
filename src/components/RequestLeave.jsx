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
  IconButton,
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { requestLeave } from "../api/api";
import "../css/CustomCalendar.css"; // CSS tùy chỉnh cho Calendar
import dayjs from "dayjs";
import { CheckCircle, Close, CalendarMonth } from "@mui/icons-material";

const RequestLeave = () => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveHours, setLeaveHours] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Hiển thị thông báo gửi yêu cầu
  const token = localStorage.getItem("token");

  const isDateSelectable = (date) => {
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    return date.getTime() >= oneDayAgo.getTime();
  };

  const handleDateChange = (value) => {
    if (isDateSelectable(value)) {
      setDate(value);
      setIsModalOpen(true);
    }
  };

  const calculateLeaveHours = () => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end - start) / (1000 * 60 * 60);
    setLeaveHours(hours > 0 ? hours : 0); // Đảm bảo số giờ không âm
  };

  const handleSubmit = async () => {
    const startDateTime = dayjs(date)
      .set("hour", parseInt(startTime.split(":")[0]))
      .set("minute", parseInt(startTime.split(":")[1]));
    const endDateTime = dayjs(date)
      .set("hour", parseInt(endTime.split(":")[0]))
      .set("minute", parseInt(endTime.split(":")[1]));

    const requestLeaveData = {
      startTime: startDateTime.format(),
      endTime: endDateTime.format(),
      reason: reason,
      userId: localStorage.getItem("userId"),
    };

    console.log(requestLeaveData);
    await requestLeave(requestLeaveData, token);
    setSnackbarOpen(true); // Hiển thị thông báo
    setIsModalOpen(false);
  };

  useEffect(() => {
    calculateLeaveHours();
  }, [startTime, endTime]);

  return (
    <Box sx={{ padding: 4, maxWidth: 800, margin: "auto" }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h4" sx={{ marginBottom: 2, fontWeight: "bold" }}>
            Yêu cầu nghỉ phép
          </Typography>

          <Tooltip title="Chọn ngày nghỉ" arrow>
            <Box
              sx={{ marginBottom: 4, display: "flex", alignItems: "center" }}
            >
              <CalendarMonth
                fontSize="large"
                sx={{ marginRight: 1, color: "#1976d2" }}
              />
              <Calendar
                onChange={handleDateChange}
                value={date}
                tileDisabled={({ date, view }) =>
                  view === "month" && !isDateSelectable(date)
                }
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
                borderRadius: 2,
                p: 4,
              }}
            >
              <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Thông tin nghỉ phép
              </Typography>

              <TextField
                label="Giờ bắt đầu"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  calculateLeaveHours();
                }}
                inputProps={{ step: 300 }}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Giờ kết thúc"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  calculateLeaveHours();
                }}
                inputProps={{ step: 300 }}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Lý do nghỉ phép"
                placeholder="Nhập lý do của bạn..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />

              <Typography
                variant="body1"
                sx={{ marginTop: 2, marginBottom: 3, color: "#555" }}
              >
                Số giờ nghỉ: <b>{leaveHours}</b> giờ
              </Typography>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  backgroundColor: "#1976d2",
                  ":hover": { backgroundColor: "#1565c0" },
                }}
                onClick={handleSubmit}
              >
                Gửi yêu cầu
              </Button>
            </Box>
          </Modal>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Gửi yêu cầu nghỉ phép thành công!"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default RequestLeave;
