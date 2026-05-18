'use client';

import { createContext, useId, useRef, useState } from 'react';

const TheorySectionIndexContext = createContext(null);

export function TheorySectionProvider({ children }) {
  const counterRef = useRef(0);
  const apiRef = useRef({
    next: () => counterRef.current++,
    reset: () => {
      counterRef.current = 0;
    },
  });

  return (
    <TheorySectionIndexContext.Provider value={apiRef.current}>
      {children}
    </TheorySectionIndexContext.Provider>
  );
}

// Theory Section Component (collapsible toggle)
export const TheorySection = ({ title, children, icon = '📚', defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const toggle = () => setOpen((v) => !v);
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className={`theory-section${open ? ' theory-section--open' : ''}`}
      style={{
        marginBottom: open ? '1rem' : '0.65rem',
        border: '1px solid #c7d2fe',
        borderRadius: '14px',
        overflow: 'hidden',
        background: 'white',
        boxShadow: open
          ? '0 6px 20px rgba(102, 126, 234, 0.15)'
          : '0 2px 8px rgba(102, 126, 234, 0.08)',
        transition: 'margin-bottom 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        className="theory-section__header"
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #5b6fd6 45%, #764ba2 100%)',
          color: '#fff',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span className="theory-section__header-icon" aria-hidden style={{ fontSize: '1.25rem' }}>
          {icon}
        </span>
        <h3
          style={{
            margin: 0,
            padding: 0,
            fontSize: '1.05rem',
            fontWeight: 600,
            lineHeight: 1.25,
            color: '#fff',
            flex: 1,
            textAlign: 'left',
          }}
        >
          {title}
        </h3>
        <span
          aria-hidden
          style={{
            fontSize: '0.85rem',
            opacity: 0.9,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        >
          ▼
        </span>
      </div>
      {open ? (
        <div id={panelId} style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          {children}
        </div>
      ) : null}
    </div>
  );
};

// Example Component
export const Example = ({
  spanish,
  english,
  note,
  useTag,
  why,
  whyLabel = 'Why?',
  title,
  content,
  explanation,
}) => {
  const displayTag = useTag || title;
  const displayEnglish = english || content;
  const displayWhy = why || explanation;

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1rem',
    }}
    >
      {displayTag ? (
        <span
          style={{
            display: 'inline-block',
            marginBottom: '0.75rem',
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          {displayTag}
        </span>
      ) : null}
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {displayEnglish && (
          <div>
            <strong style={{ color: '#38a169' }}>🇬🇧 English:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: '#4a5568' }}>{displayEnglish}</p>
          </div>
        )}
        {spanish && (
          <div>
            <strong style={{ color: '#667eea' }}>🇪🇸 Spanish:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: '#4a5568' }}>{spanish}</p>
          </div>
        )}
        {displayWhy ? (
          <p
            style={{
              margin: '0.35rem 0 0 0',
              padding: '0.75rem 0.85rem',
              borderRadius: '8px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#334155',
              fontSize: '0.9rem',
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: '#0369a1' }}>{whyLabel} </strong>
            {displayWhy}
          </p>
        ) : null}
        {note && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '8px',
            padding: '0.75rem',
            marginTop: '0.5rem'
          }}>
            <strong style={{ color: '#e53e3e' }}>💡 Note:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: '#4a5568', fontSize: '0.9rem' }}>
              {note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Rule Component
export const Rule = ({ title, description, examples = [] }) => {
  return (
    <div style={{
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1rem',
      background: 'white'
    }}>
      <h4 style={{
        margin: '0 0 0.75rem 0',
        color: '#2d3748',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        {title}
      </h4>
      <p style={{
        margin: '0 0 1rem 0',
        color: '#4a5568',
        lineHeight: 1.6
      }}>
        {description}
      </p>
      {examples.length > 0 && (
        <div>
          <strong style={{ color: '#667eea', fontSize: '0.9rem' }}>Examples:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            {examples.map((example, index) => (
              <li key={index} style={{ 
                marginBottom: '0.25rem', 
                color: '#4a5568',
                lineHeight: 1.5
              }}>
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Tip Component
export const Tip = ({ children, type = "info" }) => {
  const colors = {
    info: { bg: '#ebf8ff', border: '#bee3f8', text: '#2b6cb0' },
    warning: { bg: '#fffbeb', border: '#fed7aa', text: '#d97706' },
    success: { bg: '#f0fff4', border: '#9ae6b4', text: '#2f855a' },
    error: { bg: '#fefce8', border: '#fde68a', text: '#92400e' }
  };

  const icons = {
    info: "💡",
    warning: "⚠️",
    success: "✅",
    error: "❌"
  };

  const color = colors[type];

  return (
    <div style={{
      background: color.bg,
      border: `2px solid ${color.border}`,
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1rem',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start'
    }}>
      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>
        {icons[type]}
      </span>
      <div style={{ color: color.text, lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
};

// Grammar Table Component
export const GrammarTable = ({ headers, rows, caption }) => {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {caption && (
        <div style={{
          background: '#f7fafc',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #e2e8f0',
          fontWeight: '600',
          color: '#4a5568',
          fontSize: '0.9rem'
        }}>
          {caption}
        </div>
      )}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse'
      }}>
        <thead>
          <tr style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            {headers.map((header, index) => (
              <th key={index} style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                borderBottom: 'none'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} style={{
              borderBottom: rowIndex < rows.length - 1 ? '1px solid #e2e8f0' : 'none'
            }}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={{
                  padding: '0.75rem 1rem',
                  color: '#4a5568',
                  borderBottom: 'none'
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Progress Indicator Component
export const ProgressIndicator = ({ current, total, label }) => {
  const percentage = (current / total) * 100;

  return (
    <div style={{
      background: '#f7fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontWeight: '500', color: '#4a5568' }}>
          {label || 'Progress'}
        </span>
        <span style={{ fontSize: '0.9rem', color: '#667eea' }}>
          {current} of {total}
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
};

// Quick Reference Component
const QUICK_REFERENCE_THEMES = {
  amber: {
    panelBg: '#fffbeb',
    panelBorder: '#fde68a',
    titleColor: '#b45309',
    cardBorder: '#fde68a',
    badgeBg: '#eab308',
    badgeColor: '#422006',
  },
  green: {
    panelBg: '#ecfdf5',
    panelBorder: '#a7f3d0',
    titleColor: '#047857',
    cardBorder: '#bbf7d0',
    badgeBg: '#34d399',
    badgeColor: '#064e3b',
  },
};

function normalizeQuickReferenceItem(item) {
  if (typeof item === 'string') {
    const colon = item.indexOf(':');
    if (colon > 0 && colon < 100) {
      return {
        title: item.slice(0, colon).trim(),
        description: item.slice(colon + 1).trim(),
      };
    }
    return { title: item.trim(), description: '' };
  }
  return item;
}

export const QuickReference = ({ items, variant = 'green' }) => {
  const theme = QUICK_REFERENCE_THEMES[variant] || QUICK_REFERENCE_THEMES.green;
  const normalizedItems = items.map(normalizeQuickReferenceItem);

  return (
    <div
      style={{
        background: theme.panelBg,
        border: `2px solid ${theme.panelBorder}`,
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <h4
        style={{
          margin: '0 0 1rem 0',
          color: theme.titleColor,
          fontSize: '1.1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        📋 Quick Reference
      </h4>
      <div style={{ display: 'grid', gap: '0.65rem' }}>
        {normalizedItems.map((item, index) => {
          const isRich = item && typeof item === 'object' && 'title' in item;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: 'white',
                borderRadius: '10px',
                border: `1px solid ${theme.cardBorder}`,
              }}
            >
              <span
                style={{
                  background: theme.badgeBg,
                  color: theme.badgeColor,
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}
              >
                {index + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isRich ? (
                  <>
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#1e293b',
                        fontSize: '0.95rem',
                        marginBottom: '0.35rem',
                        lineHeight: 1.35,
                      }}
                    >
                      {item.title}
                    </div>
                    {item.description ? (
                      <p
                        style={{
                          margin: '0 0 0.4rem 0',
                          color: '#475569',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {item.description}
                      </p>
                    ) : null}
                    {item.example ? (
                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '0.875rem',
                          lineHeight: 1.45,
                          fontStyle: 'italic',
                        }}
                      >
                        <span style={{ fontStyle: 'normal', marginRight: '0.35rem' }}>•</span>
                        {item.example}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <span style={{ color: '#4a5568', lineHeight: 1.45, fontSize: '0.95rem' }}>
                    {item}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};






















