import type { Restaurant, UpdateRatingRequest } from '../types';

// Базовый URL API (в реальном приложении это будет переменная окружения)
const API_BASE_URL = 'https://api.example.com/restaurants';

/**
 * Получить список всех ресторанов
 */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  // Имитация API запроса
  // В реальном приложении здесь будет fetch(API_BASE_URL)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: "Mama's Kitchen",
          cuisine: 'American',
          rating: 4.7,
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        },
        {
          id: '2',
          name: 'The Burger Joint',
          cuisine: 'American',
          rating: 4.6,
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        },
        {
          id: '3',
          name: 'Pasta Express',
          cuisine: 'Italian',
          rating: 4.5,
          image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
        },
        {
          id: '4',
          name: 'Taco Fiesta',
          cuisine: 'Mexican',
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1565299585323-38174c0b5d0e?w=400',
        },
      ]);
    }, 1000); // Имитация задержки сети
  });
}

/**
 * Обновить рейтинг ресторана
 */
export async function updateRestaurantRating(
  request: UpdateRatingRequest
): Promise<Restaurant> {
  // Имитация API запроса
  // В реальном приложении здесь будет fetch(`${API_BASE_URL}/${request.restaurantId}/rating`, { method: 'PUT', body: JSON.stringify({ rating: request.rating }) })
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: request.restaurantId,
        name: 'Updated Restaurant',
        cuisine: 'Updated',
        rating: request.rating,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      });
    }, 500);
  });
}

