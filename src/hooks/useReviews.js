import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Cargar todas las reseñas de un local
  const loadReviews = async (localId) => {
    if (!localId) return;
    
    setLoading(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef, 
        where('localId', '==', localId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviewsData = [];
      
      querySnapshot.forEach((doc) => {
        reviewsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar nueva reseña
  const addReview = async (localId, rating, comment) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dejar una reseña');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      alert('Selecciona una calificación del 1 al 5');
      return;
    }

    if (!comment || comment.trim().length < 10) {
      alert('El comentario debe tener al menos 10 caracteres');
      return;
    }

    try {
      // Verificar si ya dejó reseña
      const existingReview = await getUserReview(localId);
      if (existingReview) {
        alert('Ya dejaste una reseña en este local. Puedes editarla.');
        return;
      }

      // Crear la reseña
      await addDoc(collection(db, 'reviews'), {
        localId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Usuario',
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Actualizar promedio del local
      await updateLocalRating(localId);
      
      alert('✅ Reseña publicada exitosamente');
      
      // Recargar reseñas
      await loadReviews(localId);
    } catch (error) {
      console.error('Error al agregar reseña:', error);
      alert('❌ Error al publicar reseña');
    }
  };

  // Verificar si el usuario ya dejó reseña
  const getUserReview = async (localId) => {
    if (!currentUser) return null;
    if (!localId) return null;

    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('localId', '==', localId),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const reviewDoc = querySnapshot.docs[0];
        return {
          id: reviewDoc.id,
          ...reviewDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error al verificar reseña:', error);
      return null;
    }
  };

  // Actualizar rating promedio del local
  const updateLocalRating = async (localId) => {
  // Validar que localId existe
    if (!localId) {
        console.error('localId es undefined en updateLocalRating');
        return;
    }

    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('localId', '==', localId));
        const querySnapshot = await getDocs(q);
        
        let totalRating = 0;
        let count = 0;
        
        querySnapshot.forEach((doc) => {
            totalRating += doc.data().rating;
            count++;
        });
        
        const averageRating = count > 0 ? (totalRating / count).toFixed(1) : 0;
        
        // Actualizar en Firestore
        const localDoc = doc(db, 'locales', localId);
        await updateDoc(localDoc, {
        rating: parseFloat(averageRating),
        reviewCount: count
        });
    } catch (error) {
        console.error('Error al actualizar rating:', error);
    }
    };

  // Eliminar reseña
  const deleteReview = async (reviewId, localId) => {
    if (!confirm('¿Eliminar esta reseña?')) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      await updateLocalRating(localId);
      await loadReviews(localId);
      alert('✅ Reseña eliminada');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ Error al eliminar reseña');
    }
  };

  // Editar reseña
  const updateReview = async (reviewId, localId, rating, comment) => {
    // Validación adicional
    if (!localId) {
        console.error('localId es requerido para actualizar la reseña');
        alert('❌ Error: No se pudo identificar el local');
        return;
    }

    // Validar que comment sea un string
    if (typeof comment !== 'string') {
        console.error('comment debe ser un string, recibido:', typeof comment, comment);
        alert('❌ Error: El comentario no es válido');
        return;
    }

    if (!comment || comment.trim().length < 10) {
        alert('El comentario debe tener al menos 10 caracteres');
        return;
    }

    try {
        await updateDoc(doc(db, 'reviews', reviewId), {
        rating,
        comment: comment.trim(),
        updatedAt: new Date().toISOString()
        });
        
        await updateLocalRating(localId);
        await loadReviews(localId);
        alert('✅ Reseña actualizada');
    } catch (error) {
        console.error('Error al actualizar:', error);
        alert('❌ Error al actualizar reseña');
    }
    };

  return {
    reviews,
    loading,
    loadReviews,
    addReview,
    deleteReview,
    updateReview,
    getUserReview
  };
}