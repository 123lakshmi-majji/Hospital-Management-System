import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Safely decode a JWT payload (no external lib needed)
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch (e) {
    return null
  }
}

// Returns true if the token is present and not expired
function isTokenValid(token) {
  if (!token) return false
  const decoded = decodeJwt(token)
  if (!decoded || !decoded.exp) return false
  // exp is in seconds; Date.now() is in milliseconds
  return decoded.exp * 1000 > Date.now()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  // On first mount: check sessionStorage for a valid token
  useEffect(() => {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')
    const role = sessionStorage.getItem('role')

    if (token && username && role && isTokenValid(token)) {
      setUser({ token, username, role })
    } else {
      // Clear any stale data
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      sessionStorage.removeItem('role')
      setUser(null)
    }
    setAuthReady(true)
  }, [])

  const login = (token, username, role) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('username', username)
    sessionStorage.setItem('role', role)
    setUser({ token, username, role })
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('role')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}