import { useState, useEffect, useCallback } from 'react';
import { auth, provider, signInWithPopup, signOut } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthContext } from './context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  const GAS_URL = import.meta.env.VITE_GAS_URL;

  const verifyAccess = useCallback(async (email) => {
    try {
      const response = await fetch(`${GAS_URL}?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.status === 'success') {
        return data.hasAccess;
      } else {
        console.error('Error verifying access:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error calling verification API:', error);
      return false;
    }
  }, [GAS_URL]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if the user has access for the GAS
        const userHasAccess = await verifyAccess(firebaseUser.email);
        setHasAccess(userHasAccess);
        
        if (userHasAccess) {
          // Create a user object with necessary information
          const userData = {
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            picture: firebaseUser.photoURL,
            uid: firebaseUser.uid
          };
          setUser(userData);
        } else {
          // If no access, sign out
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
        setHasAccess(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [verifyAccess]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      
      // Verify access immediately after sign-in
      const userHasAccess = await verifyAccess(userEmail);
      
      if (!userHasAccess) {
        // If no access, sign out and throw error
        await signOut(auth);
        throw new Error(`Access denied for ${userEmail}. Please contact your administrator.`);
      }
      
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setHasAccess(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user && hasAccess,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}