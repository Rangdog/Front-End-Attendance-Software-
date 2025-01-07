import { useState, useRef, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Alert,
  Stack,
  Box,
  Card,
} from "@mui/material";
import * as faceapi from "face-api.js";
import { checkCheckIntoday, getAllAddress, checkIfOnLeave } from "../api/api";
import CheckinModal from "./CheckinModal";
import { useNavigate } from "react-router-dom";
const FaceDetection = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFaceInFrame, setIsFaceInFrame] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCheckinToday, setisCheckinToday] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [isFinish, setIsFinish] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const token = localStorage.getItem("token"); // Assuming you store the token in localStorage
  const userId = localStorage.getItem("userId");
  const employeeId = localStorage.getItem("employeeId");
  const [addresses, setAddresses] = useState([]);
  const [userLocation, setUserLocation] = useState([21.0285, 105.8542]); // Hà Nội mặc định
  const [nearCom, setNearCom] = useState(false);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [isAutoCheckinRunning, setIsAutoCheckinRunning] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [imagecheckin, setImagecheckin] = useState("");
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const handleCheckinSuccess = (name, time, image, title) => {
    setEmployeeName(name);
    setCheckinTime(time);
    setImagecheckin(image);
    setTitle(title);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    navigate("/attendance");
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `${import.meta.env.BASE_URL}models`;
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load models:", err);
        setError("Có lỗi vui lòng tải lại trang");
      }
    };

    loadModels();
  }, []);
  // Lấy vị trí GPS của người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error fetching user location:", error);
        },
        {
          enableHighAccuracy: true, // Yêu cầu độ chính xác cao
          timeout: 10000, // Thời gian chờ tối đa (ms)
          maximumAge: 0, // Không sử dụng dữ liệu cũ
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);
  // Lấy danh sách địa chỉ
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getAllAddress(token);
        setAddresses(response);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, []);

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Đơn vị mét (Radius of Earth)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Khoảng cách tính được (đơn vị mét)
    return distance;
  };

  useEffect(() => {
    console.log("run");
    addresses.forEach((address) => {
      const distance = haversine(
        userLocation[0], // vĩ độ người dùng
        userLocation[1], // kinh độ người dùng
        address.latitude, // vĩ độ địa chỉ
        address.longitude // kinh độ địa chỉ
      );
      console.log(distance);
      if (distance <= 1500) {
        setNearCom(true);
      }
    });
  }, [userLocation, addresses]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await checkCheckIntoday(employeeId, token); // Dùng await để chờ kết quả từ API
      if (data === "") {
        return;
      }
      setAttendance(data);
      if (data.checkIn !== "") {
        setisCheckinToday(true);
      }
      if (data.checkOut !== "") {
        setIsFinish(true);
      }
    };

    fetchData(); // Gọi hàm bất đồng bộ để lấy dữ liệu
  }, []); // Thêm dependencies để hàm chạy lại khi userId hoặc token thay đổi

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await checkIfOnLeave(employeeId, token); // Dùng await để chờ kết quả từ API
  //     setIsOnLeave(data);
  //   };

  //   fetchData(); // Gọi hàm bất đồng bộ để lấy dữ liệu
  // }, []); // Thêm dependencies để hàm chạy lại khi userId hoặc token thay đổi

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
          setError("Có lỗi vui lòng tải lại trang");
        }
      };
    } catch (err) {
      setError(
        "Lỗi camera vui lòng kiểm tra lại camera của bạn " + err.message
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStream(null);
      // Clear the canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const detectFace = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setError("Có lỗi vui lòng thử lại");
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

          const leftEye = landmarks[36]; // Left eye landmark
          const rightEye = landmarks[45]; // Right eye landmark

          // Check if both eyes are detected within the canvas
          eyesDetected =
            leftEye.x >= 0 &&
            leftEye.y >= 0 &&
            leftEye.x <= canvas.width &&
            leftEye.y <= canvas.height &&
            rightEye.x >= 0 &&
            rightEye.y >= 0 &&
            rightEye.x <= canvas.width &&
            rightEye.y <= canvas.height;

          // Draw face box
          ctx.strokeStyle = "green";
          ctx.lineWidth = 2;
          ctx.strokeRect(box._x, box._y, box._width, box._height);
        });

        // Update the face detection state
        // Update the face detection state
        setIsFaceInFrame(eyesDetected);
      }
    }, 500);
  };

  const handleCheckIn = async (interval) => {
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) {
        setError("Error accessing video or canvas element.");
        return false;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError("Failed to capture image from video.");
          return false;
        }

        const formData = new FormData();
        formData.append("faceImage", blob, "capture.jpg");

        const response = await fetch(
          `http://localhost:8080/api/users/check-in/${employeeId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        if (response.status === 200) {
          const data = await response.text();
          const jsonData = JSON.parse(data);
          console.log(jsonData);
          setError("");
          setisCheckinToday(true);
          clearInterval(interval);
          const fetchData = async () => {
            const data = await checkCheckIntoday(employeeId, token); // Dùng await để chờ kết quả từ API
            if (data === "") {
              return;
            }
            setAttendance(data);
            if (data.checkIn !== "") {
              setisCheckinToday(true);
            }
            if (data.checkOut !== "") {
              setIsFinish(true);
            }
          };
          fetchData(); // Gọi hàm bất đồng bộ để lấy dữ liệu
          const currentTime = new Date().toLocaleTimeString("vi-VN"); // Lấy giờ hiện tại
          handleCheckinSuccess(
            jsonData.name,
            currentTime,
            jsonData.image,
            "Chấm công vào thành công"
          );
          return true;
        } else {
          setError(`Xác minh thất bại, vui lòng thử lại!`);
          setSuccess("");
          return false;
        }
      }, "image/jpeg");

      return false;
    } catch (err) {
      setError(`An error occurred during recognition: ${err.message}`);
      return false;
    }
  };

  const handleAutoCheckIn = async () => {
    setIsAutoCheckinRunning(true);
    setAttemptCount(0);
    let cnt = 0;
    const interval = setInterval(async () => {
      if (cnt >= 10) {
        setError("chấm công vào thất bại. Vui lòng thử lại.");
        setIsAutoCheckinRunning(false);
        clearInterval(interval);
        return;
      }

      const success = await handleCheckIn(interval);
      cnt += 1;
      if (success) {
        setIsAutoCheckinRunning(false);
        clearInterval(interval);
        return;
      }

      setAttemptCount((prev) => prev + 1);
    }, 1000); // Chạy mỗi giây
  };

  const handleCheckout = async () => {
    try {
      // Draw the current video frame to the canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) {
        setError("Error accessing video or canvas element.");
        return;
      }

      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas content to a Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError("Failed to capture image from video.");
          return;
        }

        // Set up FormData and append the captured image as "faceImage"
        const formData = new FormData();
        formData.append("faceImage", blob, "capture.jpg");
        if (attendance != null) {
          formData.append("attendanceId", attendance.id);
        } else {
          setError(`Có lỗi xảy ra`);
          return;
        }
        // formData.append("attendanceId", attachmentId);
        const response = await fetch(
          `http://localhost:8080/api/users/check-out/${employeeId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, // Use token from localStorage
            },
            body: formData,
          }
        );
        const data = await response.text();
        const jsonData = JSON.parse(data); // Chuyển đổi thành object
        console.log(jsonData);
        if (response.ok) {
          const currentTime = new Date().toLocaleTimeString("vi-VN"); // Lấy giờ hiện tại
          setSuccess(
            `Xác minh thành công ${jsonData.label}, similarity: ${jsonData.distance}`
          );
          setError(``);
          setIsFinish(true);
          console.log("âsdsad");
          handleCheckinSuccess(
            jsonData.name,
            currentTime,
            jsonData.image,
            "Chấm công ra thành công thành công"
          );
        } else {
          setSuccess(``);
          setError(
            `Xác minh thất bại vui lòng thử lại: ${jsonData.message}, similarity: ${jsonData.distance}`
          );
        }
      }, "image/jpeg"); // Capture as JPEG format
    } catch (err) {
      setError(`An error occurred during recognition: ${err.message}`);
    }
  };
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <CheckinModal
        open={openModal}
        handleClose={handleCloseModal}
        image={imagecheckin}
        name={employeeName}
        time={checkinTime}
        title={title}
      />
      <Card
        sx={{
          padding: 4,
          borderRadius: 3,
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          background: "linear-gradient(135deg, #f5f7fa, #ffffff)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
          }}
        >
          Chấm công bằng khuôn mặt
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

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            mt: 3,
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 600,
              aspectRatio: "16/9",
              borderRadius: 2,
              overflow: "hidden",
              border: "2px solid rgba(0,0,0,0.2)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
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

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={startCamera}
              sx={{
                padding: "10px 20px",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #42a5f5, #1976d2)",
                "&:hover": {
                  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                },
              }}
            >
              Bắt đầu Camera
            </Button>
            <Button
              variant="contained"
              onClick={stopCamera}
              disabled={!stream}
              sx={{
                padding: "10px 20px",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #ff6f61, #ff8a65)",
                "&:hover": {
                  background: "linear-gradient(90deg, #ff8a65, #ff6f61)",
                },
              }}
            >
              Dừng Camera
            </Button>
          </Stack>

          {!isFinish ? (
            !isCheckinToday ? (
              <Button
                variant="contained"
                onClick={handleCheckIn}
                disabled={
                  !isFaceInFrame ||
                  !nearCom ||
                  isOnLeave ||
                  isAutoCheckinRunning
                }
                sx={{
                  padding: "12px 30px",
                  fontWeight: "bold",
                  borderRadius: 2,
                  mt: 2,
                  background: "linear-gradient(90deg, #66bb6a, #43a047)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #43a047, #66bb6a)",
                  },
                }}
              >
                {isAutoCheckinRunning
                  ? `Đang Check-In (${attemptCount}/10)`
                  : "Chấm công vào"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleCheckout}
                disabled={!isFaceInFrame || !nearCom || isOnLeave}
                sx={{
                  padding: "12px 30px",
                  fontWeight: "bold",
                  borderRadius: 2,
                  mt: 2,
                  background: "linear-gradient(90deg, #ffa726, #fb8c00)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #fb8c00, #ffa726)",
                  },
                }}
              >
                Chấm công ra
              </Button>
            )
          ) : (
            <Typography
              variant="h6"
              align="center"
              sx={{
                color: "green",
                mt: 3,
                fontWeight: "bold",
              }}
            >
              Bạn đã hoàn thành chấm công trong ngày hôm nay
            </Typography>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default FaceDetection;
