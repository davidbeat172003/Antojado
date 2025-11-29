import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ProtectedRoute({ children, requireBusiness = false }) {
  const { currentUser } = useAuth();
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUserType(docSnap.data().userType);
        }
      }
      setLoading(false);
    };

    checkUserType();
  }, [currentUser]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Cargando...</div>
    </div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requireBusiness && userType !== 'negocio') {
    return <Navigate to="/" />;
  }

  return children;
}