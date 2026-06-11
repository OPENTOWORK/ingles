import { Check } from 'lucide-react';
import Link from 'next/link';
import styles from './ProfileSubscriptionCard.module.css';

function cleanBadge(text) {
  if (!text) return null;
  return String(text)
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {{
 *   plan: { slug?: string, nombre?: string, precioLabel?: string },
 *   description: string,
 *   highlights: string[],
 *   badge?: string | null,
 *   showPricingLink?: boolean,
 * }} props
 */
export default function ProfileSubscriptionCard({
  plan,
  description,
  highlights = [],
  badge = null,
  showPricingLink = false,
}) {
  const slug = plan?.slug || 'free';
  const badgeLabel = cleanBadge(badge);
  const priceLabel =
    plan?.precioLabel && plan.precioLabel !== '0€' ? plan.precioLabel : 'Free · forever';

  return (
    <article className={`${styles.card} ${styles[`card_${slug}`] || styles.card_free}`}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden />
            Your current plan
          </span>
          {badgeLabel ? <span className={styles.tag}>{badgeLabel}</span> : null}
        </div>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Dralo subscription</p>
            <h3 className={styles.planName}>{plan?.nombre || 'FREE'}</h3>
            <p className={styles.tagline}>{description}</p>
          </div>
          <div className={styles.priceChip}>
            <span className={styles.priceValue}>{priceLabel}</span>
          </div>
        </div>

        <ul className={styles.features}>
          {highlights.slice(0, 5).map((line) => (
            <li key={line} className={styles.feature}>
              <span className={styles.featureIcon} aria-hidden>
                <Check size={14} strokeWidth={2.5} />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {showPricingLink ? (
          <p className={styles.footer}>
            <Link href="/precios" className={styles.footerLink}>
              View all plans and comparison
            </Link>
          </p>
        ) : null}
      </div>
    </article>
  );
}
