import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import apiClient from "@/utils/apiClient";
import userDeliveryAuth from "./authContext";

const OrderContext = createContext(null);

// const token =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZWxpdmVyeUJveUlkIjoiNjgzNTU2ZTc2NjA1M2VjYTg5ZTBlZTQwIiwiaWF0IjoxNzQ4NDIyMTkxfQ.lQkEEDttODY8-xL8OI_vao3TMFi2K1j-YeuVwAOKacg';

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [acceptedOrderDetails, setAcceptedOrderDetails] = useState(null);
  const [rejectedOrderIds, setRejectedOrderIds] = useState([]);
  const { extractToken } = userDeliveryAuth();

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError(null);
    const token = await extractToken();
    try {
      const response = await apiClient("api/allorders", {
        method: "GET",
        headers: {
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response) throw new Error("Failed to fetch orders");

      const data = response;
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingOrders(false);
    }
  };

  const acceptOrder = async (orderId, onSuccess) => {
    setAcceptingOrderId(orderId);
    setError(null);
    console.log("this is from ordercontext",orderId)
    const token = await extractToken();
    try {
      const response = await apiClient(        
        `api/orders/${orderId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          
        }
      );
   console.log("this is from ",orderId)
      console.log("API Response:", response);
      if (!response)
        throw new Error( "Failed to accept order");

      const acceptedOrder = orders.find((o) => o._id === orderId);
      setAcceptedOrderDetails(acceptedOrder);

      Alert.alert("Success");
      if (onSuccess) onSuccess();
      fetchOrders();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setAcceptingOrderId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const rejectOrder = (orderId) => {
    setRejectedOrderIds((prev) => [...prev, orderId]);
    Alert.alert("Delined", "you declined the order");
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loadingOrders,
        acceptingOrderId,
        error,
        fetchOrders,
        acceptOrder,
        acceptedOrderDetails,
        rejectedOrderIds,
        rejectOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);