import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, X, Star, TrendingUp, Zap, Crown, 
  Users, Image, BarChart, Award 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function PricingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadCurrentPlan();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadCurrentPlan = async () => {
    try {
      const userDoc = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentPlan(data.subscriptionPlan || 'free');
      }
    } catch (error) {
      console.error('Error al cargar plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      period: 'Siempre',
      icon: Users,
      color: 'gray',
      description: 'Perfecto para empezar',
      features: [
        { text: 'Perfil básico del negocio', included: true },
        { text: 'Hasta 3 imágenes', included: true },
        { text: 'Horarios de atención', included: true },
        { text: 'Menú con hasta 5 platillos', included: true },
        { text: 'Estadísticas básicas', included: true },
        { text: 'Aparece en búsquedas', included: true },
        { text: 'Galería completa de imágenes', included: false },
        { text: 'Menú ilimitado', included: false },
        { text: 'Posición destacada', included: false },
        { text: 'Estadísticas avanzadas', included: false },
        { text: 'Soporte prioritario', included: false },
      ],
      buttonText: 'Plan Actual',
      buttonColor: 'bg-gray-600',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 15000,
      period: 'mes',
      icon: Star,
      color: 'orange',
      popular: true,
      description: 'Para negocios en crecimiento',
      features: [
        { text: 'Todo del plan Gratuito', included: true },
        { text: 'Galería ilimitada de imágenes', included: true },
        { text: 'Menú ilimitado', included: true },
        { text: 'Estadísticas avanzadas', included: true },
        { text: 'Responder a reseñas', included: true },
        { text: 'Personalizar perfil', included: true },
        { text: 'Promociones y ofertas', included: true },
        { text: 'Soporte por email', included: true },
        { text: 'Posición destacada', included: false },
        { text: 'Badge de verificado', included: false },
        { text: 'Soporte prioritario 24/7', included: false },
      ],
      buttonText: 'Elegir Premium',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'destacado',
      name: 'Destacado',
      price: 30000,
      period: 'mes',
      icon: Crown,
      color: 'purple',
      description: 'Máxima visibilidad',
      features: [
        { text: 'Todo del plan Premium', included: true },
        { text: 'Aparece en sección destacada', included: true },
        { text: 'Badge de verificado', included: true },
        { text: 'Prioridad en resultados de búsqueda', included: true },
        { text: 'Soporte prioritario 24/7', included: true },
        { text: 'Análisis detallado de competencia', included: true },
        { text: 'Campañas promocionales', included: true },
        { text: 'Asesoría de marketing digital', included: true },
        { text: 'Reportes semanales', included: true },
        { text: 'Logo en página principal', included: true },
      ],
      buttonText: 'Elegir Destacado',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const handleSelectPlan = (planId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      alert('Ya estás en el plan gratuito');
      return;
    }

    // Redirigir a la página de checkout
    navigate(`/checkout/${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-16">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Elige el Plan Perfecto para tu Negocio
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Aumenta la visibilidad de tu restaurante y atrae más clientes con nuestros planes
          </p>
        </div>

        {/* Planes */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-gray-900 rounded-2xl border-2 overflow-hidden transition-transform hover:scale-105 ${
                  plan.popular
                    ? 'border-orange-500'
                    : isCurrentPlan
                    ? 'border-green-500'
                    : 'border-gray-800'
                }`}
              >
                {/* Badge Popular */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-lg text-sm font-bold">
                    Más Popular
                  </div>
                )}

                {/* Badge Plan Actual */}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-lg text-sm font-bold">
                    Plan Actual
                  </div>
                )}

                <div className="p-8">
                  {/* Icono y Nombre */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.color === 'orange' ? 'bg-orange-500/10' :
                      plan.color === 'purple' ? 'bg-purple-500/10' :
                      'bg-gray-500/10'
                    }`}>
                      <Icon className={`h-8 w-8 ${
                        plan.color === 'orange' ? 'text-orange-500' :
                        plan.color === 'purple' ? 'text-purple-500' :
                        'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">
                        ${plan.price.toLocaleString('es-CO')}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-400">/ {plan.period}</span>
                      )}
                    </div>
                    {plan.price === 0 && (
                      <p className="text-gray-400 text-sm mt-1">{plan.period}</p>
                    )}
                  </div>

                  {/* Características */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Botón */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-4 rounded-lg font-bold text-white transition ${
                      isCurrentPlan
                        ? 'bg-gray-700 cursor-not-allowed'
                        : plan.buttonColor
                    }`}
                  >
                    {isCurrentPlan ? '✓ Plan Actual' : plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Beneficios Adicionales */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Todos los Planes Incluyen
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-white font-bold mb-2">Estadísticas</h3>
              <p className="text-gray-400 text-sm">
                Monitorea visitas y favoritos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-white font-bold mb-2">Sin Comisiones</h3>
              <p className="text-gray-400 text-sm">
                No cobramos por reservas
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-white font-bold mb-2">Más Clientes</h3>
              <p className="text-gray-400 text-sm">
                Aumenta tu visibilidad
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-white font-bold mb-2">Fácil de Usar</h3>
              <p className="text-gray-400 text-sm">
                Dashboard intuitivo
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-4">
            <details className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <summary className="text-white font-bold cursor-pointer">
                ¿Puedo cambiar de plan en cualquier momento?
              </summary>
              <p className="text-gray-400 mt-4">
                Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplicarán inmediatamente.
              </p>
            </details>

            <details className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <summary className="text-white font-bold cursor-pointer">
                ¿Qué métodos de pago aceptan?
              </summary>
              <p className="text-gray-400 mt-4">
                Aceptamos tarjetas de crédito, débito, PSE y pagos en efectivo a través de Mercado Pago.
              </p>
            </details>

            <details className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <summary className="text-white font-bold cursor-pointer">
                ¿Hay contratos o permanencia mínima?
              </summary>
              <p className="text-gray-400 mt-4">
                No, no hay contratos. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones.
              </p>
            </details>

            <details className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <summary className="text-white font-bold cursor-pointer">
                ¿Ofrecen periodo de prueba?
              </summary>
              <p className="text-gray-400 mt-4">
                El plan gratuito te permite probar la plataforma. Para planes Premium puedes solicitar un demo gratuito de 7 días.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}