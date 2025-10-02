'use client';
import { useParams } from 'next/navigation';

export default function ExamPartPage() {
  const params = useParams();
  const part = parseInt(params.part);
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Exam 1 - Part {part}</h1>
      <p>Content for Part {part} will be added here.</p>
    </div>
  );
}
