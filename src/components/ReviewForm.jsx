import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../hooks/useReviews';

export default function ReviewForm({ localId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { addReview } = useReviews();

  const handleSubmit = async () => {
    if (!rating) {
      alert('Por favor selecciona una calificación');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      alert('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    try {
      await addReview(localId, rating, comment);
      
      // Limpiar formulario
      setRating(0);
      setComment('');
      
      // Notificar que se agregó la reseña
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error al enviar reseña:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null; // No mostrar nada si no está autenticado
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-white mb-4">Deja tu reseña</h3>
      
      {/* Selector de Estrellas */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Calificación
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-gray-300 text-sm">
              {rating} {rating === 1 ? 'estrella' : 'estrellas'}
            </span>
          )}
        </div>
      </div>

      {/* Campo de Comentario */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tu experiencia
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos sobre tu experiencia en este lugar..."
          rows="4"
          maxLength="500"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            Mínimo 10 caracteres
          </span>
          <span className="text-xs text-gray-500">
            {comment.length}/500
          </span>
        </div>
      </div>

      {/* Botón Publicar */}
      <button
        onClick={handleSubmit}
        disabled={loading || !rating || comment.trim().length < 10}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Publicando...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Publicar Reseña
          </>
        )}
      </button>
    </div>
  );
}