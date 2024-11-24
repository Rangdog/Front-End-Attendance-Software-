import { Modal, Box, Typography, Button } from "@mui/material";

const AttendanceDetailsModal = ({ open, onClose, records, selectedDate }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          Chi Tiết Chấm Công Ngày {selectedDate.toLocaleDateString()}
        </Typography>
        {records.length > 0 ? (
          records.map((record) => (
            <Box key={record.id} sx={{ mt: 2 }}>
              <Typography>Ngày: {record.date}</Typography>
              <Typography>check In: {record.checkIn}</Typography>
              <Typography>check Out: {record.checkOut}</Typography>
              <Typography>Hành Động: {record.action}</Typography>
              <Typography>Lý Do: {record.reason}</Typography>
              <Typography>Thời Gian Nghỉ: {record.timeLeave}</Typography>
            </Box>
          ))
        ) : (
          <Typography>Không có dữ liệu cho ngày này.</Typography>
        )}
        <Button variant="contained" onClick={onClose} sx={{ mt: 3 }}>
          Đóng
        </Button>
      </Box>
    </Modal>
  );
};

export default AttendanceDetailsModal;
