'use client';

import { useEffect } from 'react';
import { formatCurrency } from '@/lib/finance/money';
import styles from './ui.module.css';

export { styles as financeStyles };

/* ------------------------------------------------------------------ */
/* Estructura                                                          */
/* ------------------------------------------------------------------ */

export function Card({ title, description, actions, children, flush = false, className = '' }) {
  return (
    <section className={`${styles.card} ${flush ? styles.cardFlush : ''} ${className}`.trim()}>
      {(title || actions) && (
        <header className={`${styles.cardHead} ${flush ? styles.cardHeadFlush : ''}`.trim()}>
          <div>
            {title && <h2 className={styles.cardTitle}>{title}</h2>}
            {description && <p className={styles.cardDesc}>{description}</p>}
          </div>
          {actions && <div className={styles.row}>{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function KpiGrid({ children }) {
  return <div className={styles.kpiGrid}>{children}</div>;
}

export function Kpi({ label, value, hint, tone = 'neutral', accent = false }) {
  const toneClass =
    tone === 'positive' ? styles.kpiPositive : tone === 'negative' ? styles.kpiNegative : '';
  return (
    <article className={`${styles.kpi} ${toneClass} ${accent ? styles.kpiAccent : ''}`.trim()}>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
      {hint && <p className={styles.kpiHint}>{hint}</p>}
    </article>
  );
}

export function MoneyKpi({ label, amount, hint, accent = false, signed = false }) {
  const n = Number(amount) || 0;
  const tone = signed ? (n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral') : 'neutral';
  return <Kpi label={label} value={formatCurrency(n)} hint={hint} tone={tone} accent={accent} />;
}

/* ------------------------------------------------------------------ */
/* Estados                                                             */
/* ------------------------------------------------------------------ */

export function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.stateBox}>
      <p className={styles.errorBox}>{message || 'No se han podido cargar los datos.'}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="ghost">
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Sin datos', description, action }) {
  return (
    <div className={styles.stateBox}>
      <p className={styles.stateTitle}>{title}</p>
      {description && <p className={styles.stateText}>{description}</p>}
      {action}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className={styles.skeletonRows} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={styles.skeleton} style={{ height: 34 }} />
      ))}
    </div>
  );
}

export function KpiSkeleton({ count = 4 }) {
  return (
    <div className={styles.kpiGrid} aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeleton} style={{ height: 96, borderRadius: '1rem' }} />
      ))}
    </div>
  );
}

export function ErrorBanner({ children }) {
  if (!children) return null;
  return <p className={styles.errorBox}>{children}</p>;
}

export function SuccessBanner({ children }) {
  if (!children) return null;
  return <p className={styles.successBox}>{children}</p>;
}

export function InfoBanner({ children }) {
  if (!children) return null;
  return <p className={styles.infoBox}>{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Controles                                                           */
/* ------------------------------------------------------------------ */

export function Button({
  children,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}) {
  const variantClass =
    variant === 'primary'
      ? styles.buttonPrimary
      : variant === 'danger'
        ? styles.buttonDanger
        : variant === 'ghost'
          ? styles.buttonGhost
          : '';
  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${size === 'small' ? styles.buttonSmall : ''}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, htmlFor, error, children, hint }) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <span className={styles.kpiHint}>{hint}</span>}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}

export function TextInput(props) {
  return <input className={styles.input} {...props} />;
}

export function NumberInput(props) {
  return <input type="number" className={`${styles.input} ${styles.inputNumeric}`} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={styles.select} {...props}>
      {children}
    </select>
  );
}

export function TextArea(props) {
  return <textarea className={styles.textarea} {...props} />;
}

export function Filters({ children }) {
  return <div className={styles.filters}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

const TONE_CLASS = {
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
  info: styles.badgeInfo,
  neutral: styles.badgeNeutral,
};

export function Badge({ tone = 'neutral', children }) {
  return <span className={`${styles.badge} ${TONE_CLASS[tone] || TONE_CLASS.neutral}`}>{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Tabla                                                               */
/* ------------------------------------------------------------------ */

/**
 * Tabla de datos con ordenación opcional y estados de carga/error/vacío.
 * `columns`: { key, label, numeric?, sortable?, render(row) }
 */
export function DataTable({
  columns,
  rows,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  sortBy,
  sortDir = 'desc',
  onSort,
  getRowKey = (row, index) => row.id ?? index,
  footer = null,
  skeletonRows = 6,
}) {
  if (loading) return <TableSkeleton rows={skeletonRows} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => {
              const sortable = column.sortable && onSort;
              return (
                <th
                  key={column.key}
                  className={`${column.numeric ? styles.numeric : ''} ${sortable ? styles.sortable : ''}`.trim()}
                  onClick={sortable ? () => onSort(column.key) : undefined}
                  scope="col"
                >
                  {column.label}
                  {sortable && sortBy === column.key && (
                    <span className={styles.sortArrow}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)}>
              {columns.map((column) => (
                <td key={column.key} className={column.numeric ? styles.numeric : ''}>
                  {column.render ? column.render(row, index) : (row[column.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot className={styles.tableFoot}>{footer}</tfoot>}
      </table>
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  if (!total) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>
        {first}–{last} de {total}
      </span>
      <div className={styles.paginationControls}>
        <Button size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </Button>
        <span className={styles.paginationInfo}>
          Página {page} de {totalPages}
        </span>
        <Button size="small" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({ open, title, subtitle, onClose, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={`${styles.modal} ${wide ? styles.modalWide : ''}`.trim()} role="dialog" aria-modal="true">
        <header className={styles.modalHead}>
          <div>
            <h2 className={styles.modalTitle}>{title}</h2>
            {subtitle && <p className={styles.modalSubtitle}>{subtitle}</p>}
          </div>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        {footer && <footer className={styles.modalFoot}>{footer}</footer>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gráficos                                                            */
/* ------------------------------------------------------------------ */

/**
 * Gráfico de barras ligero, sin dependencias externas.
 * `series`: [{ key, label, color }] · `data`: [{ label, [key]: number }]
 */
export function BarChart({ data = [], series = [], height = 180, formatValue = formatCurrency }) {
  if (!data.length) {
    return <EmptyState title="Sin datos suficientes" description="Aún no hay movimientos en el periodo." />;
  }

  const max = Math.max(
    1,
    ...data.map((point) => series.reduce((acc, s) => Math.max(acc, Math.abs(Number(point[s.key]) || 0)), 0)),
  );

  return (
    <div>
      <div className={styles.barChart} style={{ height }}>
        {data.map((point, index) => (
          <div key={point.label ?? index} className={styles.barColumn}>
            <div className={styles.barStack}>
              {series.map((s) => {
                const value = Math.abs(Number(point[s.key]) || 0);
                return (
                  <div
                    key={s.key}
                    className={styles.bar}
                    style={{
                      height: `${(value / max) * 100}%`,
                      background: s.color,
                    }}
                    title={`${point.label} · ${s.label}: ${formatValue(point[s.key])}`}
                  />
                );
              })}
            </div>
            <span className={styles.barLabel}>{point.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        {series.map((s) => (
          <span key={s.key} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DefinitionList({ items = [] }) {
  return (
    <dl className={styles.definitionList}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className={styles.definitionTerm}>{item.label}</dt>
          <dd className={styles.definitionValue}>{item.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
