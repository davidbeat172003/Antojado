import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Cargar favoritos desde Firestore
  async function loadFavorites(userId) {
    try {
      const favoritesRef = collection(db, 'users', userId, 'favorites');
      const querySnapshot = await getDocs(favoritesRef);
      const loadedFavorites = querySnapshot.docs.map(doc => doc.data().localId);
      setFavorites(loadedFavorites);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  }

  // Agregar/quitar de favoritos
  async function toggleFavorite(localId) {
    if (!currentUser) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    try {
      const favoriteRef = doc(db, 'users', currentUser.uid, 'favorites', localId.toString());
      
      if (favorites.includes(localId)) {
        // Quitar de favoritos
        await deleteDoc(favoriteRef);
        setFavorites(favorites.filter(id => id !== localId));
      } else {
        // Agregar a favoritos
        await setDoc(favoriteRef, {
          localId: localId,
          addedAt: new Date().toISOString()
        });
        setFavorites([...favorites, localId]);
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      alert('Error al actualizar favoritos');
    }
  }

  // Registrar nuevo usuario
async function signup(email, password, name, userType = 'cliente', enterpriseData = {}) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  await updateProfile(userCredential.user, {
    displayName: name
  });

  // Si es negocio/empresa, manejar datos adicionales
  if (userType === 'negocio' || userType === 'empresa') {
    let imageUrl = null;
    
    if (enterpriseData.imageFile) {
      try {
        const timestamp = Date.now();
        const fileExtension = enterpriseData.imageFile.name.split('.').pop();
        const fileName = `${timestamp}.${fileExtension}`;
        
        const imageRef = ref(storage, `enterprise-logos/${userCredential.user.uid}/${fileName}`);
        await uploadBytes(imageRef, enterpriseData.imageFile);
        imageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error('Error al subir imagen:', error);
      }
    }
  }

  return userCredential;
}

  // Iniciar sesión
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Cerrar sesión
  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadFavorites(user.uid);
      } else {
        setFavorites([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    favorites,
    signup,
    login,
    logout,
    toggleFavorite
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}