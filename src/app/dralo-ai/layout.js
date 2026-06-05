import '@/styles/dralo-ai.css';
import DraloAiShell from '@/components/dralo/DraloAiShell';

export const metadata = {
  title: 'Dralo AI | English Practice',
  description:
    'Practise Use of English, Reading, Writing and Listening with AI-generated interactive exercises.',
};

export default function DraloAiLayout({ children }) {
  return <DraloAiShell>{children}</DraloAiShell>;
}
