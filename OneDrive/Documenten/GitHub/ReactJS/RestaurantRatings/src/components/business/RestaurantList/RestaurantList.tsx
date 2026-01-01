import './RestaurantList.css';
import { RestaurantCard } from '../../ui/RestaurantCard/RestaurantCard';
import type { Restaurant } from '../../../types';

interface RestaurantListProps {
  restaurants: Restaurant[];
  onRatingClick?: (restaurantId: string) => void;
}

export function RestaurantList({ restaurants, onRatingClick }: RestaurantListProps) {
  if (restaurants.length === 0) {
    return (
      <div className="restaurant-list-empty">
        <p>Рестораны не найдены</p>
      </div>
    );
  }

  return (
    <div className="restaurant-list">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onRatingClick={onRatingClick}
        />
      ))}
    </div>
  );
}

