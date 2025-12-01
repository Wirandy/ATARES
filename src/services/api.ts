// src/services/api.ts — FINAL & 100% JALAN DI NEXT.JS 16

import axios from 'axios';

const api = axios.create({
  baseURL: '',                    // KOSONG!
  withCredentials: true,         // WAJIB: kirim cookie otomatis
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;