import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  IconButton,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
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
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [newCoordinates, setNewCoordinates] = useState(null);
  const [editAddress, setEditAddress] = useState(null);
  const [editCoordinates, setEditCoordinates] = useState(null);
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [userLocation, setUserLocation] = useState([21.0285, 105.8542]);
  const token = localStorage.getItem("token");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditOpen = (address) => {
    setEditAddress(address);
    setEditCoordinates({ lat: address.latitude, lng: address.longitude });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditAddress(null);
    setEditCoordinates(null);
  };

  const handleConfirmDeleteOpen = (id) => {
    setDeleteAddressId(id);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteClose = () => {
    setDeleteAddressId(null);
    setConfirmDeleteOpen(false);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error fetching user location:", error);
          setUserLocation([21.0285, 105.8542]);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getAllAddress(token);
        if (response) setAddresses(response);
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
      setAddresses((prev) => [...prev, response]);
      handleClose();
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const updateAddress = async () => {
    if (!editAddress || !editCoordinates) return;
    try {
      const response = await createAddress(
        {
          id: editAddress.id,
          address: editAddress.address,
          latitude: editCoordinates.lat,
          longitude: editCoordinates.lng,
        },
        token
      );
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === response.id ? response : addr))
      );
      handleEditClose();
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteAddressId) return;
    try {
      await apiDeleteAddress(deleteAddressId, token);
      setAddresses((prev) =>
        prev.filter((addr) => addr.id !== deleteAddressId)
      );
      handleConfirmDeleteClose();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const LocationMarker = ({ coordinates, setCoordinates, setAddress }) => {
    useMapEvents({
      click: async (event) => {
        const { lat, lng } = event.latlng;
        setCoordinates({ lat, lng });

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          setAddress(response.data.display_name);
        } catch (error) {
          console.error("Error fetching address:", error);
          setAddress("Không thể lấy địa chỉ");
        }
      },
    });

    return coordinates ? (
      <Marker position={[coordinates.lat, coordinates.lng]} icon={customIcon}>
        <Popup>{coordinates.address || "Đang xác định địa chỉ..."}</Popup>
      </Marker>
    ) : null;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Địa Chỉ
      </Typography>

      <Stack spacing={2}>
        {addresses.map((address) => (
          <Card key={address.id} sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Typography variant="body1">{address.address}</Typography>
              <Box>
                <IconButton
                  color="primary"
                  onClick={() => handleEditOpen(address)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleConfirmDeleteOpen(address.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Button
        variant="contained"
        color="success"
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
            borderRadius: 2,
            boxShadow: 5,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Chọn Địa Chỉ Mới
          </Typography>
          <Box
            sx={{
              height: "400px",
              mb: 2,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 2,
            }}
          >
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {addresses.map((address) => (
                <Marker
                  key={address.id}
                  position={[address.latitude, address.longitude]}
                  icon={customIcon}
                >
                  <Popup>{address.address}</Popup>
                </Marker>
              ))}
              <LocationMarker
                coordinates={newCoordinates}
                setCoordinates={setNewCoordinates}
                setAddress={setSelectedAddress}
              />
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

      <Modal open={editOpen} onClose={handleEditClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 5,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Chỉnh Sửa Địa Chỉ
          </Typography>
          <Box
            sx={{
              height: "400px",
              mb: 2,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 2,
            }}
          >
            <MapContainer
              center={[
                editCoordinates?.lat || 21.0285,
                editCoordinates?.lng || 105.8542,
              ]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {addresses.map((address) => (
                <Marker
                  key={address.id}
                  position={[address.latitude, address.longitude]}
                  icon={customIcon}
                >
                  <Popup>{address.address}</Popup>
                </Marker>
              ))}
              <LocationMarker
                coordinates={editCoordinates}
                setCoordinates={setEditCoordinates}
                setAddress={(newAddress) =>
                  setEditAddress((prev) => ({ ...prev, address: newAddress }))
                }
              />
            </MapContainer>
          </Box>
          <Typography gutterBottom>
            Địa chỉ: {editAddress?.address || "Chưa có địa chỉ"}
          </Typography>
          <Button variant="contained" color="primary" onClick={updateAddress}>
            Lưu Thay Đổi
          </Button>
        </Box>
      </Modal>

      <Modal open={confirmDeleteOpen} onClose={handleConfirmDeleteClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 5,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Xác nhận xóa
          </Typography>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn xóa địa chỉ này không?
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-around" }}>
            <Button variant="contained" color="error" onClick={confirmDelete}>
              Xóa
            </Button>
            <Button variant="outlined" onClick={handleConfirmDeleteClose}>
              Hủy
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AddressManager;
