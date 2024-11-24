// src/api/api.js
import axios from "axios";
// Cấu hình Axios
const api = axios.create({
  baseURL: "http://localhost:8080/api", // Địa chỉ backend
});

// Hàm đăng ký người dùng
export const registerUser = async (user) => {
  return await api.post("/users/register", user);
};

// Hàm đăng nhập và nhận token
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data; // Trả về token
};

// Hàm chấm công check-in
export const checkIn = async (attendance, token) => {
  return await api.post("/attendance/checkin", attendance, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Hàm chấm công check-out
export const checkOut = async (attendance, token) => {
  return await api.post("/attendance/checkout", attendance, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Hàm lấy lịch sử chấm công
export const getAttendanceHistory = async (
  userId,
  startDate,
  endDate,
  token
) => {
  try {
    const response = await api.get(`/attendance/user/${userId}`, {
      params: { startDate, endDate },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return error.message;
  }
};

// Hàm tính lương
export const calculatePayroll = async (userId, month, year, token) => {
  return await api.post(
    `/payroll/calculate/${userId}/${month}/${year}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Hàm lấy thông tin lương
export const getPayroll = async (userId, month, year, token) => {
  return await api.get(`/payroll/user/${userId}/month/${month}/year/${year}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const requestLeave = async (data, token) => {
  const response = await api.post("/request-leave", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data);
  return response.data;
};

export const getALLRequestLeave = async (token) => {
  const response = await api.get("/request-leave", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data);
  return response.data;
};

export const approveRequest = async (id, token) => {
  const response = await api.put(
    `/request-leave/approve/${id}`, // Endpoint API
    {}, // Không cần body
    {
      headers: {
        Authorization: `Bearer ${token}`, // Gửi JWT token trực tiếp trong headers
      },
    }
  );
  console.log(response);
  return response.data;
};

export const rejectRequest = async (id, token) => {
  const response = await api.put(
    `/request-leave/reject/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const registerface = async (data, token) => {
  try {
    const response = await api.post("/users/register-face", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return response data
  } catch (error) {
    // Handle error as needed
    console.error("Error registering face:", error);
    throw error; // rethrow the error to be handled by the caller
  }
};
export const checkIfOnLeave = async (userId, token) => {
  try {
    const response = await api.get(`/request-leave/is-on-leave`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { userId },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return false;
  }
};

export const hasCheckinToday = async (userId, token) => {
  try {
    const response = await api.get(`/attendance/hasCheckedInToday/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return false;
  }
};

export const checkCheckIntoday = async (userId, token) => {
  try {
    const response = await api.get(`/attendance/checkCheckinToday/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return error.message;
  }
};

export const getEmployeeInfor = async (userId, token) => {
  try {
    const response = await api.get(`/employee/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return error.message;
  }
};

export const checkExistEmployeeInfor = async (userId, token) => {
  try {
    const response = await api.get(`/employee/check/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return false;
  }
};

export const createEmployee = async (data, token) => {
  try {
    const response = await api.post(`/employee`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return error.message;
  }
};

export const updateEmployee = async (data, token) => {
  try {
    const response = await api.put(`/employee`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return error.message;
  }
};

export const getAllEmployeeInfor = async (token) => {
  try {
    const response = await api.get(`/employee`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return false;
  }
};

export const exportSalary = async (data, token) => {
  try {
    const response = await api.get(`/attendance/export`, {
      params: data,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return false;
  }
};

export const createAddress = async (data, token) => {
  try {
    const response = await api.post(`/addresses`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return error.message;
  }
};

export const apiDeleteAddress = async (id, token) => {
  try {
    const response = await api.delete(
      `/addresses/${id}`,

      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return error.message;
  }
};

export const getAllAddress = async (token) => {
  try {
    const response = await api.get(`/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return false;
  }
};

export const createSalary = async (data, token) => {
  try {
    const response = await api.post(`/salaries`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return error.message;
  }
};

export const getCurrentSalary = async (userId, token) => {
  try {
    const response = await api.get(`/salaries/current/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error as needed
    console.error("Error", error);
    return false;
  }
};

export const checkTokenValidity = async (token) => {
  try {
    const response = await api.post(`/auth/validate`, token, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    window.location.href = "/";
    return false;
  }
};
