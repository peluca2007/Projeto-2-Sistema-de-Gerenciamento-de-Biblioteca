import api from './api';

export async function listReaders(filters = {}) {
  const { data } = await api.get('/readers', { params: filters });
  return data;
}

export async function createReader(payload) {
  const { data } = await api.post('/readers', payload);
  return data;
}

export async function updateReader(id, payload) {
  const { data } = await api.put(`/readers/${id}`, payload);
  return data;
}

export async function deleteReader(id) {
  await api.delete(`/readers/${id}`);
}