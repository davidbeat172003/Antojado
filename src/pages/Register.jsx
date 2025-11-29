import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils } from 'lucide-react';

export default function RegisterPage() {
  const [registerType, setRegisterType] = useState(null); // 'persona' o 'empresa'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Campos específicos para empresa
  const [enterpriseName, setEnterpriseName] = useState('');
  const [enterpriseCategory, setEnterpriseCategory] = useState('Restaurante');
  const [enterpriseAddress, setEnterpriseAddress] = useState('');
  const [enterprisePhone, setEnterprisePhone] = useState('');
  const [enterpriseDescription, setEnterpriseDescription] = useState('');
  const [enterpriseImage, setEnterpriseImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = ['Restaurante', 'Cafetería', 'Pizzería', 'Postres'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEnterpriseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (registerType === 'empresa') {
      if (!enterpriseName || !enterpriseCategory || !enterpriseAddress || !enterprisePhone) {
        setError('Por favor completa todos los datos de la empresa');
        return;
      }
    } else if (registerType === 'persona') {
      if (!name) {
        setError('Por favor ingresa tu nombre');
        return;
      }
    }

    try {
      setError('');
      setLoading(true);
      
      const displayName = registerType === 'empresa' ? enterpriseName : name;
      await signup(email, password, displayName, registerType, {
        name: enterpriseName,
        category: registerType === 'empresa' ? enterpriseCategory : null,
        address: registerType === 'empresa' ? enterpriseAddress : null,
        phone: registerType === 'empresa' ? enterprisePhone : null,
        description: registerType === 'empresa' ? enterpriseDescription : null,
        imageFile: registerType === 'empresa' ? enterpriseImage : null
      });
      navigate('/');
    } catch (error) {
      console.error('Error al registrarse:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado');
      } else if (error.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es muy débil');
      } else {
        setError('Error al crear la cuenta. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!registerType) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-800">
          <div className="text-center mb-12">
            <Utensils className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white">¿Cómo te deseas registrar?</h2>
            <p className="text-gray-400 mt-2">Elige el tipo de cuenta que necesitas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Opción Persona Natural */}
            <button
              onClick={() => setRegisterType('persona')}
              className="group relative bg-gradient-to-br from-blue-600/10 to-blue-600/5 hover:from-blue-600/20 hover:to-blue-600/10 border-2 border-blue-600/50 hover:border-blue-500 rounded-xl p-8 transition transform hover:scale-105"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Persona Natural</h3>
                <p className="text-gray-400 text-sm">Busca y descubre restaurantes, guarda favoritos y comparte recomendaciones</p>
              </div>
            </button>

            {/* Opción Empresa */}
            <button
              onClick={() => setRegisterType('empresa')}
              className="group relative bg-gradient-to-br from-orange-600/10 to-orange-600/5 hover:from-orange-600/20 hover:to-orange-600/10 border-2 border-orange-600/50 hover:border-orange-500 rounded-xl p-8 transition transform hover:scale-105"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Empresa</h3>
                <p className="text-gray-400 text-sm">Registra tu negocio, sube fotos, gestiona tu perfil y llega a más clientes</p>
              </div>
            </button>
          </div>

          <p className="text-center mt-8 text-gray-400">
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
      <div className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <Utensils className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">
            {registerType === 'empresa' ? 'Registrar Empresa' : 'Registrarse'}
          </h2>
          <p className="text-gray-400 mt-2">Crea tu cuenta en Antojado</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos Comunes */}
          {registerType === 'persona' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Juan Pérez"
                disabled={loading}
              />
            </div>
          )}

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
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          {/* Campos para Empresa */}
          {registerType === 'empresa' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de la empresa</label>
                <input
                  type="text"
                  value={enterpriseName}
                  onChange={(e) => setEnterpriseName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Mi Restaurante"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                <select
                  value={enterpriseCategory}
                  onChange={(e) => setEnterpriseCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={loading}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                <input
                  type="text"
                  value={enterpriseAddress}
                  onChange={(e) => setEnterpriseAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Calle 15 #23-45"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={enterprisePhone}
                  onChange={(e) => setEnterprisePhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+57 312 456 7890"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={enterpriseDescription}
                  onChange={(e) => setEnterpriseDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe tu negocio..."
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Foto del negocio</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading}
                  />
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
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
        </form>

        <button
          onClick={() => setRegisterType(null)}
          className="w-full mt-4 text-gray-400 hover:text-white transition text-sm"
        >
          Cambiar tipo de cuenta
        </button>

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
