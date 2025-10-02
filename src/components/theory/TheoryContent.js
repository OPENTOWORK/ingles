'use client';

// Theory Section Component
export const TheorySection = ({ title, children, icon = "📚" }) => {
  return (
    <div style={{
      marginBottom: '2rem',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <h3 style={{
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
};

// Example Component
export const Example = ({ spanish, english, translation, note }) => {
  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {spanish && (
          <div>
            <strong style={{ color: '#667eea' }}>🇪🇸 Español:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: '#4a5568' }}>{spanish}</p>
          </div>
        )}
        {english && (
          <div>
            <strong style={{ color: '#38a169' }}>🇬🇧 Inglés:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: '#4a5568' }}>{english}</p>
          </div>
        )}
        {translation && (
          <div>
            <strong style={{ color: '#e53e3e' }}>📝 Traducción:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: '#4a5568' }}>{translation}</p>
          </div>
        )}
        {note && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '8px',
            padding: '0.75rem',
            marginTop: '0.5rem'
          }}>
            <strong style={{ color: '#e53e3e' }}>💡 Nota:</strong>
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
          <strong style={{ color: '#667eea', fontSize: '0.9rem' }}>Ejemplos:</strong>
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
    error: { bg: '#fed7d7', border: '#feb2b2', text: '#e53e3e' }
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
          {label || 'Progreso'}
        </span>
        <span style={{ fontSize: '0.9rem', color: '#667eea' }}>
          {current} de {total}
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
export const QuickReference = ({ items }) => {
  return (
    <div style={{
      background: '#fff5f5',
      border: '2px solid #fed7d7',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      <h4 style={{
        margin: '0 0 1rem 0',
        color: '#e53e3e',
        fontSize: '1.1rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        📋 Referencia Rápida
      </h4>
      <div style={{
        display: 'grid',
        gap: '0.5rem'
      }}>
        {items.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #fed7d7'
          }}>
            <span style={{
              background: '#e53e3e',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: '600',
              flexShrink: 0
            }}>
              {index + 1}
            </span>
            <span style={{ color: '#4a5568', lineHeight: 1.4 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};






















