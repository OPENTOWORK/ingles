import Link from 'next/link';

const TOPICS = [
  { href: '/exam-practice', label: 'Practicar por niveles' },
  { href: '/exam-strategies', label: 'Estrategias de examen' },
  { href: '/dralo-ai', label: 'Dralo AI' },
  { href: '#blog-noticias', label: 'Noticias' },
  { href: '#blog-articulos', label: 'Artículos' },
  { href: '/contact', label: 'Contacto' },
];

export default function BlogTopicNav() {
  return (
    <nav className="blog-mag__topics" aria-label="Explorar el blog">
      <p className="blog-mag__topics-label">Explora</p>
      <ul className="blog-mag__topics-list">
        {TOPICS.map((topic) => (
          <li key={topic.href}>
            <Link href={topic.href} className="blog-mag__topic-pill">
              {topic.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
