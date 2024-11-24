import { useEffect, useState } from "react";
import { Modal, Button, TextField, Typography, Box } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import { requestLeave } from "../api/api";

const RequestLeave = () => {
  const [date, setDate] = useState(new Date()); // Lưu trữ ngày chọn từ calendar
  const [startTime, setStartTime] = useState("08:00"); // Giờ bắt đầu
  const [endTime, setEndTime] = useState("17:00"); // Giờ kết thúc
  const [reason, setReason] = useState(""); // Lý do nghỉ phép
  const [isModalOpen, setIsModalOpen] = useState(false); // Điều khiển modal
  const [leaveHours, setLeaveHours] = useState(0); // Số giờ nghỉ phép
  const token = localStorage.getItem("token");

  // Kiểm tra nếu ngày có thể chọn (hiện tại hoặc tương lai)
  const isDateSelectable = (date) => {
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000); // Trừ đi 1 ngày (24 giờ)
    const selectedDate = new Date(date);
    return selectedDate.getTime() >= oneDayAgo.getTime();
  };

  // Handle thay đổi ngày từ Calendar
  const handleDateChange = (value) => {
    setDate(value);
    setIsModalOpen(true); // Mở modal sau khi chọn ngày
  };

  // Tính số giờ nghỉ phép
  const calculateLeaveHours = () => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end - start) / (1000 * 60 * 60); // Tính số giờ chênh lệch
    setLeaveHours(hours);
  };

  // Handle submit form
  const handleSubmit = () => {
    const startDateTime = dayjs(date)
      .set("hour", parseInt(startTime.split(":")[0]))
      .set("minute", parseInt(startTime.split(":")[1]));
    const endDateTime = dayjs(date)
      .set("hour", parseInt(endTime.split(":")[0]))
      .set("minute", parseInt(endTime.split(":")[1]));

    // Cập nhật giá trị để gửi lên server
    const requestLeaveData = {
      startTime: startDateTime.format(),
      endTime: endDateTime.format(),
      reason: reason,
      userId: localStorage.getItem("userId"),
    };
    console.log(requestLeaveData);
    const data = requestLeave(requestLeaveData, token);
    console.log(data);
    setIsModalOpen(false);
  };

  useEffect(() => {
    calculateLeaveHours();
  }, []);

  return (
    <div>
      <Typography variant="h4">Yêu cầu nghỉ phép</Typography>

      {/* Calendar */}
      <Calendar
        onChange={handleDateChange}
        value={date}
        tileDisabled={({ date, view }) =>
          view === "month" && !isDateSelectable(date)
        }
      />

      {/* Modal chọn thời gian */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            p: 3,
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6">Chọn thời gian nghỉ</Typography>

          {/* Chọn giờ bắt đầu */}
          <TextField
            label="Giờ bắt đầu"
            type="time"
            value={startTime}
            onChange={(e) => {
              const newTime = e.target.value; // Lấy giá trị mới từ input
              setStartTime(newTime); // Cập nhật state
              calculateLeaveHours(); // Gọi hàm calculateLeaveHours
            }}
            inputProps={{ step: 300 }} // step 5 phút
            fullWidth
            margin="normal"
            disabled={
              dayjs(date).isSame(dayjs(), "day") &&
              dayjs(date).hour() > dayjs().hour()
            } // Disable nếu là ngày hiện tại và giờ đã qua
          />

          {/* Chọn giờ kết thúc */}
          <TextField
            label="Giờ kết thúc"
            type="time"
            value={endTime}
            onChange={(e) => {
              const newTime = e.target.value; // Lấy giá trị mới từ input
              setEndTime(newTime); // Cập nhật state
              calculateLeaveHours(); // Gọi hàm calculateLeaveHours
            }}
            inputProps={{ step: 300 }} // step 5 phút
            fullWidth
            margin="normal"
            disabled={
              dayjs(date).isSame(dayjs(), "day") &&
              dayjs(date).hour() > dayjs().hour()
            } // Disable nếu là ngày hiện tại và giờ đã qua
          />

          {/* Lý do nghỉ */}
          <TextField
            label="Lý do nghỉ"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />

          <Typography variant="body1">Số giờ nghỉ: {leaveHours} giờ</Typography>

          {/* Button Submit */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
          >
            Gửi yêu cầu nghỉ phép
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default RequestLeave;
