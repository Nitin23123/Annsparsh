export default function BrandMark({ className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M2.6 11.6h18.8c0 4.9-4.2 8.8-9.4 8.8s-9.4-3.9-9.4-8.8Z" fill="currentColor" />
      <path
        d="M11.9 10.1c-.4-3.6 1.9-6.7 5.7-7.4.1 4.1-2.3 6.8-5.7 7.4Z"
        fill="currentColor"
        opacity=".62"
      />
      <circle cx="8.3" cy="7.4" r="1.35" fill="currentColor" opacity=".62" />
    </svg>
  );
}
