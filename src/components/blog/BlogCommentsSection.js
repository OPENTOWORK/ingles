'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getClientAuth } from '@/utils/getClientAuth';
import { formatBlogCommentDate } from '@/lib/blogComments';

const MAX_BODY_LENGTH = 2000;

async function fetchComments(articleId) {
  const response = await fetch(`/api/blog/comments?articleId=${encodeURIComponent(articleId)}`, {
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'No se pudieron cargar los comentarios.');
  }
  return payload.comments || [];
}

export default function BlogCommentsSection({ articleId, articleSlug }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [body, setBody] = useState('');
  const [userId, setUserId] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const loginHref = useMemo(() => {
    const returnPath = articleSlug ? `/blog/${articleSlug}/` : '/blog/';
    return `/login?next=${encodeURIComponent(returnPath)}`;
  }, [articleSlug]);

  const loadComments = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    try {
      const nextComments = await fetchComments(articleId);
      setComments(nextComments);
    } catch (err) {
      toast.error(err?.message || 'No se pudieron cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { user } = await getClientAuth();
      if (!cancelled) {
        setUserId(user?.id || null);
        setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error('Escribe un comentario antes de publicar.');
      return;
    }
    if (trimmed.length > MAX_BODY_LENGTH) {
      toast.error(`El comentario no puede superar ${MAX_BODY_LENGTH} caracteres.`);
      return;
    }

    setSubmitting(true);
    try {
      const { session } = await getClientAuth();
      if (!session?.access_token) {
        toast.error('Debes iniciar sesión para comentar.');
        return;
      }

      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ articleId, body: trimmed }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'No se pudo publicar el comentario.');
      }

      if (payload.comment) {
        setComments((current) => [...current, payload.comment]);
      } else {
        await loadComments();
      }

      setBody('');
      toast.success('Comentario publicado.');
    } catch (err) {
      toast.error(err?.message || 'No se pudo publicar el comentario.');
    } finally {
      setSubmitting(false);
    }
  };

  const remainingChars = MAX_BODY_LENGTH - body.length;

  return (
    <section className="blog-comments" aria-labelledby="blog-comments-title">
      <header className="blog-comments__header">
        <h2 id="blog-comments-title">Comentarios</h2>
        <p className="blog-comments__lead">
          Comparte tu opinión sobre esta publicación. Los comentarios son visibles para todos los
          usuarios.
        </p>
      </header>

      {authChecked ? (
        userId ? (
          <form className="blog-comments__form" onSubmit={handleSubmit}>
            <label className="blog-comments__label" htmlFor="blog-comment-body">
              Tu comentario
            </label>
            <textarea
              id="blog-comment-body"
              className="blog-comments__textarea"
              rows={4}
              maxLength={MAX_BODY_LENGTH}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Escribe aquí tu comentario…"
              disabled={submitting}
            />
            <div className="blog-comments__form-footer">
              <span className="blog-comments__counter" aria-live="polite">
                {remainingChars} caracteres restantes
              </span>
              <button
                type="submit"
                className="blog-comments__submit"
                disabled={submitting || !body.trim()}
              >
                {submitting ? 'Publicando…' : 'Publicar comentario'}
              </button>
            </div>
          </form>
        ) : (
          <div className="blog-comments__auth-prompt">
            <p>
              <Link href={loginHref}>Inicia sesión</Link> para dejar un comentario.
            </p>
          </div>
        )
      ) : (
        <div className="blog-comments__auth-prompt">
          <p>Comprobando sesión…</p>
        </div>
      )}

      <div className="blog-comments__list-wrap">
        {loading ? (
          <p className="blog-comments__status">Cargando comentarios…</p>
        ) : comments.length === 0 ? (
          <p className="blog-comments__status">Sé el primero en comentar.</p>
        ) : (
          <ul className="blog-comments__list">
            {comments.map((comment) => (
              <li key={comment.id} className="blog-comments__item">
                <div className="blog-comments__item-head">
                  <strong className="blog-comments__author">{comment.author_name || 'Usuario'}</strong>
                  <time
                    className="blog-comments__date"
                    dateTime={comment.created_at}
                  >
                    {formatBlogCommentDate(comment.created_at)}
                  </time>
                </div>
                <p className="blog-comments__body">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
