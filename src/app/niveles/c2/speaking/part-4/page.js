'use client';
import { useRouter } from 'next/navigation';
import { partInfo } from '@/data/part-info/c2-speaking';

export default function TheoryPage() {
  const router = useRouter();
  const part = 4;
  const info = partInfo[part] || {};
  
  const backLink = part === 1 ? '/niveles/c2' : `/niveles/c2/speaking/part-${part - 1}`;
  const nextLink = part === 4 ? '/niveles/c2' : `/niveles/c2/speaking/part-${part + 1}`;
  const homeLink = '/niveles/c2';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>{info.title || `Part ${part}`}</h1>
      
      {/* Sección de información educativa */}
      {info.description && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
            📋 What is this part?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {info.description}
          </p>
          
          {info.tips && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>
                💡 Tips for Success
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>
                {info.tips}
              </p>
            </div>
          )}
          
          {info.commonErrors && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1.5rem',
              borderRadius: '8px'
            }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>
                ⚠️ Common Mistakes to Avoid
              </h3>
              <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>
                {info.commonErrors}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div style={{
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
          📚 Study Strategy
        </h3>
        <p style={{ margin: 0, color: '#6c757d', lineHeight: '1.6' }}>
          Read this information carefully before attempting practice exercises. 
          Understanding the format and requirements will help you perform better.
        </p>
      </div>

      {/* Navegación */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        gap: '1rem'
      }}>
        {part > 1 ? (
          <button
            onClick={() => router.push(backLink)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#cbd5e0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#e2e8f0'}
          >
            ← Previous Part
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={() => router.push(homeLink)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#c6f6d5',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#9ae6b4'}
          onMouseOut={(e) => e.currentTarget.style.background = '#c6f6d5'}
        >
          📚 Back to Index
        </button>

        {part < 4 ? (
          <button
            onClick={() => router.push(nextLink)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#cbd5e0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#e2e8f0'}
          >
            Next Part →
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
