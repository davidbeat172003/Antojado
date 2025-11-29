import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, MapPin, Heart } from 'lucide-react';

const SearchResults = ({ locales = [], favorites = [], toggleFavorite = () => {} }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim()) {
      const filtered = locales.filter(
        (local) =>
          local.name.toLowerCase().includes(query.toLowerCase()) ||
          local.category.toLowerCase().includes(query.toLowerCase()) ||
          local.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, locales]);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-2">Resultados de búsqueda</h1>
        <p className="text-gray-400 mb-8">
          {query && `Búsqueda para: "${query}"`}
          {results.length > 0 && ` - ${results.length} resultado${results.length > 1 ? 's' : ''}`}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-6">
              {query ? 'No se encontraron restaurantes que coincidan con tu búsqueda' : 'Ingresa un término de búsqueda'}
            </p>
            <Link
              to="/"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition"
            >
              Volver al Inicio
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((local) => (
              <Link
                key={local.id}
                to={`/local/${local.id}`}
                className="bg-gray-900 rounded-xl shadow-md overflow-hidden hover:transform hover:scale-105 transition block"
              >
                <div className="relative">
                  <img
                    src={local.image}
                    alt={local.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(local.id);
                    }}
                    className="absolute top-3 right-3 bg-black/60 p-2 rounded-full shadow-md"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(local.id)
                          ? 'fill-orange-500 text-orange-500'
                          : 'text-white'
                      }`}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-white mb-1">{local.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{local.category}</p>
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium text-white">
                      {local.rating}
                    </span>
                  </div>
                  <div className="flex items-start text-sm text-gray-400">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{local.address}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
