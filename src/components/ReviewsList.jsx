import { useState } from 'react';
import { Star, Trash2, Edit2, X, Check } from 'lucide-react';
import { useReviews } from '../hooks/useReviews';

export default function ReviewsList({ reviews, currentUserId, localId, onReviewsDeleted, onReviewUpdated }) {
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const { deleteReview, updateReview } = useReviews();

  // Formatear fecha relativa
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Iniciar edición
  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
  };

  // Guardar edición
  const saveEdit = async (reviewId) => {
  // Validar que editComment sea un string
  const commentText = typeof editComment === 'string' ? editComment : '';
  
  if (!editRating || editRating < 1 || editRating > 5) {
    alert('Por favor selecciona una calificación válida (1-5)');
    return;
  }

  if (!commentText || commentText.trim().length < 10) {
    alert('El comentario debe tener al menos 10 caracteres');
    return;
  }

  await updateReview(reviewId, localId, editRating, commentText);
  cancelEditing();
};

  // Eliminar reseña
  const handleDelete = async (reviewId) => {
    await deleteReview(reviewId, localId);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Aún no hay reseñas</p>
        <p className="text-gray-500 text-sm">Sé el primero en compartir tu experiencia</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          {reviews.length} {reviews.length === 1 ? 'Reseña' : 'Reseñas'}
        </h3>
      </div>

      {reviews.map((review) => {
        const isEditing = editingReviewId === review.id;
        const isOwner = currentUserId && review.userId === currentUserId;

        return (
          <div
            key={review.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            {/* Header de la reseña */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                
                <div>
                  <p className="font-medium text-white">{review.userName || 'Usuario'}</p>
                  <p className="text-sm text-gray-400">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {/* Botones de acción (solo para el dueño) */}
              {isOwner && !isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(review)}
                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-gray-700 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Calificación */}
            {!isEditing ? (
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            ) : (
              // Editar calificación
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoverRating || editRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comentario */}
            {!isEditing ? (
              <p className="text-gray-300 leading-relaxed">{review.comment}</p>
            ) : (
              // Editar comentario
              <div>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-3"
                />
                
                {/* Botones de guardar/cancelar */}
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(review.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <Check className="h-4 w-4" />
                    Guardar
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Fecha de actualización (si fue editado) */}
            {review.updatedAt !== review.createdAt && !isEditing && (
              <p className="text-xs text-gray-500 mt-3">
                (Editado {formatDate(review.updatedAt)})
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
