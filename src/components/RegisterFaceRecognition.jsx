import { useState, useRef, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Snackbar,
} from "@mui/material";
import * as faceapi from "face-api.js";
import {
  registerface,
  getAllEmployeeInfor,
  checkFaceEmployee,
} from "../api/api";
import { useSnackbar } from "../components/SnackbarContext";

const RegisterFaceRecognition = () => {
  const [username, setUsername] = useState("");
  const [faceImage, setFaceImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFaceInFrame, setIsFaceInFrame] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [stream, setStream] = useState(null); // Trạng thái để lưu camera stream
  const [isAutoRegisterRunning, setIsAutoRegisterRunning] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const employeeId = localStorage.getItem("employeeId");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error"); // "success" or "error"
  const { showSnackbar } = useSnackbar(); // Sử dụng Snackbar Context
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `${import.meta.env.BASE_URL}models`;
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        console.log("Tải mô hình thành công");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Không thể tải mô hình:", err);
        setError(
          "Lỗi khi tải mô hình. Vui lòng kiểm tra cấu trúc thư mục và thử lại."
        );
      }
    };

    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(cameraStream);
      videoRef.current.srcObject = cameraStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        if (modelsLoaded) {
          detectFace();
        } else {
          setError("Mô hình chưa được tải. Vui lòng thử lại sau.");
        }
      };
    } catch (err) {
      setError("Không thể truy cập camera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStream(null);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const detectFace = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setError("Không thể lấy kích thước video.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (displaySize.width > 0 && displaySize.height > 0) {
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let eyesDetected = false;

        resizedDetections.forEach((detection) => {
          const landmarks = detection.landmarks._positions;
          const box = detection.alignedRect._box;

          const leftEye = landmarks[36];
          const rightEye = landmarks[45];

          eyesDetected =
            leftEye.x >= 0 &&
            leftEye.y >= 0 &&
            leftEye.x <= canvas.width &&
            leftEye.y <= canvas.height &&
            rightEye.x >= 0 &&
            rightEye.y >= 0 &&
            rightEye.x <= canvas.width &&
            rightEye.y <= canvas.height;

          ctx.strokeStyle = "green";
          ctx.lineWidth = 2;
          ctx.strokeRect(box._x, box._y, box._width, box._height);
        });

        setIsFaceInFrame(eyesDetected);
      }
    }, 500);
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    setFaceImage(imageData);
    setError("");
  };

  const autoRegister = async () => {
    if (selectedImages.length > 0) {
      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append("faceImage", image);
        if (role !== "[ADMIN]") {
          formData.append("username", employeeId);
        } else {
          if (username === "") {
            showSnackbar("Vui lòng chọn người cần đăng ký", "error");
          }
          formData.append("username", username);
        }
        try {
          const result = await registerface(formData, token);
          if (result.status === 200) {
            showSnackbar("Đăng ký khuôn mặt từ ảnh thành công!", "success");
          } else {
            showSnackbar("Lỗi đăng ký vui lòng thử lại", "error");
          }
        } catch (err) {
          showSnackbar("Lỗi đăng ký vui lòng thử lại", "error");
        }
      }
      return;
    }
    setIsAutoRegisterRunning(true); // Bắt đầu tự động đăng ký

    let attempts = 0; // Số lần thử hiện tại

    const interval = setInterval(async () => {
      if (attempts >= 10) {
        setIsAutoRegisterRunning(false);
        clearInterval(interval); // Dừng vòng lặp sau 10 lần thử
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) {
        setError("Không tìm thấy video hoặc canvas.");
        clearInterval(interval);
        return;
      }

      // Chụp hình từ video
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError("Không thể chụp hình từ camera.");
          return;
        }

        // Chuẩn bị dữ liệu để gửi lên server
        const file = new File([blob], `faceImage_${attempts}.png`, {
          type: "image/png",
        });
        const formData = new FormData();
        if (role !== "[ADMIN]") {
          formData.append("username", userId);
        } else {
          formData.append("username", username);
        }
        formData.append("faceImage", file);

        try {
          const result = await registerface(formData, token);
          console.log("Face registered successfully:", result);
          showSnackbar(
            `Đăng ký khuôn mặt thành công ở lần thử ${attempts}`,
            "success"
          );
          attempts += 1; // Tăng số lần thử
          setAttemptCount(attempts);
          return;
        } catch (err) {
          showSnackbar(`Có lỗi tại lần thử ${attempts}`, "success");
          setAttemptCount(attempts);
          attempts += 1; // Tăng số lần thử
        }
      }, "image/png");
    }, 1000); // Lặp mỗi giây
    setAttemptCount(0);
  };

  const handleRegisterOnetime = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      setError("Không tìm thấy video hoặc canvas.");
      return;
    }

    // Chụp hình từ video
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Không thể chụp hình từ camera.");
        return;
      }

      // Chuẩn bị dữ liệu để gửi lên server
      const file = new File([blob], `faceImage.png`, {
        type: "image/png",
      });
      const formData = new FormData();
      if (role !== "[ADMIN]") {
        formData.append("username", userId);
      } else {
        if (username === "") {
          showSnackbar("Vui lòng chọn người cần đăng ký", "error");
        }
        formData.append("username", username);
      }
      formData.append("faceImage", file);

      try {
        const result = await registerface(formData, token);
        if (result.status === 200) {
          showSnackbar("Đăng ký khuôn mặt thành công", "success");
        } else {
          showSnackbar("Đăng ký khuôn mặt thất bại vui lòng thử lại", "error");
        }

        return;
      } catch (err) {
        showSnackbar("Đăng ký khuôn mặt thất bại vui lòng thử lại", "error");
        console.log(err);
      }
    }, "image/png");
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllEmployeeInfor(token);
        setUserOptions(response);
        console.log(response);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const checkHasImage = async () => {
      try {
        const response = await checkFaceEmployee(employeeId, token);
        if (response.data) {
          setHasImage(true);
        } else {
          setHasImage(false);
        }
      } catch (e) {
        setHasImage(false);
        console.log(e);
      }
    };
    checkHasImage();
  });

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files); // Chuyển FileList thành mảng
    setSelectedImages((prevImages) => [...prevImages, ...files]);
    setError("");
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Hiển thị ảnh đã chọn (tuỳ chọn)
  const renderSelectedImages = () => {
    return selectedImages.map((image, index) => {
      const url = URL.createObjectURL(image);

      return (
        <div
          key={index}
          style={{
            margin: "5px",
            display: "inline-block",
            position: "relative",
          }}
        >
          <img
            src={url}
            alt={`Selected Preview ${index + 1}`}
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          <button
            onClick={() => handleRemoveImage(index)}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              width: "20px",
              height: "20px",
            }}
          >
            ×
          </button>
        </div>
      );
    });
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        padding: 4,
        background: "linear-gradient(135deg, #f0f4ff, #ffffff)",
        borderRadius: 3,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
        mt: 4,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center", color: "#1976d2" }}
      >
        Đăng Ký Nhận Diện Khuôn Mặt
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {role === "[ADMIN]" && (
          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth required>
              <InputLabel id="username-select-label">Tên người dùng</InputLabel>
              <Select
                labelId="username-select-label"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                }}
              >
                {userOptions.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "auto",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              background: "#000",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              style={{ width: "100%", borderRadius: "8px", objectFit: "cover" }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "8px",
              }}
            />
          </Box>
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={startCamera}
              sx={{
                background: "linear-gradient(90deg, #42a5f5, #1976d2)",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                },
                flex: 1,
              }}
            >
              Bắt đầu Camera
            </Button>
            <Button
              variant="contained"
              onClick={stopCamera}
              disabled={!stream}
              sx={{
                background: "linear-gradient(90deg, #ff6f61, #ff8a65)",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  background: "linear-gradient(90deg, #ff8a65, #ff6f61)",
                },
                flex: 1,
              }}
            >
              Ngừng Camera
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#555" }}
          >
            Hoặc chọn ảnh từ thiết bị của bạn:
          </Typography>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              display: "block",
              marginBottom: "10px",
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {renderSelectedImages()}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={autoRegister}
            disabled={
              (selectedImages.length === 0 && !isFaceInFrame) ||
              isAutoRegisterRunning
            }
            sx={{
              width: "100%",
              padding: "12px",
              fontWeight: "bold",
              borderRadius: "8px",
              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
              "&:hover": {
                background: "linear-gradient(90deg, #42a5f5, #1976d2)",
              },
            }}
          >
            {isAutoRegisterRunning
              ? `Đang đăng ký khuôn mặt (${attemptCount}/10) vui lòng không tắt ứng dụng`
              : "Đăng Ký tự động (hoặc chụp 10 tấm)"}
          </Button>
          <Button
            variant="contained"
            onClick={handleRegisterOnetime}
            disabled={!isFaceInFrame || isAutoRegisterRunning}
            sx={{
              marginTop: 5,
              width: "100%",
              padding: "12px",
              fontWeight: "bold",
              borderRadius: "8px",
              background: "linear-gradient(90deg, #1976d2, #42a5f5)",
              "&:hover": {
                background: "linear-gradient(90deg, #42a5f5, #1976d2)",
              },
            }}
          >
            {hasImage ? "Tiếp tục đăng ký" : "Đăng ký"}
          </Button>
        </Grid>
      </Grid>
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
    </Container>
  );
};

export default RegisterFaceRecognition;
