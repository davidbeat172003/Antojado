import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Upload, Edit, Trash2, Plus, Save, X, AlertCircle,
  Image as ImageIcon, Clock, MapPin, Phone, Star,
  Users, Eye, Heart, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';

export default function BusinessDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [editing, setEditing] = useState(false);

  // Estados para edición
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    category: ''
  });

  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', description: '' });
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [hours, setHours] = useState({
    lunes: { open: '10:00', close: '22:00', closed: false },
    martes: { open: '10:00', close: '22:00', closed: false },
    miercoles: { open: '10:00', close: '22:00', closed: false },
    jueves: { open: '10:00', close: '22:00', closed: false },
    viernes: { open: '10:00', close: '22:00', closed: false },
    sabado: { open: '09:00', close: '23:00', closed: false },
    domingo: { open: '09:00', close: '23:00', closed: false }
  });

  // Límites por plan
const planLimits = {
  free: {
    name: 'Gratuito',
    maxImages: 3,
    maxMenuItems: 5,
    color: 'gray'
  },
  premium: {
    name: 'Premium',
    maxImages: 999,
    maxMenuItems: 999,
    color: 'orange'
  },
  destacado: {
    name: 'Destacado',
    maxImages: 999,
    maxMenuItems: 999,
    color: 'purple'
  }
};

