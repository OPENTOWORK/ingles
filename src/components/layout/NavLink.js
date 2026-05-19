'use client';

import Link from 'next/link';

/** Enlace de navegación sin prefetch automático (menos trabajo en red al cargar). */
export default function NavLink(props) {
  return <Link prefetch={false} {...props} />;
}
