import { useState, useEffect, createContext, useContext } from 'react'
import { auth } from '../firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'
import axios from '../lib/axios'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'fleet_admin' | 'driver'
  const [fleetId, setFleetId] = useState(null)
  const [fleetCode, setFleetCode] = useState(null) // Only for fleet admins
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Firebase authentication flow
    console.log('🔐 Initializing Firebase authentication');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log('🔑 Firebase user detected:', firebaseUser.email);
          // Get user profile from backend to determine role
          const token = await firebaseUser.getIdToken()
          console.log('🎫 Got Firebase token, fetching profile from backend...');
          
          const response = await axios.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          console.log('✅ User authenticated:', response.data);
          
          setUser(firebaseUser)
          setUserRole(response.data.role) // 'fleet_admin' or 'driver'
          setFleetId(response.data.fleetId)

          // Fetch fleet code if user is fleet admin
          if (response.data.role === 'fleet_admin') {
            try {
              const fleetCodeRes = await axios.get('/api/auth/fleet-code', {
                headers: { Authorization: `Bearer ${token}` }
              })
              setFleetCode(fleetCodeRes.data.fleetCode)
            } catch (err) {
              console.error('❌ Error fetching fleet code:', err)
            }
          }
        } catch (error) {
          console.error('❌ Error fetching user profile:', error.message, error.response?.data)
          setUser(null)
          setUserRole(null)
          setFleetId(null)
          setFleetCode(null)
        }
      } else {
        console.log('👤 No Firebase user found');
        setUser(null)
        setUserRole(null)
        setFleetId(null)
        setFleetCode(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // Fetch user profile to get role
    const token = await userCredential.user.getIdToken()
    const response = await axios.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    return { 
      user: userCredential.user,
      role: response.data.role,
      fleetId: response.data.fleetId 
    }
  }

  const signUp = async (email, password, role, fleetData) => {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user profile in backend
    const token = await userCredential.user.getIdToken()
    const response = await axios.post('/auth/register', {
      email,
      role, // 'fleet_admin' or 'driver'
      fleetData // { companyName, name, phone } for admin, { fleetCode, name, phone, licenseNumber } for driver
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    return { 
      user: userCredential.user,
      role: response.data.role,
      fleetId: response.data.fleetId,
      fleetCode: response.data.fleetCode // Only for fleet admin
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setUserRole(null)
    setFleetId(null)
    setFleetCode(null)
  }

  const value = {
    user,
    userRole,
    fleetId,
    fleetCode, // Exposed for Settings and Drivers pages
    loading,
    signIn,
    signUp,
    signOut,
    isFleetAdmin: userRole === 'fleet_admin',
    isDriver: userRole === 'driver'
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
