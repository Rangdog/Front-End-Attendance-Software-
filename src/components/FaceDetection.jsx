import { useState, useRef, useEffect } from "react";
import { Container, Typography, Button, Grid, Alert } from "@mui/material";
import * as faceapi from "face-api.js";
import { checkCheckIntoday, getAllAddress, checkIfOnLeave } from "../api/api";

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
  const [addresses, setAddresses] = useState([]);
  const [userLocation, setUserLocation] = useState([21.0285, 105.8542]); // Hà Nội mặc định
  const [nearCom, setNearCom] = useState(false);
  const [isOnLeave, setIsOnLeave] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `${import.meta.env.BASE_URL}models`;
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        console.log("Models loaded successfully");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load models:", err);
        setError(
          "Error loading models. Please check the directory structure and try again."
        );
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

      if (distance <= 300) {
        console.log("Địa chỉ trong phạm vi 300:", address.address);
        setNearCom(true);
      }
    });
  }, [userLocation, addresses]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await checkCheckIntoday(userId, token); // Dùng await để chờ kết quả từ API
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await checkIfOnLeave(userId, token); // Dùng await để chờ kết quả từ API
      setIsOnLeave(data);
    };

    fetchData(); // Gọi hàm bất đồng bộ để lấy dữ liệu
  }, []); // Thêm dependencies để hàm chạy lại khi userId hoặc token thay đổi

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
          setError("Models not loaded. Please try again later.");
        }
      };
    } catch (err) {
      setError("Unable to access camera: " + err.message);
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
      setError("Cannot retrieve video dimensions.");
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

  const handleCheckIn = async () => {
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
        console.log(userId);
        const response = await fetch(
          `http://localhost:8080/api/users/check-in/${userId}`,
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
          setSuccess(
            `Xác minh thành công ${jsonData.label}, Distance: ${jsonData.distance}`
          );
          setError(``);
          setisCheckinToday(true);
        } else {
          setSuccess(``);
          setError(
            `Xác minh thất bại vui lòng thử lại: ${jsonData.label}, Distance: ${jsonData.distance}`
          );
        }
      }, "image/jpeg"); // Capture as JPEG format
    } catch (err) {
      setError(`An error occurred during recognition: ${err.message}`);
    }
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
        console.log(attendance.id);
        if (attendance != null) {
          formData.append("attendanceId", attendance.id);
        } else {
          setError(`Có lỗi xảy ra`);
          return;
        }
        // formData.append("attendanceId", attachmentId);
        const response = await fetch(
          `http://localhost:8080/api/users/check-out/${userId}`,
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
          setSuccess(
            `Xác minh thành công ${jsonData.label}, similarity: ${jsonData.distance}`
          );
          setError(``);
          setIsFinish(true);
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
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Face Detection for Check-In
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div style={{ position: "relative", width: "100%", height: "auto" }}>
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
          </div>
          <Button
            variant="contained"
            onClick={startCamera}
            style={{ marginTop: "10px" }}
          >
            Start Camera
          </Button>
          <Button
            variant="contained"
            onClick={stopCamera}
            style={{ marginTop: "10px", marginLeft: "10px" }}
            disabled={!stream}
          >
            Stop Camera
          </Button>
        </Grid>
        <Grid item xs={12}>
          {!isFinish ? (
            // Kiểm tra nếu isFinish là false
            !isCheckinToday ? (
              <Button
                variant="contained"
                onClick={handleCheckIn}
                disabled={!isFaceInFrame || !nearCom || isOnLeave} // Disabled nếu không có khuôn mặt trong khung hình
                style={{ marginTop: "10px" }}
              >
                Check In
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleCheckout}
                disabled={!isFaceInFrame || !nearCom || isOnLeave} // Disabled nếu không có khuôn mặt trong khung hình
                style={{ marginTop: "10px" }}
              >
                Check Out
              </Button>
            )
          ) : (
            // Nếu isFinish là true, hiển thị thông báo đã hoàn thành
            <Typography variant="body1" style={{ marginTop: "10px" }}>
              Bạn đã hoàn thành checkIn và checkOut hôm nay
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default FaceDetection;
