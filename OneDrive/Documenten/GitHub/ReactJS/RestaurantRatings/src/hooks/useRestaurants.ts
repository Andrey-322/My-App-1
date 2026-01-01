import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Restaurant, UpdateRatingRequest } from '../types';
import { fetchRestaurants, updateRestaurantRating } from '../api/restaurants';

interface UseRestaurantsReturn {
  filteredRestaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleRatingClick: (restaurantId: string) => Promise<void>;
  refetch: () => void;
}

/**
 * Хук для работы с ресторанами
 * Включает получение данных, фильтрацию и обновление рейтинга
 */
export function useRestaurants(): UseRestaurantsReturn {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const queryClient = useQueryClient();

  // Запрос на получение ресторанов
  const {
    data: restaurants = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Restaurant[]>({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  });

  // Мутация для обновления рейтинга
  const updateRatingMutation = useMutation({
    mutationFn: (request: UpdateRatingRequest) => updateRestaurantRating(request),
    onSuccess: () => {
      // Инвалидируем кеш, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  // Фильтрация ресторанов по поисковому запросу
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) {
      return restaurants;
    }
    return restaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [restaurants, searchQuery]);

  // Обработчик клика по рейтингу
  const handleRatingClick = async (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) return;

    // Запрашиваем новый рейтинг у пользователя
    const newRating = prompt(
      `Введите новый рейтинг для "${restaurant.name}" (от 0 до 5):`,
      restaurant.rating.toString()
    );

    if (newRating === null) return; // Пользователь отменил

    const rating = parseFloat(newRating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      alert('Рейтинг должен быть числом от 0 до 5');
      return;
    }

    // Отправляем запрос на обновление рейтинга
    await updateRatingMutation.mutateAsync({
      restaurantId,
      rating,
    });
  };

  return {
    filteredRestaurants,
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    searchQuery,
    setSearchQuery,
    handleRatingClick,
    refetch,
  };
}

