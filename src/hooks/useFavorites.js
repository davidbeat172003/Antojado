import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Cargar favoritos cuando el usuario inicia sesión
  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Cargar favoritos desde Firebase
  const loadFavorites = async () => {
    try {
      const userDoc = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        setFavorites(docSnap.data().favorites || []);
      } else {
        // Crear documento si no existe
        await setDoc(userDoc, { favorites: [] });
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar o quitar favorito
  const toggleFavorite = async (localId) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      const userDoc = doc(db, 'users', currentUser.uid);
      const isFavorite = favorites.includes(localId);

      if (isFavorite) {
        // Quitar de favoritos
        await updateDoc(userDoc, {
          favorites: arrayRemove(localId)
        });
        setFavorites(prev => prev.filter(id => id !== localId));
      } else {
        // Agregar a favoritos
        await updateDoc(userDoc, {
          favorites: arrayUnion(localId)
        });
        setFavorites(prev => [...prev, localId]);
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      alert('Error al guardar favorito');
    }
  };

  return { favorites, toggleFavorite, loading };
}