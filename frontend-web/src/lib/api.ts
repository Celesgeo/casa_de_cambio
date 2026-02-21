import axios from 'axios';
import { safeStorage } from './storage';

// Central API: en producción (Render) siempre usar backend casa-de-cambio-1
const envUrl = import.meta.env.VITE_API_BASE_URL;
const isProdRender =
  typeof window !== 'undefined' &&
  /\.onrender\.com$/.test(window.location?.hostname || '');
const baseURL =
  envUrl ||
  (isProdRender ? 'https://casa-de-cambio-1.onrender.com/api' : null) ||
  (typeof window !== 'undefined' && window.location?.hostname && !window.location.hostname.includes('onrender')
    ? `${window.location.protocol}//${window.location.hostname}:4000/api`
    : 'http://localhost:4000/api');

export const api = axios.create({
  baseURL: String(baseURL || 'https://casa-de-cambio-1.onrender.com/api'),
  timeout: 35000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token when present (safe for SSR/mobile where localStorage may be missing)
api.interceptors.request.use((config) => {
  try {
    const token = safeStorage.getItem('ga_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      safeStorage.removeItem('ga_token');
      // Redirect to login when token is invalid/expired (only for browser)
      if (typeof window !== 'undefined' && !window.location.hash.includes('login')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(err);
  }
);

// --- Types ---
export interface DashboardSummary {
  totalDailyVolume: number;
  totalPatrimony: number;
  spreadAverage: number;
  operationsToday: number;
  cashOnHand: number;
}

export interface Operation {
  _id: string;
  type: 'Compra' | 'Venta';
  clientName: string;
  currency: string;
  rate: number;
  amount: number;
  totalARS: number;
  employeeName: string;
  paymentMethod: 'Efectivo' | 'Transferencia';
  surchargePercent: number;
  adjustedRate: number;
  createdAt: string;
}

export interface ExchangeOperation {
  id: string;
  date: string;
  type: 'Compra' | 'Venta';
  customerName: string;
  fromCurrency: string;
  toCurrency: string;
  amountFrom: number;
  rateApplied: number;
  totalARS: number;
  branch: string;
  teller: string;
}

export interface CreateOperationPayload {
  type: 'Compra' | 'Venta';
  clientName: string;
  currency: string;
  rate: number;
  amount: number;
  employeeName: string;
  paymentMethod: 'Efectivo' | 'Transferencia';
  surchargePercent?: number;
  totalARS?: number;
}

export interface PatrimonyItem {
  currency: string;
  amount: number;
  lastUpdated: string | null;
}

export interface MarketRates {
  compra: number;
  venta: number;
  source?: string;
  updated?: string;
}

export interface ClosingResult {
  initialPatrimonyARS: number;
  totalBuysARS: number;
  totalSalesARS: number;
  expectedBalanceARS: number;
  actualBalanceARS: number;
  difference: number;
  patrimonyByCurrency: Record<string, number>;
  gainLossPercent?: number | null;
}

export interface WhatsAppQuote {
  text: string;
  compra: number;
  venta: number;
}

// --- Auth ---
export const login = (email: string, password: string) =>
  api.post<{ token: string; user: { _id: string; name: string; email: string; role: string } }>('/auth/login', { email, password });

export const register = (name: string, email: string, password: string, role?: string) =>
  api.post('/auth/register', { name, email, password, role });

// --- Dashboard summary ---
export const fetchDashboardSummary = () =>
  api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data);

// --- Operations ---
export const fetchExchangeOperations = async (): Promise<ExchangeOperation[]> => {
  const { data } = await api.get<Operation[]>('/operations');
  const list = Array.isArray(data) ? data : [];
  return list.map<ExchangeOperation>((op) => ({
    id: String(op._id ?? ''),
    date: op.createdAt ?? '',
    type: op.type === 'Venta' ? 'Venta' : 'Compra',
    customerName: op.clientName ?? '',
    fromCurrency: op.currency ?? '',
    toCurrency: 'ARS',
    amountFrom: Number(op.amount) || 0,
    rateApplied: Number(op.rate) || 0,
    totalARS: Number(op.totalARS) ?? 0,
    branch: 'Casa Central',
    teller: op.employeeName ?? ''
  }));
};

export const deleteAllOperations = () =>
  api.delete<{ message: string; deletedCount: number }>('/operations').then((r) => r.data);

export const createOperation = (payload: CreateOperationPayload) =>
  api.post<Operation>('/operations', {
    ...payload,
    rate: Number(payload.rate),
    amount: Number(payload.amount),
    surchargePercent: payload.surchargePercent != null ? Number(payload.surchargePercent) : 0,
    totalARS: payload.totalARS != null ? Number(payload.totalARS) : undefined
  });

// --- Patrimony ---
export const fetchPatrimony = () =>
  api.get<PatrimonyItem[]>('/patrimony').then((r) => r.data);

export const updatePatrimony = (currency: string, amount: number) =>
  api.put('/patrimony', { currency, amount }).then((r) => r.data);

export const initPatrimony = (entries: { currency: string; amount: number }[]) =>
  api.post('/patrimony/init', entries).then((r) => r.data);

// --- Rates ---
export const fetchMarketRates = () =>
  api.get<MarketRates>('/rates/market').then((r) => r.data);

export const fetchOurRates = () =>
  api.get<{ USD: { compra: number; venta: number }; lastUpdated: string | null }>('/rates/ours').then((r) => r.data);

export const syncOurRates = () =>
  api.post<{ message: string; rates: unknown }>('/rates/sync').then((r) => r.data);

// --- Closing ---
export const fetchClosingCalculation = () =>
  api.get<ClosingResult>('/closing/calculate').then((r) => r.data);

// --- Quote (WhatsApp) ---
export const fetchWhatsAppQuote = () =>
  api.get<WhatsAppQuote>('/quote/whatsapp').then((r) => r.data);
