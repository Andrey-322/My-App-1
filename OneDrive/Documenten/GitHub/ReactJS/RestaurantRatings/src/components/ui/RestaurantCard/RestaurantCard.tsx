import './RestaurantCard.css';
import type { Restaurant } from '../../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onRatingClick?: (restaurantId: string) => void;
}

export function RestaurantCard({ restaurant, onRatingClick }: RestaurantCardProps) {
  const handleRatingClick = () => {
    if (onRatingClick) {
      onRatingClick(restaurant.id);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-stars" onClick={handleRatingClick}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="star star-full">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="star star-half">★</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="star star-empty">
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="restaurant-card">
      <div className="restaurant-image-container">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="restaurant-image"
        />
      </div>
      <div className="restaurant-info">
        <h3 className="restaurant-name">{restaurant.name}</h3>
        <p className="restaurant-cuisine">
          {restaurant.cuisine}, {restaurant.rating} stars
        </p>
        {renderStars(restaurant.rating)}
      </div>
    </div>
  );
}

