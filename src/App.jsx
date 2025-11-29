import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, User, Menu, X, Utensils, Coffee, Pizza, IceCream, LogOut, Store } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useFavorites } from './hooks/useFavorites';
import { collection, getDocs, query, where, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import RestaurantDetail from './pages/RestaurantDetail';
import BusinessDashboard from './pages/BusinessDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AddTestData from './utils/AddTestData';

// Componente NavBar
function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const { currentUser, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserType = async () => {
      if (currentUser) {
        try {
          const userDoc = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            setUserType(docSnap.data().userType);
          }
        } catch (error) {
          console.error('Error al cargar tipo de usuario:', error);
        }
      } else {
        setUserType(null);
      }
    };
    loadUserType();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-black shadow-md fixed w-full top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center cursor-pointer">
            <Utensils className="h-8 w-8 text-orange-500" />
            <span className="ml-2 text-2xl font-bold text-white">Antojado</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-orange-500 font-medium transition">
              Inicio
            </Link>
            <Link to="/favoritos" className="text-gray-300 hover:text-orange-500 font-medium flex items-center transition relative">
              <Heart className="h-5 w-5 mr-1" />
              Favoritos
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {currentUser && userType === 'negocio' && (
              <Link to="/dashboard-negocio" className="text-gray-300 hover:text-orange-500 font-medium flex items-center transition">
                <Store className="h-5 w-5 mr-1" />
                Mi Negocio
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-gray-300">
                  <User className="h-5 w-5 inline mr-1" />
                  <span className="text-sm">{currentUser.displayName || currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-orange-500 font-medium transition flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Salir
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-orange-500 font-medium transition">
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro"
                  className="bg-orange-500 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-4 py-3 space-y-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block w-full text-left text-gray-300 hover:text-orange-500 font-medium">
              Inicio
            </Link>
            <Link to="/favoritos" onClick={() => setMenuOpen(false)} className="block w-full text-left text-gray-300 hover:text-orange-500 font-medium">
              Favoritos {favorites.length > 0 && `(${favorites.length})`}
            </Link>
            
            {currentUser ? (
              <>
                <div className="text-gray-300 py-2">
                  <User className="h-5 w-5 inline mr-1" />
                  {currentUser.displayName || currentUser.email}
                </div>
                <Link
                  to="/dashboard-negocio"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-left text-gray-300 hover:text-orange-500 font-medium"
                >
                  <Store className="h-5 w-5 inline mr-1" />
                  Mi Negocio
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="block w-full text-left text-gray-300 hover:text-orange-500 font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-left text-gray-300 hover:text-orange-500 font-medium">
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full bg-orange-500 text-center text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// Componente HomePage - COMPLETO
function HomePage({ locales, loading }) {
  const { favorites, toggleFavorite } = useFavorites();
  
  // Estados para el buscador
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [minRating, setMinRating] = useState(0);
  
  const mejorCalificadosRef = useRef(null);
  const restaurantesRef = useRef(null);
  const cafeteriasRef = useRef(null);
  const pizzeriasRef = useRef(null);
  const postresRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filtrar locales según búsqueda
  const filteredLocales = locales.filter(local => {
    const matchesSearch = local.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (local.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || local.category === selectedCategory;
    const matchesRating = (local.rating || 0) >= minRating;
    
    return matchesSearch && matchesCategory && matchesRating;
  });

  const categories = ['Todos', ...new Set(locales.map(l => l.category))];

  const HorizontalCarousel = ({ title, items, scrollRef }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        
        <div className="relative group">
          <button
            onClick={() => scroll(scrollRef, 'left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth'
            }}
          >
            {items.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-56 group/card snap-start">
                <Link to={`/local/${item.id}`} className="block">
                  <div className="relative overflow-hidden rounded-lg transform transition-transform duration-300 group-hover/card:scale-105">
                    <img
                      src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(item.id);
                      }}
                      className="absolute top-2 right-2 bg-black/60 p-2 rounded-full shadow-md hover:bg-black/80 transition opacity-0 group-hover/card:opacity-100"
                    >
                      <Heart className={`h-5 w-5 ${favorites.includes(item.id) ? 'fill-orange-500 text-orange-500' : 'text-white'}`} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-medium text-sm">{item.rating || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h3 className="font-bold text-white text-lg group-hover/card:text-orange-500 transition line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{item.category}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(scrollRef, 'right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pt-16 bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando locales...</p>
        </div>
      </div>
    );
  }

  if (locales.length === 0) {
    return (
      <div className="pt-16 bg-black min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-8xl mb-4">🍽️</div>
          <h2 className="text-3xl font-bold text-white mb-4">No hay locales disponibles</h2>
          <p className="text-gray-400 mb-4">Agrega algunos restaurantes para comenzar.</p>
          <Link 
            to="/agregar-datos"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition"
          >
            Agregar Datos de Prueba
          </Link>
        </div>
      </div>
    );
  }

  const mejorCalificados = [...filteredLocales].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const featured = mejorCalificados[0];

  return (
    <div className="pt-16 bg-black min-h-screen">
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

      {/* Sección Hero con Featured */}
      {featured && (
        <div className="relative h-[80vh] mb-8">
          <div className="absolute inset-0">
            <img
              src={featured.images && featured.images[0] ? featured.images[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920'}
              alt={featured.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          </div>

          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <span className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Destacado
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  {featured.name}
                </h1>
                <p className="text-xl text-gray-200 mb-6">
                  {featured.description}
                </p>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center">
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 mr-2" />
                    <span className="text-white font-bold text-xl">{featured.rating || '0.0'}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300">{featured.category}</span>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    to={`/local/${featured.id}`}
                    className="bg-white text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition"
                  >
                    Ver Detalles
                  </Link>
                  
                  <button
                    onClick={() => toggleFavorite(featured.id)}
                    className="bg-gray-800/80 hover:bg-gray-700 text-white p-3 rounded-lg transition"
                  >
                    <Heart className={`h-6 w-6 ${favorites.includes(featured.id) ? 'fill-orange-500 text-orange-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buscador y Contenido */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          
          {/* Panel de Búsqueda y Filtros - LADO IZQUIERDO */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-gray-900 rounded-xl p-6 lg:sticky lg:top-20 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Buscar Locales</h2>
              
              {/* Búsqueda por nombre */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre o descripción
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: Pizza, Café..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Filtro por categoría */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por calificación */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Calificación mínima: {minRating}⭐
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5</span>
                </div>
              </div>

              {/* Resultados */}
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  {filteredLocales.length} {filteredLocales.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>

              {/* Botón para limpiar filtros */}
              {(searchTerm || selectedCategory !== 'Todos' || minRating > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Todos');
                    setMinRating(0);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Contenido Principal - LADO DERECHO */}
          <div className="flex-1 overflow-hidden">
            <HorizontalCarousel 
              title="Mejor Calificados ⭐" 
              items={filteredLocales.sort((a, b) => (b.rating || 0) - (a.rating || 0))} 
              scrollRef={mejorCalificadosRef} 
            />
            <HorizontalCarousel 
              title="Restaurantes 🍽️" 
              items={filteredLocales.filter(l => l.category === 'Restaurante')} 
              scrollRef={restaurantesRef} 
            />
            <HorizontalCarousel 
              title="Cafeterías ☕" 
              items={filteredLocales.filter(l => l.category === 'Cafetería')} 
              scrollRef={cafeteriasRef} 
            />
            <HorizontalCarousel 
              title="Pizzerías 🍕" 
              items={filteredLocales.filter(l => l.category === 'Pizzería')} 
              scrollRef={pizzeriasRef} 
            />
            <HorizontalCarousel 
              title="Postres 🍰" 
              items={filteredLocales.filter(l => l.category === 'Postres')} 
              scrollRef={postresRef} 
            />
          </div>
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  );
}

// Página de Favoritos
function FavoritesPage({ locales }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { favorites, toggleFavorite, loading } = useFavorites();
  const favoriteLocales = locales.filter(l => favorites.includes(l.id));

  if (!currentUser) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-24 w-24 text-gray-700 mx-auto mb-4" />
          <p className="text-xl text-gray-400 mb-6">Inicia sesión para ver tus favoritos</p>
          <Link to="/login" className="bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando favoritos...</div>
      </div>
    );
  }
  
  return (
    <div className="pt-24 pb-16 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Mis Favoritos</h1>
        {favoriteLocales.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-700 mx-auto mb-4" />
            <p className="text-xl text-gray-400">Aún no tienes favoritos</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition"
            >
              Explorar Locales
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteLocales.map((local) => (
            <Link key={local.id} to={`/local/${local.id}`}>
              <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden hover:transform hover:scale-105 transition cursor-pointer">
                <div className="relative">
                  <img 
                    src={local.images && local.images[0] ? local.images[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'} 
                    alt={local.name} 
                    className="w-full h-48 object-cover" 
                  />
                  <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(local.id);
                      }}
                      className="absolute top-3 right-3 bg-black/60 p-2 rounded-full shadow-md hover:bg-black/80 z-10"
                    >
                    <Heart className="h-5 w-5 fill-orange-500 text-orange-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-white mb-1 hover:text-orange-500 transition">{local.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{local.category}</p>
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium text-white">{local.rating || '0.0'}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-400">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{local.address}</span>
                  </div>
                </div>
              </div>
            </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Página de Login
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos');
      } else if (error.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido');
      } else {
        setError('Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <Utensils className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Iniciar Sesión</h2>
          <p className="text-gray-400 mt-2">Bienvenido de nuevo a Antojado</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-400">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-orange-500 font-medium hover:text-orange-600">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

// Página de Registro
function RegisterPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState('Restaurante');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const categoryOptions = ['Restaurante', 'Cafetería', 'Pizzería', 'Postres', 'Comida Rápida', 'Bar', 'Panadería'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (userType === 'cliente' && !clientName) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (userType === 'negocio' && (!businessName || !ownerName || !phone || !address)) {
      setError('Por favor completa todos los campos del negocio');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const displayName = userType === 'cliente' ? clientName : businessName;
      const userCredential = await signup(email, password, displayName);
      
      const userData = {
        uid: userCredential.user.uid,
        email: email,
        userType: userType,
        createdAt: new Date().toISOString()
      };

      if (userType === 'cliente') {
        userData.name = clientName;
      } else {
        userData.businessName = businessName;
        userData.ownerName = ownerName;
        userData.category = category;
        userData.phone = phone;
        userData.address = address;
        userData.description = description;
        userData.approved = false;
      }

      const userDoc = doc(db, 'users', userData.uid);
      await setDoc(userDoc, userData);

      if (userType === 'negocio') {
        const localDoc = doc(db, 'locales', userData.uid);
        await setDoc(localDoc, {
          ownerId: userData.uid,
          name: userData.businessName,
          category: userData.category,
          phone: userData.phone,
          address: userData.address,
          description: userData.description,
          rating: 0,
          reviewCount: 0,
          images: [],
          menu: [],
          hours: {},
          approved: false,
          createdAt: new Date().toISOString()
        });
      }
      
      if (userType === 'cliente') {
        navigate('/');
      } else {
        navigate('/dashboard-negocio');
      }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          setError('Correo o contraseña incorrectos');
        } else if (error.code === 'auth/wrong-password') {
          setError('Contraseña incorrecta');
        } else if (error.code === 'auth/invalid-email') {
          setError('Correo electrónico inválido');
        } else {
          setError('Error al iniciar sesión. Intenta nuevamente.');
        }
      }
  };

  if (step === 1) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-800">
          <div className="text-center mb-8">
            <Utensils className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white">Únete a Antojado</h2>
            <p className="text-gray-400 mt-2">¿Qué tipo de cuenta deseas crear?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setUserType('cliente');
                setStep(2);
              }}
              className="group relative bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-orange-500 rounded-xl p-8 transition text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-500/10 p-4 rounded-full mb-4 group-hover:bg-orange-500/20 transition">
                  <User className="h-12 w-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Soy Cliente</h3>
                <p className="text-gray-400 text-sm">
                  Descubre locales, guarda favoritos y deja reseñas
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setUserType('negocio');
                setStep(2);
              }}
              className="group relative bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-orange-500 rounded-xl p-8 transition text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-500/10 p-4 rounded-full mb-4 group-hover:bg-orange-500/20 transition">
                  <Store className="h-12 w-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tengo un Negocio</h3>
                <p className="text-gray-400 text-sm">
                  Promociona tu local y atrae más clientes
                </p>
              </div>
            </button>
          </div>

          <p className="text-center mt-6 text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-orange-500 font-medium hover:text-orange-600">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-800">
        <button
          onClick={() => setStep(1)}
          className="text-gray-400 hover:text-white mb-6 flex items-center"
        >
          ← Volver
        </button>

        <div className="text-center mb-8">
          {userType === 'cliente' ? (
            <User className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          ) : (
            <Store className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          )}
          <h2 className="text-3xl font-bold text-white">
            {userType === 'cliente' ? 'Crear Cuenta de Cliente' : 'Registrar mi Negocio'}
          </h2>
          <p className="text-gray-400 mt-2">
            {userType === 'cliente' 
              ? 'Completa tus datos personales' 
              : 'Completa la información de tu negocio'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo electrónico *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          {userType === 'cliente' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre completo *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Juan Pérez"
                disabled={loading}
              />
            </div>
          )}

          {userType === 'negocio' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Negocio *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="La Fogata Grill"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Propietario *</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="María González"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoría *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={loading}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+57 312 456 7890"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dirección *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Calle 15 #23-45, Pereira"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe tu negocio y lo que lo hace especial..."
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-orange-500 font-medium hover:text-orange-600">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
// App Principal
export default function App() {
  const [locales, setLocales] = useState([]);
  const [loadingLocales, setLoadingLocales] = useState(true);

  useEffect(() => {
  const localesRef = collection(db, 'locales');
  
  // Escuchar cambios en tiempo real
  const unsubscribe = onSnapshot(localesRef, (querySnapshot) => {
    const localesData = [];
    querySnapshot.forEach((doc) => {
      localesData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Locales cargados:', localesData);
    setLocales(localesData);
    setLoadingLocales(false);
  }, (error) => {
    console.error('Error al cargar locales:', error);
    setLoadingLocales(false);
  });

return () => unsubscribe();
}, []);


return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage locales={locales} loading={loadingLocales} />} />
        <Route path="/favoritos" element={<FavoritesPage locales={locales} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/local/:id" element={<RestaurantDetail locales={locales} />} />
        <Route path="/agregar-datos" element={<AddTestData />} />

        <Route 
          path="/dashboard-negocio" 
          element={
            <ProtectedRoute requireBusiness={true}>
              <BusinessDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );

}


// Componentes LoginPage y RegisterPage
// Usa los que ya tienes en tu código actual