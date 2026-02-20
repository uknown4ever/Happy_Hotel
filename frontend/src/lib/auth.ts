export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const getUser = () => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const setAuth = (token: string, user: object) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}

// Validation helpers
export const validateEmail = (email: string): string => {
  if (!email) return 'Email is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) return 'Please enter a valid email address'
  return ''
}

export const validatePassword = (password: string): string => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return ''
}

export const validateRequired = (value: string, fieldName: string): string => {
  if (!value || !value.trim()) return `${fieldName} is required`
  return ''
}

export const validatePhone = (phone: string): string => {
  if (!phone) return 'Phone number is required'
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  if (!re.test(phone.replace(/\s/g, ''))) return 'Please enter a valid phone number'
  return ''
}

export const validatePositiveNumber = (value: number | string, fieldName: string): string => {
  const num = Number(value)
  if (isNaN(num) || num <= 0) return `${fieldName} must be a positive number`
  return ''
}