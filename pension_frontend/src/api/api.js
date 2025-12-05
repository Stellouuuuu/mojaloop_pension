import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

export default api;

// KPIs
export const getDashboardKPIs = () =>
  api.get("/dashboard/kpis").then(res => res.data);

// 10 derniers paiements
export const getRecentPayments = () =>
  api.get("/payments/recent").then(res => res.data);

// Alertes système
export const getAlerts = () =>
  api.get("/alerts").then(res => res.data);

// Tous les pensionnés
export const getPensioners = () =>
  api.get("/pensioners").then(res => res.data);

// Pensionné par ID
export const getPensionerById = (id) =>
  api.get(`/pensioners/${id}`).then(res => res.data);

// Mettre à jour un pensionné
export const updatePensioner = (id, payload) =>
  api.put(`/pensioners/${id}`, payload).then(res => res.data);

// Suspendre le paiement d’un pensionné
export const suspendPensionerPayment = (id) =>
  api.patch(`/pensioners/${id}/suspend`).then(res => res.data);

// Renvoyer une notification à un pensionné
export const resendPensionerNotification = (id) =>
  api.post(`/pensioners/${id}/notify`).then(res => res.data);
