import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, Lock, ArrowLeft, Check, AlertCircle,
  ShieldCheck, Calendar, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function CheckoutPage() {
  const { planId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  
  // Datos de tarjeta (para demo/sandbox)
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const plans = {
    premium: {
      name: 'Premium',
      price: 15000,
      features: [
        'Galería ilimitada de imágenes',
        'Menú ilimitado',
        'Estadísticas avanzadas',
        'Responder a reseñas',
        'Soporte por email'
      ]
    },
    destacado: {
      name: 'Destacado',
      price: 30000,
      features: [
        'Todo del plan Premium',
        'Aparece en sección destacada',
        'Badge de verificado',
        'Prioridad en búsqueda',
        'Soporte prioritario 24/7'
      ]
    }
  };

  const selectedPlan = plans[planId];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadBusinessData();
  }, [currentUser]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const userDoc = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        setBusinessData(docSnap.data());
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar pago (SIMULACIÓN para sandbox)
  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      alert('Plan no válido');
      return;
    }

    // Validación básica de tarjeta
    if (paymentMethod === 'credit_card') {
      if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
        alert('Por favor completa todos los datos de la tarjeta');
        return;
      }
      
      if (cardData.number.length < 15) {
        alert('Número de tarjeta inválido');
        return;
      }
    }

    setProcessing(true);

    try {
      // SIMULACIÓN de pago exitoso (en producción aquí iría Mercado Pago)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Actualizar suscripción en Firestore
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, {
        subscriptionPlan: planId,
        subscriptionDate: new Date().toISOString(),
        subscriptionStatus: 'active',
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 días
      });

      // También actualizar el local si existe
      const localDoc = doc(db, 'locales', currentUser.uid);
      const localSnap = await getDoc(localDoc);
      
      if (localSnap.exists()) {
        await updateDoc(localDoc, {
          subscriptionPlan: planId,
          featured: planId === 'destacado' // Marcar como destacado si es el plan destacado
        });
      }

      // Redirigir a página de éxito
      navigate('/checkout/success', { 
        state: { 
          plan: selectedPlan.name, 
          price: selectedPlan.price 
        } 
      });

    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Formatear fecha de expiración
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <div className="text-center">
          <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Plan no encontrado</h2>
          <Link to="/planes" className="text-orange-500 hover:text-orange-600">
            Ver todos los planes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/planes"
            className="flex items-center text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a planes
          </Link>
          <h1 className="text-4xl font-bold text-white">Finalizar Compra</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Izquierda - Formulario de Pago */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Negocio */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Información de Facturación</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Negocio
                  </label>
                  <input
                    type="text"
                    value={businessData?.businessName || businessData?.name || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={businessData?.phone || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Método de Pago</h2>
              
              {/* Selector de método */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-4 rounded-lg border-2 transition ${
                    paymentMethod === 'credit_card'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <CreditCard className="h-6 w-6 text-white mb-2" />
                  <p className="text-white font-medium">Tarjeta de Crédito/Débito</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('pse')}
                  className={`p-4 rounded-lg border-2 transition ${
                    paymentMethod === 'pse'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <ShieldCheck className="h-6 w-6 text-white mb-2" />
                  <p className="text-white font-medium">PSE</p>
                </button>
              </div>

              {/* Formulario de Tarjeta */}
              {paymentMethod === 'credit_card' && (
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número de Tarjeta
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.number}
                        onChange={(e) => setCardData({
                          ...cardData,
                          number: formatCardNumber(e.target.value)
                        })}
                        maxLength="19"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white pl-12"
                      />
                      <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Para pruebas usa: 4111 1111 1111 1111
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre en la Tarjeta
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="JUAN PEREZ"
                        value={cardData.name}
                        onChange={(e) => setCardData({
                          ...cardData,
                          name: e.target.value.toUpperCase()
                        })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white pl-12"
                      />
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha de Expiración
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({
                            ...cardData,
                            expiry: formatExpiry(e.target.value)
                          })}
                          maxLength="5"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white pl-12"
                        />
                        <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({
                            ...cardData,
                            cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                          })}
                          maxLength="4"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white pl-12"
                        />
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Pagar ${selectedPlan.price.toLocaleString('es-CO')}
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* PSE (placeholder) */}
              {paymentMethod === 'pse' && (
                <div className="text-center py-8">
                  <ShieldCheck className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    Serás redirigido a tu banco para completar el pago
                  </p>
                  <button
                    onClick={() => alert('Funcionalidad PSE próximamente')}
                    className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
                  >
                    Continuar con PSE
                  </button>
                </div>
              )}

              {/* Seguridad */}
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                <Lock className="h-4 w-4" />
                <span>Pago seguro y encriptado</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Resumen de Compra</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white font-bold">{selectedPlan.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Período</span>
                  <span className="text-white">1 mes</span>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-xl">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-orange-500 font-bold">
                      ${selectedPlan.price.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">COP / mes</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-white font-bold mb-3">Incluye:</h3>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-gray-500 text-xs space-y-2">
                <p>✓ Cancela cuando quieras</p>
                <p>✓ Sin contratos ni permanencia</p>
                <p>✓ Cambios de plan flexibles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}