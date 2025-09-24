'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace('/login');
      else setAuthLoading(false);
    })();
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/contacto/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      toast.success('✅ Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } else {
      toast.error('❌ Failed to send message.');
    }
  };

  if (authLoading) {
    return (
      <main className="shell contacto-page center">
        <div className="loader" aria-label="Cargando" />
      </main>
    );
  }

  return (
    <main className="shell contacto-page">
      <header className="header">
        <h1>📩 Contact Us</h1>
        <p>Get in touch with us. We'd love to hear from you!</p>
      </header>

      <section className="contact-section">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              required
              rows={6}
              className="form-textarea"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>

      <GlobalStyles />
    </main>
  );
}

// ====== Estilos (styled-jsx global + locales) ======
function GlobalStyles() {
  return (
    <style jsx global>{`
      .contacto-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell{min-height:100svh;max-width:1100px;margin:0 auto;padding:32px 20px}
      .center{display:grid;place-items:center}
      .header h1{font-size:44px;margin:0 0 6px;color:var(--text)}
      .header p{margin:0;color:#666}
      .contact-section{margin:22px 0;padding:24px;border:1px solid #eaeaea;border-radius:16px;background:var(--card);box-shadow:0 2px 6px rgba(0,0,0,0.1)}
      .contact-form{display:flex;flex-direction:column;gap:20px}
      .form-group{display:flex;flex-direction:column}
      .form-input,.form-textarea{padding:12px 16px;font-size:16px;border:1px solid #eaeaea;border-radius:12px;background:white;color:var(--text);outline:none;transition:border-color .2s,box-shadow .2s}
      .form-input:focus,.form-textarea:focus{border-color:#0070f3;box-shadow:0 0 0 6px rgba(0,112,243,.35)}
      .form-textarea{resize:vertical;min-height:120px;font-family:inherit}
      .submit-btn{padding:14px 20px;background:#0070f3;color:white;font-weight:600;border:none;border-radius:12px;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 10px 24px rgba(0,112,243,.35)}
      .submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,112,243,.4)}
      .submit-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none}
      .loader{width:48px;height:48px;border-radius:50%;border:3px solid rgba(0,112,243,.2);border-top-color:#0070f3;animation:spin 1s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
  );
}
