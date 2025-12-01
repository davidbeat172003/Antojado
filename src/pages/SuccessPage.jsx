import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Home, Store, Mail } from 'lucide-react';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, price } = location.state || {};

  if (!plan) {
    navigate('/planes');
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center pt-16 px-4">
      <div className="max-w-2xl w-full">
        {/* Animación de éxito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/10 rounded-full mb-6 animate-pulse">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-xl text-gray-400">
            Tu suscripción al plan <span className="text-orange-500 font-bold">{plan}</span> ha sido activada
          </p>
        </div>

        {/* Detalles del pago */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Plan adquirido</span>
              <span className="text-white font-bold text-lg">{plan}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Monto pagado</span>
              <span className="text-white font-bold text-lg">
                ${price?.toLocaleString('es-CO')} COP
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Período</span>
              <span className="text-white">Mensual</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fecha de renovación</span>
              <span className="text-white">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Próximos Pasos</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/10 p-3 rounded-full flex-shrink-0">
                <Mail className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">1. Revisa tu correo</h3>
                <p className="text-gray-400 text-sm">
                  Te hemos enviado un email de confirmación con todos los detalles de tu suscripción.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-500/10 p-3 rounded-full flex-shrink-0">
                <Store className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">2. Actualiza tu perfil</h3>
                <p className="text-gray-400 text-sm">
                  Aprovecha todas las funciones de tu nuevo plan en el dashboard de tu negocio.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-500/10 p-3 rounded-full flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">3. Comienza a destacar</h3>
                <p className="text-gray-400 text-sm">
                  Tu negocio ya tiene acceso a todas las funcionalidades premium.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            to="/dashboard-negocio"
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            <Store className="h-5 w-5" />
            Ir a Mi Dashboard
          </Link>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-gray-800 text-white py-4 rounded-lg font-bold hover:bg-gray-700 transition"
          >
            <Home className="h-5 w-5" />
            Volver al Inicio
          </Link>
        </div>

        {/* Soporte */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            ¿Tienes alguna pregunta? Contáctanos a{' '}
            <a href="mailto:soporte@antojado.com" className="text-orange-500 hover:text-orange-600">
              soporte@antojado.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}