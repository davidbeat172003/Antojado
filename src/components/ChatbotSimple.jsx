// components/ChatbotSimple.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChatbotSimple({ locales }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy el asistente de Antojado. Puedo ayudarte a encontrar:\n\n• Pizzerías 🍕\n• Cafeterías ☕\n• Restaurantes 🍽️\n• Los mejor calificados ⭐\n• Por ubicación 📍\n\n¿Qué te gustaría buscar?'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
  const handleScroll = () => {
        // Si el usuario ha hecho scroll más de 200px
        if (window.scrollY > 200) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      
      // Cleanup
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para procesar el mensaje del usuario
  const processUserMessage = (message) => {
    const msg = message.toLowerCase();
    
    // Buscar por categoría
    if (msg.includes('pizza')) {
      const pizzerias = locales.filter(l => l.category === 'Pizzería');
      if (pizzerias.length === 0) {
        return { type: 'text', content: '😕 Lo siento, aún no tenemos pizzerías registradas.' };
      }
      return { 
        type: 'locales', 
        content: `🍕 Encontré ${pizzerias.length} pizzería(s):`, 
        locales: pizzerias.slice(0, 3) 
      };
    }

    if (msg.includes('café') || msg.includes('cafeteria') || msg.includes('cafetería')) {
      const cafes = locales.filter(l => l.category === 'Cafetería');
      if (cafes.length === 0) {
        return { type: 'text', content: '😕 Lo siento, aún no tenemos cafeterías registradas.' };
      }
      return { 
        type: 'locales', 
        content: `☕ Encontré ${cafes.length} cafetería(s):`, 
        locales: cafes.slice(0, 3) 
      };
    }

    if (msg.includes('restaurante')) {
      const restaurantes = locales.filter(l => l.category === 'Restaurante');
      if (restaurantes.length === 0) {
        return { type: 'text', content: '😕 Lo siento, aún no tenemos restaurantes registrados.' };
      }
      return { 
        type: 'locales', 
        content: `🍽️ Encontré ${restaurantes.length} restaurante(s):`, 
        locales: restaurantes.slice(0, 3) 
      };
    }

    if (msg.includes('postre') || msg.includes('dulce')) {
      const postres = locales.filter(l => l.category === 'Postres');
      if (postres.length === 0) {
        return { type: 'text', content: '😕 Lo siento, aún no tenemos lugares de postres registrados.' };
      }
      return { 
        type: 'locales', 
        content: `🍰 Encontré ${postres.length} lugar(es) de postres:`, 
        locales: postres.slice(0, 3) 
      };
    }

    // Mejor calificados
    if (msg.includes('mejor') || msg.includes('top') || msg.includes('recomend') || msg.includes('bueno')) {
      const topRated = [...locales]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
      return { 
        type: 'locales', 
        content: '⭐ Los mejor calificados son:', 
        locales: topRated 
      };
    }

    // Destacados / Premium
    if (msg.includes('destacado') || msg.includes('premium') || msg.includes('destacad')) {
      const featured = locales.filter(l => l.subscriptionPlan === 'destacado' || l.featured);
      if (featured.length === 0) {
        return { type: 'text', content: '😕 Aún no hay locales destacados.' };
      }
      return { 
        type: 'locales', 
        content: '✨ Locales destacados:', 
        locales: featured.slice(0, 3) 
      };
    }

    // Económico / Barato
    if (msg.includes('económico') || msg.includes('barato') || msg.includes('economico')) {
      const affordable = locales.filter(l => (l.rating || 0) >= 3.5);
      return { 
        type: 'locales', 
        content: '💰 Opciones económicas con buena calificación:', 
        locales: affordable.slice(0, 3) 
      };
    }

    // Búsqueda por nombre
    const searchResults = locales.filter(l => 
      l.name.toLowerCase().includes(msg) || 
      (l.description || '').toLowerCase().includes(msg)
    );
    
    if (searchResults.length > 0) {
      return { 
        type: 'locales', 
        content: `🔍 Encontré esto relacionado con "${message}":`, 
        locales: searchResults.slice(0, 3) 
      };
    }

    // Saludos
    if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
      return { 
        type: 'text', 
        content: '¡Hola! 👋 ¿Qué tipo de comida te gustaría buscar hoy? Puedo ayudarte con pizza, café, restaurantes y más.' 
      };
    }

    // Ayuda
    if (msg.includes('ayuda') || msg.includes('help') || msg === '?') {
      return { 
        type: 'text', 
        content: '🤔 Puedo ayudarte con:\n\n• "Busco pizza" 🍕\n• "Quiero café" ☕\n• "Los mejores restaurantes" ⭐\n• "Algo económico" 💰\n• "Locales destacados" ✨\n\n¡Intenta cualquiera de estas opciones!' 
      };
    }

    // Gracias
    if (msg.includes('gracias') || msg.includes('thanks')) {
      return { 
        type: 'text', 
        content: '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?' 
      };
    }

    // Despedida
    if (msg.includes('adios') || msg.includes('chao') || msg.includes('bye')) {
      return { 
        type: 'text', 
        content: '¡Hasta pronto! 👋 Que disfrutes tu comida 😋' 
      };
    }

    // Respuesta por defecto
    return { 
      type: 'text', 
      content: `🤔 No entendí "${message}". Intenta preguntar:\n\n• "Busco pizza"\n• "Los mejores restaurantes"\n• "Quiero café"\n• "Algo económico"\n\nO escribe "ayuda" para ver más opciones.` 
    };
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Procesar y responder
    setTimeout(() => {
      const response = processUserMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', ...response }]);
    }, 500); // Simular "pensando"
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickSuggestions = [
    '🍕 Busco pizza',
    '☕ Quiero café',
    '⭐ Los mejores',
    '💰 Algo económico',
    '🍽️ Restaurantes'
  ];

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all duration-300 ${
            isScrolled 
              ? 'p-3 scale-100'  // Pequeño cuando está arriba
              : 'p-4 scale-75' // Normal cuando está abajo
          }`}
        >
          <MessageCircle className={`transition-all duration-300 ${
            isScrolled ? 'h-5 w-5' : 'h-6 w-6'
          }`} />
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-800 max-sm:w-full max-sm:h-full max-sm:bottom-0 max-sm:right-0 max-sm:rounded-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl flex items-center justify-between max-sm:rounded-none">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Asistente Antojado</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  En línea
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 ${msg.role === 'user' ? 'bg-orange-500' : 'bg-gray-800'} p-2 rounded-full h-8 w-8 flex items-center justify-center`}>
                    {msg.role === 'user' ? (
                      <UserIcon className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-orange-500 text-white rounded-tr-none'
                        : 'bg-gray-800 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                {/* Cards de locales */}
                {msg.type === 'locales' && msg.locales && (
                  <div className="ml-11 mt-3 space-y-2">
                    {msg.locales.map((local) => (
                      <Link 
                        key={local.id} 
                        to={`/local/${local.id}`}
                        onClick={() => setIsOpen(false)}
                        className="block bg-gray-800 hover:bg-gray-750 rounded-lg p-3 border border-gray-700 hover:border-orange-500 transition"
                      >
                        <div className="flex gap-3">
                          <img 
                            src={local.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} 
                            alt={local.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm truncate">{local.name}</h4>
                            <p className="text-gray-400 text-xs">{local.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-yellow-400 text-xs">⭐ {local.rating || '0.0'}</span>
                              {local.subscriptionPlan === 'destacado' && (
                                <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded">
                                  DESTACADO
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias rápidas */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Sugerencias rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(suggestion)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-full transition"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}