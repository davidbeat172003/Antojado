import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const testRestaurants = [
  {
    name: "La Fogata Grill",
    category: "Restaurante",
    description: "Carnes a la parrilla y platos típicos colombianos",
    address: "Calle 15 #23-45, Pereira",
    phone: "+57 312 456 7890",
    rating: 4.5,
    reviewCount: 127,
    approved: true,
    images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"],
  },
  {
    name: "Café del Parque",
    category: "Cafetería",
    description: "Café de especialidad y postres artesanales",
    address: "Carrera 7 #18-30, Pereira",
    phone: "+57 315 234 5678",
    rating: 4.8,
    reviewCount: 89,
    approved: true,
    images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"],
  },
  {
    name: "Pizza Napolitana",
    category: "Pizzería",
    description: "Pizzas al horno de leña estilo italiano",
    address: "Avenida Circunvalar #45-12, Pereira",
    phone: "+57 318 765 4321",
    rating: 4.6,
    reviewCount: 156,
    approved: true,
    images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"],
  },
  {
    name: "Heladería Dulce Tentación",
    category: "Postres",
    description: "Helados artesanales y postres deliciosos",
    address: "Calle 20 #8-15, Pereira",
    phone: "+57 320 987 6543",
    rating: 4.7,
    reviewCount: 203,
    approved: true,
    images: ["https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800"],
  },
  {
    name: "Restaurante El Mirador",
    category: "Restaurante",
    description: "Comida internacional con vista panorámica",
    address: "Carrera 14 #25-50, Pereira",
    phone: "+57 314 123 4567",
    rating: 4.4,
    reviewCount: 98,
    approved: true,
    images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"],
  },
  {
    name: "Café Aroma",
    category: "Cafetería",
    description: "Espacio acogedor con wifi y buen café",
    address: "Calle 22 #10-35, Pereira",
    phone: "+57 316 789 0123",
    rating: 4.3,
    reviewCount: 67,
    approved: true,
    images: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800"],
  },
  {
    name: "Burger House",
    category: "Comida Rápida",
    description: "Las mejores hamburguesas artesanales de la ciudad",
    address: "Calle 12 #15-20, Pereira",
    phone: "+57 311 222 3333",
    rating: 4.2,
    reviewCount: 145,
    approved: true,
    images: ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"],
  },
  {
    name: "Sushi Bar Osaka",
    category: "Restaurante",
    description: "Sushi fresco y cocina japonesa auténtica",
    address: "Carrera 8 #25-10, Pereira",
    phone: "+57 317 888 9999",
    rating: 4.9,
    reviewCount: 210,
    approved: true,
    images: ["https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800"],
  }
];

export default function AddTestData() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const localesRef = collection(db, 'locales');
      
      for (const restaurant of testRestaurants) {
        await addDoc(localesRef, {
          ...restaurant,
          createdAt: new Date().toISOString(),
          menu: [],
          hours: {}
        });
      }
      
      setMessage('✅ ¡Datos agregados exitosamente! Ve a la página principal para verlos.');
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error al agregar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-4">Agregar Datos de Prueba</h2>
      <p className="text-gray-400 mb-6">
        Esto agregará 8 restaurantes de prueba a tu base de datos Firestore.
      </p>

      {message && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            message.includes("✅")
              ? "bg-green-500/10 border border-green-500 text-green-500"
              : "bg-red-500/10 border border-red-500 text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <button
        onClick={addData}
        disabled={loading}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Agregando restaurantes..." : "Agregar Restaurantes"}
      </button>

      {message.includes("✅") && (
        <a
          href="/"
          className="block mt-4 text-center bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition"
        >
          Ir a la Página Principal
        </a>
      )}
    </div>
  </div>
);
} 
        