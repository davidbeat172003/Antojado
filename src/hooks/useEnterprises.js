import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useEnterprises() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEnterprises = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userType', '==', 'empresa'));
        const querySnapshot = await getDocs(q);
        
        const loadedEnterprises = querySnapshot.docs.map((doc) => {
          const userData = doc.data();
          const enterprise = userData.enterprise || {};
          
          return {
            id: `enterprise-${doc.id}`,
            firebaseId: doc.id,
            name: enterprise.name || userData.displayName || 'Empresa sin nombre',
            category: enterprise.category || 'Restaurante',
            rating: 4.5, // Rating por defecto para nuevas empresas
            image: enterprise.image || 'https://images.unsplash.com/photo-1504674900568-0a3456e3ee1b?w=400&h=300&fit=crop',
            address: enterprise.address || '',
            description: enterprise.description || 'Negocio registrado en Antojado',
            phone: enterprise.phone || '',
            isEnterprise: true
          };
        });

        setEnterprises(loadedEnterprises);
        setError(null);
      } catch (err) {
        console.error('Error al cargar empresas:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadEnterprises();
  }, []);

  return { enterprises, loading, error };
}
