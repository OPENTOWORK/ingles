import Link from 'next/link';

export default function FooterReviews() {
  return (
    <Link href="/resena/" className="footer-review__title">
      <span className="footer-review__label">Tu reseña</span>
      <span className="footer-review__stars" aria-hidden="true">
        ★★★★★
      </span>
    </Link>
  );
}
