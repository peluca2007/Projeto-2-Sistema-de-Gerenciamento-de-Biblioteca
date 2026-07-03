import api from './api';

export async function listLoans(filters = {}) {
  const { data } = await api.get('/loans', { params: filters });
  return data;
}

export async function createLoan(payload) {
  const { data } = await api.post('/loans', payload);
  return data;
}

export async function updateLoan(id, payload) {
  const { data } = await api.put(`/loans/${id}`, payload);
  return data;
}

export async function returnLoan(id) {
  const { data } = await api.put(`/loans/${id}/return`);
  return data;
}

export async function deleteLoan(id) {
  await api.delete(`/loans/${id}`);
}