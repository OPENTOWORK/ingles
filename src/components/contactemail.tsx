import * as React from 'react';

interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
}

const ContactEmail: React.FC<ContactEmailProps> = ({ name, email, message }) => (
  <div style={{ fontFamily: 'Segoe UI, sans-serif' }}>
    <h1>Nuevo mensaje de contacto</h1>
    <p><strong>Nombre:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Mensaje:</strong></p>
    <p>{message}</p>
  </div>
);

export default ContactEmail;
