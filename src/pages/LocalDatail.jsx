import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; 
import { db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ArrowLeft, 
  Loader, 
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const LocalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerLocal = async () => {
      try {
        const docRef = doc(db, "locales", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLocal({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No se encontró el documento!");
        }
      } catch (error) {
        console.error("Error obteniendo el local:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerLocal();
  }, [id]);

  useEffect(() => {
    // Verificar si está en favoritos
    const checkFavorite = async () => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const favoritos = userSnap.data().favoritos || [];
            setIsFavorite(favoritos.includes(id));
          }
        } catch (error) {
          console.error("Error verificando favoritos:", error);
        }
      }
    };

    checkFavorite();
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) {
      // Si no está autenticado, redirigir a login
      navigate('/login', { state: { from: `/local/${id}` } });
      return;
    }

    setLoadingFavorite(true);

    try {
      const userRef = doc(db, "usuarios", user.uid);

      if (isFavorite) {
        // Remover de favoritos
        await updateDoc(userRef, {
          favoritos: arrayRemove(id)
        });
        setIsFavorite(false);
      } else {
        // Agregar a favoritos
        await updateDoc(userRef, {
          favoritos: arrayUnion(id)
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error actualizando favoritos:", error);
      alert("Error al actualizar favoritos. Por favor intenta de nuevo.");
    } finally {
      setLoadingFavorite(false);
    }
  };

  // Navegación de imágenes
  const nextImage = () => {
    if (local.imagenes && local.imagenes.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === local.imagenes.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (local.imagenes && local.imagenes.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? local.imagenes.length - 1 : prev - 1
      );
    }
  };

  // Estado de Carga
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Loader className="animate-spin text-orange-500" size={48} />
        <p className="mt-4 text-gray-600">Cargando local...</p>
      </div>
    );
  }

  // Estado si no encuentra el local
  if (!local) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Local no encontrado</h2>
          <p className="text-gray-600 mb-4">El local que buscas no existe o fue eliminado</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
          >
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Preparar imágenes (puede ser una imagen única o array)
  const images = local.imagenes 
    ? (Array.isArray(local.imagenes) ? local.imagenes : [local.imagenes])
    : (local.img ? [local.img] : ["https://via.placeholder.com/800x400?text=No+Imagen"]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de volver y favorito */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </Link>
          
          <button
            onClick={toggleFavorite}
            disabled={loadingFavorite}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={user ? (isFavorite ? "Quitar de favoritos" : "Agregar a favoritos") : "Inicia sesión para guardar favoritos"}
          >
            {loadingFavorite ? (
              <Loader className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Galería de imágenes */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={images[currentImageIndex]}
          alt={local.nombre}
          className="w-full h-full object-cover"
        />
        
        {/* Botones de navegación (solo si hay más de 1 imagen) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75 w-2'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header del local */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {local.nombre}
                  </h1>
                  <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    {local.categoria}
                  </span>
                </div>
              </div>

              {/* Rating */}
              {local.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(local.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{local.rating}</span>
                  {local.reviews && (
                    <span className="text-gray-500">({local.reviews} reseñas)</span>
                  )}
                </div>
              )}

              {/* Descripción */}
              <p className="text-gray-600 leading-relaxed">
                {local.descripcion || "Sin descripción disponible"}
              </p>
            </div>

            {/* Características */}
            {local.caracteristicas && local.caracteristicas.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Características</h2>
                <div className="grid grid-cols-2 gap-3">
                  {local.caracteristicas.map((caracteristica, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>{caracteristica}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menú */}
            {local.menu && local.menu.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Menú Popular</h2>
                <div className="space-y-3">
                  {local.menu.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <span className="text-gray-900 font-medium">{item.nombre || item.name}</span>
                      <span className="text-orange-600 font-semibold">{item.precio || item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa */}
            {local.coordenadas && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicación</h2>
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="mapa"
                    className="border-0"
                    src={`https://maps.google.com/maps?q=${local.coordenadas.lat},${local.coordenadas.lng}&z=15&output=embed`}
                    allowFullScreen
                    ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Información de contacto */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de Contacto</h2>
              
              <div className="space-y-4">
                {local.direccion && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Dirección</p>
                      <p className="text-gray-600 text-sm">{local.direccion}</p>
                    </div>
                  </div>
                )}

                {local.telefono && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Teléfono</p>
                      <a
                        href={`tel:${local.telefono}`}
                        className="text-orange-600 hover:text-orange-700 text-sm"
                      >
                        {local.telefono}
                      </a>
                    </div>
                  </div>
                )}

                {local.horario && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Horario</p>
                      <p className="text-gray-600 text-sm">{local.horario}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="mt-6 space-y-3">
                {local.telefono && (
                  <>
                    <a
                      href={`https://wa.me/${local.telefono.replace(/\s/g, '').replace(/\+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
                    >
                      <Phone size={20} />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${local.telefono}`}
                      className="flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
                    >
                      <Phone size={20} />
                      Llamar Ahora
                    </a>
                  </>
                )}
                
                {local.coordenadas && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${local.coordenadas.lat},${local.coordenadas.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
                    >
                    <ExternalLink size={20} />
                    Cómo Llegar
                </a>    
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalDetail;