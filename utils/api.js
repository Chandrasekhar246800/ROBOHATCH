// API utility functions for making authenticated requests

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('auth_token', token)
  } catch {}
}

export const removeAuthToken = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('auth_token')
  } catch {}
}

export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}
