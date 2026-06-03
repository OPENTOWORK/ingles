import Link from 'next/link';
import { HOME_MAIN_LINKS } from '@/config/appNavMenu';

export default function HomeQuickNav() {
  return (
    <nav className="home-quick-nav" aria-label="Theory, placement test, training and plans">
      <ul className="home-quick-nav__list">
        {HOME_MAIN_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="home-quick-nav__link"
              {...(item.tourId ? { 'data-tour': item.tourId } : {})}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
