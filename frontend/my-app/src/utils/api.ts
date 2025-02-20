import axios from "axios";

export const fetchClientRequests = async (email: string, token: string) => {
  try {
    const response = await axios.get(`/api/client-requests/?email=${email}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw error;
  }
};
