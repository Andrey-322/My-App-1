import './HomePage.css';
import { Logo } from '../../components/ui/Logo/Logo';
import { Avatar } from '../../components/ui/Avatar/Avatar';
import { Search } from '../../components/ui/Search/Search';
import { RestaurantList } from '../../components/business/RestaurantList/RestaurantList';
import { useRestaurants } from '../../hooks/useRestaurants';

export function HomePage() {
  const {
    filteredRestaurants,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    handleRatingClick,
    refetch,
  } = useRestaurants();

  return (
    <div className="home-page">
      <header className="page-header">
        <Logo />
        <Avatar
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
          alt="User avatar"
        />
      </header>

      <main className="page-main">
        <Search value={searchQuery} onChange={setSearchQuery} />

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка ресторанов...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>Ошибка: {error}</p>
            <button onClick={refetch} className="retry-button">
              Попробовать снова
            </button>
          </div>
        )}

        {!loading && !error && (
          <RestaurantList
            restaurants={filteredRestaurants}
            onRatingClick={handleRatingClick}
          />
        )}
      </main>

      <footer className="page-footer">
        <a href="/privacy" className="footer-link">
          Privacy Policy
        </a>
        <span className="footer-copyright">© 2022 Eats</span>
        <a href="/terms" className="footer-link">
          Terms of Service
        </a>
      </footer>
    </div>
  );
}

