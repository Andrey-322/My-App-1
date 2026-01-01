import './Avatar.css';

interface AvatarProps {
  src: string;
  alt?: string;
  className?: string;
}

export function Avatar({ src, alt = 'User avatar', className = '' }: AvatarProps) {
  return (
    <div className={`avatar ${className}`}>
      <img src={src} alt={alt} className="avatar-image" />
    </div>
  );
}

