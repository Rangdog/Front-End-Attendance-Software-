import React, { useState } from "react";
import { Box, Modal, Typography, Button, Divider } from "@mui/material";
const CheckInModalFingerprint = ({ open, handleClose, name, time, title }) => {
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
        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Đóng
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CheckInModalFingerprint;