const limits = planLimits[currentPlan];

  useEffect(() => {
    loadBusinessData();
  }, [currentUser]);

  const loadBusinessData = async () => {
    try {
      const localDoc = doc(db, 'locales', currentUser.uid);
      const docSnap = await getDoc(localDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusinessData(data);
        // Cargar plan del usuario
        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          setCurrentPlan(userSnap.data().subscriptionPlan || 'free');
        }
        setImages(data.images || []);
        setEditData({
          name: data.name || '',
          description: data.description || '',
          phone: data.phone || '',
          address: data.address || '',
          category: data.category || ''
        });
        setMenuItems(data.menu || []);
        if (data.hours) {
          setHours(data.hours);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      const localDoc = doc(db, 'locales', currentUser.uid);
      await updateDoc(localDoc, {
        name: editData.name,
        description: editData.description,
        phone: editData.phone,
        address: editData.address,
        category: editData.category
      });
      setBusinessData({ ...businessData, ...editData });
      setEditing(false);
      alert('Información actualizada correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los cambios');
    }
  };

  const handleAddMenuItem = async () => {
  if (!newMenuItem.name || !newMenuItem.price) {
    alert('Por favor completa el nombre y precio del platillo');
    return;
  }

  // Verificar límite de plan
  if (menuItems.length >= limits.maxMenuItems) {
    alert(`Has alcanzado el límite de ${limits.maxMenuItems} platillos del plan ${limits.name}. Actualiza tu plan para agregar más platillos.`);
    return;
  }

  try {
    const updatedMenu = [...menuItems, { ...newMenuItem, id: Date.now() }];
    const localDoc = doc(db, 'locales', currentUser.uid);
    await updateDoc(localDoc, { menu: updatedMenu });
    setMenuItems(updatedMenu);
    setNewMenuItem({ name: '', price: '', description: '' });
    alert('Platillo agregado');
  } catch (error) {
    console.error('Error al agregar platillo:', error);
    alert('Error al agregar platillo');
  }
};

  const handleDeleteMenuItem = async (itemId) => {
    if (!confirm('¿Eliminar este platillo?')) return;

    try {
      const updatedMenu = menuItems.filter(item => item.id !== itemId);
      const localDoc = doc(db, 'locales', currentUser.uid);
      await updateDoc(localDoc, { menu: updatedMenu });
      setMenuItems(updatedMenu);
      alert('Platillo eliminado');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar platillo');
    }
  };

  const handleSaveHours = async () => {
  try {
    const localDoc = doc(db, 'locales', currentUser.uid);
    await updateDoc(localDoc, { hours });
    alert('✅ Horarios actualizados correctamente');
  } catch (error) {
    console.error('Error al guardar horarios:', error);
    alert('Error al guardar horarios. Intenta nuevamente.');
  }
};

  const handleImageUpload = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  // Verificar límite de plan
  if (images.length >= limits.maxImages) {
    alert(`Has alcanzado el límite de ${limits.maxImages} imágenes del plan ${limits.name}. Actualiza tu plan para subir más imágenes.`);
    return;
  }

  const remainingSlots = limits.maxImages - images.length;
  if (files.length > remainingSlots) {
    alert(`Solo puedes subir ${remainingSlots} imagen(es) más en el plan ${limits.name}.`);
    return;
  }

  setUploadingImage(true);
  try {
    const uploadPromises = Array.from(files).map(async (file) => {
      const timestamp = Date.now();
      const fileName = `${currentUser.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, `business-images/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const updatedImages = [...images, ...uploadedUrls];
    
    const localDoc = doc(db, 'locales', currentUser.uid);
    await updateDoc(localDoc, { images: updatedImages });
    
    setImages(updatedImages);
    alert('Imágenes subidas correctamente');
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    alert('Error al subir imágenes');
  } finally {
    setUploadingImage(false);
  }
};

const handleDeleteImage = async (imageUrl) => {
  if (!confirm('¿Eliminar esta imagen?')) return;

  try {
    const updatedImages = images.filter(img => img !== imageUrl);
    const localDoc = doc(db, 'locales', currentUser.uid);
    await updateDoc(localDoc, { images: updatedImages });
    setImages(updatedImages);
    alert('Imagen eliminada');
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    alert('Error al eliminar imagen');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Store className="h-24 w-24 text-gray-700 mx-auto mb-4" />
          <p className="text-xl text-gray-400">No se encontraron datos del negocio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-full">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{businessData.name}</h1>
                <p className="text-gray-400">{businessData.category}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Ver como Cliente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner del Plan */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                currentPlan === 'destacado' ? 'bg-purple-500/20 text-purple-400' :
                currentPlan === 'premium' ? 'bg-orange-500/20 text-orange-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                Plan {limits.name}
              </div>
              <span className="text-gray-400 text-sm">
                {currentPlan === 'free' ? (
                  `${images.length}/${limits.maxImages} imágenes · ${menuItems.length}/${limits.maxMenuItems} platillos`
                ) : (
                  '✓ Sin límites'
                )}
              </span>
            </div>
            {currentPlan === 'free' && (
              <button
                onClick={() => navigate('/planes')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm font-medium"
              >
                Actualizar Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-gray-400 text-sm">Visitas</p>
            <p className="text-3xl font-bold text-white">1,234</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-gray-400 text-sm">Favoritos</p>
            <p className="text-3xl font-bold text-white">89</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-gray-400 text-sm">Calificación</p>
            <p className="text-3xl font-bold text-white">{businessData.rating || '0.0'}</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-gray-400 text-sm">Reseñas</p>
            <p className="text-3xl font-bold text-white">{businessData.reviewCount || '0'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="border-b border-gray-800">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Información General
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'menu'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Menú
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'hours'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Horarios
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'images'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Imágenes
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Tab: Información General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Información del Negocio</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveGeneral}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                      >
                        <Save className="h-4 w-4" />
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setEditData({
                            name: businessData.name,
                            description: businessData.description,
                            phone: businessData.phone,
                            address: businessData.address,
                            category: businessData.category
                          });
                        }}
                        className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del Negocio
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option>Restaurante</option>
                      <option>Cafetería</option>
                      <option>Pizzería</option>
                      <option>Postres</option>
                      <option>Comida Rápida</option>
                      <option>Bar</option>
                      <option>Panadería</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      disabled={!editing}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        disabled={!editing}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        disabled={!editing}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Menú */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Gestionar Menú</h2>
                  <div className="text-gray-400">
                    {menuItems.length} / {limits.maxMenuItems === 999 ? '∞' : limits.maxMenuItems}
                  </div>
                </div>

                {/* Agregar nuevo platillo */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Agregar Platillo</h3>

                  {/* Alerta de límite */}
                    {currentPlan === 'free' && menuItems.length >= limits.maxMenuItems - 1 && (
                      <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-orange-400 font-medium">
                            {menuItems.length === limits.maxMenuItems 
                              ? '¡Límite alcanzado!' 
                              : '¡Casi alcanzas el límite!'}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {menuItems.length === limits.maxMenuItems
                              ? `Has llegado al límite de ${limits.maxMenuItems} platillos del plan gratuito.`
                              : `Solo puedes agregar ${limits.maxMenuItems - menuItems.length} platillo(s) más.`
                            }
                            {' '}
                            <button
                              onClick={() => navigate('/planes')}
                              className="text-orange-400 underline hover:text-orange-300"
                            >
                              Actualizar plan
                            </button>
                          </p>
                        </div>
                      </div>
                    )}


                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Nombre del platillo"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                      className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Precio (ej: $25,000)"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                      className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Descripción"
                      value={newMenuItem.description}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                      className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <button
                    onClick={handleAddMenuItem}
                    className="mt-4 flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Platillo
                  </button>
                </div>

                {/* Lista de platillos */}
                <div className="space-y-4">
                  {menuItems.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No has agregado platillos aún</p>
                  ) : (
                    menuItems.map((item) => (
                      <div key={item.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{item.name}</h4>
                          <p className="text-gray-400 text-sm">{item.description}</p>
                          <p className="text-orange-500 font-bold mt-1">{item.price}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Horarios */}
            {activeTab === 'hours' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Horarios de Atención</h2>
                    <button
                      onClick={handleSaveHours}
                      className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
                    >
                      <Save className="h-5 w-5" />
                      Guardar Horarios
                    </button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(hours).map(([day, schedule]) => (
                      <div key={day} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          
                          {/* Nombre del día */}
                          <div className="w-32">
                            <p className="text-white font-bold capitalize text-lg">{day}</p>
                          </div>
                          
                          {/* Selectores de hora */}
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">Apertura</label>
                              <input
                                type="time"
                                value={schedule.open}
                                onChange={(e) => setHours({
                                  ...hours,
                                  [day]: { ...schedule, open: e.target.value }
                                })}
                                disabled={schedule.closed}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            
                            <span className="text-gray-400 mt-5">—</span>
                            
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">Cierre</label>
                              <input
                                type="time"
                                value={schedule.close}
                                onChange={(e) => setHours({
                                  ...hours,
                                  [day]: { ...schedule, close: e.target.value }
                                })}
                                disabled={schedule.closed}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          {/* Checkbox cerrado */}
                          <label className="flex items-center gap-2 cursor-pointer bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                            <input
                              type="checkbox"
                              checked={schedule.closed}
                              onChange={(e) => setHours({
                                ...hours,
                                [day]: { ...schedule, closed: e.target.checked }
                              })}
                              className="w-5 h-5 rounded accent-orange-500"
                            />
                            <span className="text-gray-300 text-sm font-medium">Cerrado</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mensaje informativo */}
                  <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      💡 <strong>Tip:</strong> Los horarios se mostrarán en la página de detalle de tu local para que los clientes sepan cuándo visitarte.
                    </p>
                  </div>
                </div>
              )}
        

            {/* Tab: Imágenes */}
{activeTab === 'images' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white">Galería de Imágenes</h2>
      <div className="text-gray-400">
        {images.length} / {limits.maxImages === 999 ? '∞' : limits.maxImages}
      </div>
    </div>

    <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center">
      <input
        type="file"
        id="imageUpload"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={uploadingImage}
      />
      <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-white font-medium mb-2">Subir Imágenes</h3>
      <p className="text-gray-400 text-sm mb-4">
        Haz clic para seleccionar imágenes (JPG, PNG)
      </p>
      <label
        htmlFor="imageUpload"
        className={`inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition cursor-pointer ${
          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {uploadingImage ? 'Subiendo...' : 'Seleccionar Imágenes'}
      </label>
    </div>

                  {/* Galería de imágenes */}
                  {images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Imágenes Actuales ({images.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`Imagen ${idx + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => handleDeleteImage(img)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}