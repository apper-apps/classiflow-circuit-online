const SkeletonLoader = ({ count = 1, height = 'h-4', className = '' }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`
            animate-pulse bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200
            bg-[length:200%_100%] rounded-lg
            ${height}
            ${className}
          `}
          style={{
            animationDelay: `${index * 0.1}s`,
            animation: 'pulse 1.5s ease-in-out infinite, shimmer 2s ease-in-out infinite'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
};

export default SkeletonLoader;