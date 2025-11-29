import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, Star, MapPin, Clock, Phone, Globe, 
  ChevronLeft, Share2, Navigation, MessageCircle, Facebook, Instagram, MessageSquare
} from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

export default function RestaurantDetail({ locales }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedImage, setSelectedImage] = useState(0);

  // Encontrar el local por ID
  const local = locales.find(l => l.id === id);

  // Si no existe el local, mostrar error
  if (!local) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Local no encontrado</h1>
          <Link to="/" className="text-orange-500 hover:text-orange-600">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Imágenes de galería (por ahora duplicamos la imagen principal)
  const gallery = local.images && local.images.length > 0 
  ? local.images 
  : [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop'
    ];

  // Datos adicionales (esto vendrá de Firebase después)
  const horarios = [
    { dia: 'Lunes - Viernes', horas: '10:00 AM - 10:00 PM' },
    { dia: 'Sábado - Domingo', horas: '9:00 AM - 11:00 PM' }
  ];

  // Redes sociales
  const redesSociales = {
    facebook: 'https://facebook.com/lafogatagrill',
    instagram: 'https://instagram.com/lafogatagrill',
    whatsapp: 'https://wa.me/573124567890'
  };

  const menu = [
    { nombre: 'Bandeja Paisa', precio: '$25,000', descripcion: 'Plato tradicional colombiano' },
    { nombre: 'Churrasco', precio: '$32,000', descripcion: 'Carne a la parrilla con guarnición' },
    { nombre: 'Lomo de Cerdo', precio: '$28,000', descripcion: 'Lomo jugoso con papas' },
    { nombre: 'Pechuga Gratinada', precio: '$24,000', descripcion: 'Pechuga de pollo con queso' }
  ];

  const reseñas = [
    { nombre: 'María González', fecha: '15 Nov 2024', rating: 5, comentario: '¡Excelente comida! El servicio es impecable y el ambiente muy acogedor.' },
    { nombre: 'Carlos Ramírez', fecha: '10 Nov 2024', rating: 4, comentario: 'Muy buena experiencia. La carne estaba deliciosa, volveremos pronto.' },
    { nombre: 'Ana López', fecha: '5 Nov 2024', rating: 5, comentario: 'El mejor restaurante de Pereira. Totalmente recomendado.' }
  ];

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Header con botón de volver */}
      <div className="bg-black/80 backdrop-blur-sm fixed top-16 w-full z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-300 hover:text-white transition"
          >
            <ChevronLeft className="h-6 w-6 mr-1" />
            <span className="font-medium">Volver</span>
          </button>
          <div className="flex gap-3">
            <button className="p-2 bg-gray-900 hover:bg-gray-800 rounded-full transition">
              <Share2 className="h-5 w-5 text-gray-300" />
            </button>
            <button
              onClick={() => toggleFavorite(local.id)}
              className="p-2 bg-gray-900 hover:bg-gray-800 rounded-full transition"
            >
              <Heart className={`h-5 w-5 ${favorites.includes(local.id) ? 'fill-orange-500 text-orange-500' : 'text-gray-300'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Galería de Imágenes */}
      <div className="relative mt-16">
        <div className="relative h-96 overflow-hidden">
          <img
            src={gallery[selectedImage]}
            alt={local.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Miniaturas */}
        <div className="absolute bottom-4 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-orange-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información Básica */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{local.name}</h1>
                  <p className="text-orange-500 text-lg font-medium">{local.category}</p>
                </div>
                <div className="flex items-center bg-gray-900 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-white font-bold text-lg">{local.rating}</span>
                  <span className="text-gray-400 ml-1">(127)</span>
                </div>
              </div>
              <p className="text-gray-300 text-lg">{local.description}</p>
            </div>

            {/* Información de Contacto */}
            <div className="bg-gray-900 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Información de Contacto</h2>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Dirección</p>
                  <p className="text-gray-400">{local.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Teléfono</p>
                  <p className="text-gray-400">+57 312 456 7890</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Sitio Web</p>
                  <a href="#" className="text-orange-500 hover:text-orange-600">www.lafogata.com</a>
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="pt-4 border-t border-gray-800">
                <p className="text-white font-medium mb-3">Síguenos</p>
                <div className="flex gap-3">
                  <a
                    href={redesSociales.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition"
                  >
                    <Facebook className="h-5 w-5 text-white" />
                  </a>
                  <a
                    href={redesSociales.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full transition"
                  >
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                  <a
                    href={redesSociales.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full transition"
                  >
                    <MessageSquare className="h-5 w-5 text-white" />
                  </a>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Cómo llegar
                </button>
                <button className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5" />
                  Llamar
                </button>
              </div>
            </div>

            {/* Horarios */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Clock className="h-6 w-6 text-orange-500 mr-2" />
                Horarios de Atención
              </h2>
              <div className="space-y-3">
                {horarios.map((horario, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="text-gray-300 font-medium">{horario.dia}</span>
                    <span className="text-white">{horario.horas}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
                <p className="text-green-500 text-sm font-medium">🟢 Abierto ahora</p>
              </div>
            </div>

            {/* Menú */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Menú Destacado</h2>
              <div className="space-y-4">
                {menu.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start py-3 border-b border-gray-800 last:border-0">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.nombre}</h3>
                      <p className="text-gray-400 text-sm">{item.descripcion}</p>
                    </div>
                    <span className="text-orange-500 font-bold ml-4">{item.precio}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reseñas */}
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Reseñas</h2>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Escribir reseña
                </button>
              </div>

              <div className="space-y-6">
                {reseñas.map((reseña, idx) => (
                  <div key={idx} className="pb-6 border-b border-gray-800 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{reseña.nombre}</h4>
                        <p className="text-gray-500 text-sm">{reseña.fecha}</p>
                      </div>
                      <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-white text-sm font-medium">{reseña.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-300">{reseña.comentario}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Lateral - Mapa */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-gray-900 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Ubicación</h3>
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
                  {/* Aquí irá el mapa de Google Maps después */}
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <MapPin className="h-12 w-12" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">{local.address}</p>
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition">
                  Ver en Google Maps
                </button>
              </div>

              {/* Lugares Similares */}
              <div className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Lugares Similares</h3>
                <div className="space-y-4">
                  {locales.filter(l => l.id !== local.id && l.category === local.category).slice(0, 3).map((similar) => (
                    <Link 
                      key={similar.id}
                      to={`/local/${similar.id}`}
                      className="flex gap-3 hover:bg-gray-800 p-2 rounded-lg transition"
                    >
                      <img
                        src={similar.images && similar.images[0] ? similar.images[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                        alt={similar.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-medium line-clamp-1">{similar.name}</h4>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-gray-400 text-sm">{similar.rating}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{similar.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}