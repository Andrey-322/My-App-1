import './Logo.css';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`logo ${className}`}>
      <span className="logo-icon">L</span>
      <span className="logo-text">Eats</span>
    </div>
  );
}

