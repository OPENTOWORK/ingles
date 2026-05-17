import * as React from 'react';

export interface SupportTicketEmailProps {
  name: string;
  email: string;
  userType: string;
  subject: string;
  message: string;
  status: string;
  topic: string;
}

const SupportTicketEmail: React.FC<SupportTicketEmailProps> = ({
  name,
  email,
  userType,
  subject,
  message,
  status,
  topic,
}) => (
  <div style={{ fontFamily: 'Segoe UI, sans-serif', color: '#1e293b', lineHeight: 1.5 }}>
    <h1 style={{ fontSize: '20px', margin: '0 0 12px' }}>Nuevo ticket de soporte</h1>
    <p style={{ margin: '0 0 8px' }}>
      <strong>Asunto:</strong> {subject}
    </p>
    <p style={{ margin: '0 0 8px' }}>
      <strong>Nombre:</strong> {name}
    </p>
    <p style={{ margin: '0 0 8px' }}>
      <strong>Email del usuario:</strong>{' '}
      <a href={`mailto:${email}`}>{email}</a>
    </p>
    <p style={{ margin: '0 0 8px' }}>
      <strong>Tipo de usuario:</strong> {userType}
    </p>
    <p style={{ margin: '0 0 8px' }}>
      <strong>Estado:</strong> {status}
    </p>
    <p style={{ margin: '0 0 8px' }}>
      <strong>Tema:</strong> {topic}
    </p>
    <p style={{ margin: '0 0 4px' }}>
      <strong>Mensaje:</strong>
    </p>
    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message}</p>
  </div>
);

export default SupportTicketEmail;
