export const Logo = ({ className = "w-10 h-10 rounded-xl" }: { className?: string }) => {
  return (
    <div 
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        background: 'linear-gradient(180deg, #E56820 0%, #D45E3E 100%)',
      }}
    >
      <svg 
        width="28" 
        height="20" 
        viewBox="0 0 28 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0px 4.28571px 8.57143px rgba(0, 0, 0, 0.2)) drop-shadow(0px 8.57143px 17.1429px rgba(0, 0, 0, 0.15)) drop-shadow(0px 12.8571px 25.7143px rgba(0, 0, 0, 0.1))'
        }}
      >
        {/* Left arm */}
        <path d="M0.5 0 L9 0 L18.5 19.5 L10 19.5 Z" fill="white" />
        {/* Shadow overlay */}
        <path d="M0.5 0 L9 0 L18.5 19.5 L10 19.5 Z" fill="url(#shadow_gradient)" opacity="0.2" />
        {/* Right arm */}
        <path d="M27.5 0 L19 0 L9.5 19.5 L18 19.5 Z" fill="white" />
        
        <defs>
          <linearGradient id="shadow_gradient" x1="9" y1="0" x2="9" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0" offset="-8.5%" />
            <stop stopColor="white" stopOpacity="0" offset="30.21%" />
            <stop stopColor="#0E1513" offset="80.66%" />
            <stop stopColor="#0E1513" offset="108.81%" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
