import { useState, useEffect } from "react";
import { Box, Button, Modal, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { createAddress, apiDeleteAddress, getAllAddress } from "../api/api";

// Tùy chỉnh icon marker
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // URL icon marker
  iconSize: [32, 32], // Kích thước icon
  iconAnchor: [16, 32], // Điểm neo (bottom center)
});

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [newCoordinates, setNewCoordinates] = useState(null);
  const [userLocation, setUserLocation] = useState([21.0285, 105.8542]); // Default: Hà Nội
  const token = localStorage.getItem("token");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          setUserLocation([21.0285, 105.8542]); // fallback
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation([21.0285, 105.8542]); // fallback
    }
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getAllAddress(token);
        if (response) {
          setAddresses(response);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, [token]);

  const saveAddress = async () => {
    if (!selectedAddress || !newCoordinates) return;
    try {
      const response = await createAddress(
        {
          address: selectedAddress,
          latitude: newCoordinates.lat,
          longitude: newCoordinates.lng,
        },
        token
      );
      console.log(response);
      setAddresses((prevAddresses) => [...prevAddresses, response]);
      handleClose();
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await apiDeleteAddress(id, token);
      setAddresses((prevAddresses) =>
        prevAddresses.filter((address) => address.id !== id)
      );
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click: async (event) => {
        const { lat, lng } = event.latlng;
        setNewCoordinates({ lat, lng });

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          setSelectedAddress(response.data.display_name);
        } catch (error) {
          console.error("Error fetching address:", error);
          setSelectedAddress("Không thể lấy địa chỉ");
        }
      },
    });

    return newCoordinates ? (
      <Marker
        position={[newCoordinates.lat, newCoordinates.lng]}
        icon={customIcon}
      >
        <Popup>{selectedAddress || "Đang xác định địa chỉ..."}</Popup>
      </Marker>
    ) : null;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Địa Chỉ
      </Typography>

      <Box>
        {addresses.map((address) => {
          // Kiểm tra xem address có hợp lệ không
          if (!address || !address.address) {
            console.error("Địa chỉ không hợp lệ:", address);
            return null; // Tránh hiển thị phần tử không hợp lệ
          }

          return (
            <Box
              key={address.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderBottom: "1px solid #ccc",
              }}
            >
              <Typography>{address.address}</Typography>
              <Box>
                <IconButton
                  onClick={() => console.log("Chỉnh sửa", address.id)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => deleteAddress(address.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleOpen}
      >
        Thêm Địa Chỉ
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Chọn Địa Chỉ Mới
          </Typography>
          <Box sx={{ height: "400px", mb: 2 }}>
            <MapContainer
              center={userLocation} // Tọa độ GPS của người dùng
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Hiển thị các marker cho các địa chỉ đã có sẵn */}
              {addresses.map((address) => (
                <Marker
                  key={address.id}
                  position={[address.latitude, address.longitude]}
                  icon={customIcon}
                >
                  <Popup>{address.address}</Popup>
                </Marker>
              ))}
              <Marker key={100} position={userLocation} icon={customIcon}>
                <Popup>{selectedAddress || "Đang xác định địa chỉ..."}</Popup>
              </Marker>

              <LocationMarker />
            </MapContainer>
          </Box>
          <Typography gutterBottom>
            Địa chỉ đang chọn: {selectedAddress || "Chưa có địa chỉ"}
          </Typography>
          <Button variant="contained" color="primary" onClick={saveAddress}>
            Lưu Địa Chỉ
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default AddressManager;
