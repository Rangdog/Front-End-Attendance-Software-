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
} from "@mui/material";
import * as faceapi from "face-api.js";
import { registerface, getAllEmployeeInfor } from "../api/api";

const RegisterFaceRecognition = () => {
  const [username, setUsername] = useState("");
  const [faceImage, setFaceImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFaceInFrame, setIsFaceInFrame] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null); // Trạng thái để lưu camera stream
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [userOptions, setUserOptions] = useState([]);

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
      setStream(cameraStream); // Lưu stream vào trạng thái
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
      stream.getTracks().forEach((track) => track.stop()); // Stop all tracks of the stream
      videoRef.current.srcObject = null; // Clear video source
      setStream(null); // Clear stream state

      // Clear the canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
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

        let eyesDetected = false; // Cờ để kiểm tra xem có đủ hai con mắt không

        resizedDetections.forEach((detection) => {
          const landmarks = detection.landmarks._positions;
          const box = detection.alignedRect._box;

          const leftEye = landmarks[36]; // Điểm landmark của mắt trái
          const rightEye = landmarks[45]; // Điểm landmark của mắt phải

          // Kiểm tra xem cả hai mắt có được phát hiện trong khu vực canvas không
          eyesDetected =
            leftEye.x >= 0 &&
            leftEye.y >= 0 &&
            leftEye.x <= canvas.width &&
            leftEye.y <= canvas.height &&
            rightEye.x >= 0 &&
            rightEye.y >= 0 &&
            rightEye.x <= canvas.width &&
            rightEye.y <= canvas.height;

          const adjustedLandmarks = landmarks.map((landmark) => {
            return {
              x: landmark.x * 0.86,
              y: landmark.y * 0.86,
            };
          });

          ctx.fillStyle = "red"; // Màu cho các điểm landmarks
          adjustedLandmarks.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI); // Vẽ hình tròn nhỏ tại mỗi điểm landmark
            ctx.fill();
          });

          const x = box._x;
          const y = box._y;
          const width = box._width;
          const height = box._height;

          setIsFaceInFrame(
            x >= 0 &&
              y >= 0 &&
              x + width <= canvas.width &&
              y + height <= canvas.height
          );
        });

        // Cập nhật trạng thái isFaceInFrame dựa trên việc phát hiện đủ hai mắt
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (role !== "[ADMIN]") {
      setUsername(userId);
    }
    if (!username || !faceImage) {
      setError("Vui lòng nhập tên và chụp ảnh khuôn mặt.");
      return;
    }
    const base64Response = await fetch(faceImage);
    const blob = await base64Response.blob();
    const file = new File([blob], "faceImage.png", { type: "image/png" });
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
    } catch (err) {
      setError(`Có lỗi xảy ra: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllEmployeeInfor(token);
        setUserOptions(response); // Giả sử API trả về danh sách người dùng
        console.log(response);
        console.log(userOptions);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Đăng Ký Nhận Diện Khuôn Mặt
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {role === "[ADMIN]" && ( // Kiểm tra vai trò để hiển thị FormControl
              <FormControl
                variant="outlined"
                fullWidth
                margin="normal"
                required
              >
                <InputLabel id="username-select-label">
                  Tên người dùng
                </InputLabel>
                <Select
                  labelId="username-select-label"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  label="Tên người dùng"
                >
                  {userOptions.map((user) => (
                    <MenuItem key={user.userId} value={user.userId}>
                      {user.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item xs={12}>
            <div
              style={{ position: "relative", width: "100%", height: "auto" }}
            >
              <video
                ref={videoRef}
                autoPlay
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  borderRadius: "8px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "50%",
                  transform: "translate(-50%, -10%)",
                  width: "80%",
                  height: "80%",
                  border: "2px dashed rgba(255, 165, 0, 0.8)",
                  borderRadius: "8px",
                  pointerEvents: "none",
                }}
              ></div>
            </div>
            <Button
              variant="contained"
              onClick={startCamera}
              style={{ marginTop: "10px" }}
            >
              Bắt đầu Camera
            </Button>
            <Button
              variant="contained"
              onClick={stopCamera}
              style={{ marginTop: "10px", marginLeft: "10px" }}
              disabled={!stream}
            >
              Ngừng Camera
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={captureImage}
              disabled={!isFaceInFrame} // Chỉ cho phép chụp ảnh khi phát hiện đủ hai mắt
              style={{ marginTop: "10px" }}
            >
              Chụp Ảnh
            </Button>
            {faceImage && (
              <img
                src={faceImage}
                alt="Captured"
                style={{
                  marginTop: "10px",
                  width: "100%",
                  borderRadius: "8px",
                }}
              />
            )}
          </Grid>
          <Typography>
            Nếu bạn thấy khuôn mặt chưa được rõ vui lòng chụp lại
          </Typography>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Đăng Ký
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default RegisterFaceRecognition;
