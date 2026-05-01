export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--card) 25%, var(--card2) 50%, var(--card) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s infinite',
        ...style,
      }}
    />
  );
}
