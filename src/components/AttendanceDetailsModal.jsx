import { useEffect, useState } from "react";
import { Modal, Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getRequestLeaveByDate } from "../api/api";
const convertToImageUrl = (base64Data) => {
  if (!base64Data) return null;
  return `data:image/jpeg;base64,${base64Data}`; // Sử dụng "image/png" nếu ảnh là PNG
};

const AttendanceDetailsModal = ({ open, onClose, records, selectedDate }) => {
  const [requsetLeave, setRequestLeave] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const employeeId = localStorage.getItem("employeeId");
  useEffect(() => {
    if (open) {
      fetchRecordsByDate(selectedDate);
    }
  }, [open, selectedDate]);
  const fetchRecordsByDate = async (date) => {
    setLoading(true);
    try {
      // Format selectedDate to YYYY-MM-DD for API
      date.setDate(date.getDate() + 1);
      const formattedDate = date.toISOString().split("T")[0];
      const response = await getRequestLeaveByDate(
        formattedDate,
        employeeId,
        token
      );
      console.log(response.data);
      if (response && response.data) {
        console.log(response.data);
        setRequestLeave(response.data); // Update records with API data
      } else {
        setRequestLeave([]); // Handle no data case
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      setRequestLeave([]);
    } finally {
      setLoading(false);
    }
  };
  const formatTime = (timeArray) => {
    if (!timeArray || timeArray.length < 5) return "N/A";
    const [year, month, day, hour, minute] = timeArray;
    const date = new Date(year, month - 1, day, hour, minute); // month - 1 vì Date trong JS bắt đầu từ 0
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "500px",
          maxHeight: "80vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: "12px",
          p: 4,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Nút Close */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: "12px",
            right: "12px",
            color: "gray",
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Tiêu Đề */}
        <Typography
          id="modal-title"
          variant="h6"
          component="h2"
          sx={{
            mb: 2,
            textAlign: "center",
            fontWeight: "bold",
            color: "text.primary",
          }}
        >
          Chi Tiết Chấm Công Ngày{" "}
          {new Date(
            selectedDate.getTime() - 1 * 24 * 60 * 60 * 1000
          ).toLocaleDateString()}
        </Typography>

        {/* Nội Dung Cuộn */}
        <Box
          sx={{
            overflowY: "auto",
            flex: 1,
            pr: 2,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#a8a8a8",
              },
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
            },
          }}
        >
          {records.length > 0 ? (
            records.map((record) => (
              <Box
                key={record.id}
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  mb: 2,
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography>Ngày: {record.date}</Typography>
                <Typography>Check In: {record.checkIn}</Typography>
                {record.faceIn && (
                  <Box sx={{ mt: 1 }}>
                    <Typography>Hình ảnh Check In:</Typography>
                    <img
                      src={convertToImageUrl(record.faceIn)}
                      alt="Check In"
                      style={{
                        width: "100%",
                        height: "auto",
                        marginTop: "8px",
                        borderRadius: "4px",
                        border: "1px solid #e0e0e0",
                      }}
                    />
                  </Box>
                )}
                <Typography>Check Out: {record.checkOut}</Typography>
                {record.faceOut && (
                  <Box sx={{ mt: 1 }}>
                    <Typography>Hình ảnh Check Out:</Typography>
                    <img
                      src={convertToImageUrl(record.faceOut)}
                      alt="Check Out"
                      style={{
                        width: "100%",
                        height: "auto",
                        marginTop: "8px",
                        borderRadius: "4px",
                        border: "1px solid #e0e0e0",
                      }}
                    />
                  </Box>
                )}
                {requsetLeave.length > 0 &&
                requsetLeave[0].approve != 3 &&
                requsetLeave[0].approve != 0 > 0 ? (
                  <>
                    <Typography>Lý Do: {requsetLeave[0].reason}</Typography>
                    <Typography>
                      {" "}
                      Thời Gian Nghỉ:{" "}
                      {`${requsetLeave[0].startTime} - ${requsetLeave[0].endTime}`}
                    </Typography>
                  </>
                ) : (
                  <></>
                )}
              </Box>
            ))
          ) : (
            <>
              {requsetLeave.length > 0 &&
              requsetLeave[0].approve != 3 &&
              requsetLeave[0].approve != 0 ? (
                <>
                  <Typography>Lý Do: {requsetLeave[0].reason}</Typography>
                  <Typography>
                    {" "}
                    Thời Gian Nghỉ:{" "}
                    {`${requsetLeave[0].startTime} - ${requsetLeave[0].endTime}`}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ textAlign: "center", mt: 4 }}>
                  Không có dữ liệu cho ngày này.
                </Typography>
              )}
            </>
          )}
        </Box>

        {/* Nút Đóng */}
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            mt: 3,
            alignSelf: "center",
            width: "fit-content",
            px: 4,
            py: 1,
            borderRadius: "8px",
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Đóng
        </Button>
      </Box>
    </Modal>
  );
};

export default AttendanceDetailsModal;
