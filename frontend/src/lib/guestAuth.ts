// Guest auth — separate from staff/admin auth

export const getGuestToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('guest_token')
}

export const getGuestUser = () => {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('guest_user')
  return u ? JSON.parse(u) : null
}

export const setGuestAuth = (token: string, user: object) => {
  localStorage.setItem('guest_token', token)
  localStorage.setItem('guest_user', JSON.stringify(user))
}

export const clearGuestAuth = () => {
  localStorage.removeItem('guest_token')
  localStorage.removeItem('guest_user')
}

export const isGuestAuthenticated = (): boolean => !!getGuestToken()

// Pending booking — saved before login, restored after
export const savePendingBooking = (data: object) => {
  localStorage.setItem('pending_booking', JSON.stringify(data))
}

export const getPendingBooking = () => {
  if (typeof window === 'undefined') return null
  const d = localStorage.getItem('pending_booking')
  return d ? JSON.parse(d) : null
}

export const clearPendingBooking = () => {
  localStorage.removeItem('pending_booking')
}