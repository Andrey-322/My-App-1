export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
}

export interface UpdateRatingRequest {
  restaurantId: string;
  rating: number;
}

