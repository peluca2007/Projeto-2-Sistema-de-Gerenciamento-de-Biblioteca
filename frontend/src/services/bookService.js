import api from './api';

export async function listBooks(filters = {}) {
  const { data } = await api.get('/books', { params: filters });
  return data;
}

export async function createBook(payload) {
  const { data } = await api.post('/books', payload);
  return data;
}

export async function updateBook(id, payload) {
  const { data } = await api.put(`/books/${id}`, payload);
  return data;
}

export async function deleteBook(id) {
  await api.delete(`/books/${id}`);
}