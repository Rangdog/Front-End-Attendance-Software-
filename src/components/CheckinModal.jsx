import React, { useState } from "react";
import { Box, Modal, Typography, Button, Divider } from "@mui/material";
const convertToImageUrl = (base64Data) => {
  if (!base64Data) return null;
  return `data:image/jpeg;base64,${base64Data}`; // Sử dụng "image/png" nếu ảnh là PNG
};
const CheckinModal = ({ open, handleClose, name, time, image, title }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="checkin-success-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          width: 300,
        }}
      >
        <Typography
          id="checkin-success-modal"
          variant="h6"
          component="h2"
          align="center"
        >
          {title}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1">
          <strong>Người chấm:</strong> {name}
        </Typography>
        <Typography variant="body1">
          <strong>Thời gian:</strong> {time}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography>Hình ảnh chấm công vào:</Typography>
          <img
            src={convertToImageUrl(image)}
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
        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Đóng
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CheckinModal;
