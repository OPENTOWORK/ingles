import DynamicExamPage from '@/components/DynamicExamPage';
import exams from '@/data/exams';

// Generate static paths for all exam parts
export async function generateStaticParams() {
  const paths = [];
  
  // Generate paths for all levels, exams, and parts
  Object.keys(exams).forEach(level => {
    Object.keys(exams[level]).forEach(exam => {
      Object.keys(exams[level][exam]).forEach(part => {
        paths.push({
          level,
          exam,
          part
        });
      });
    });
  });
  
  return paths;
}

export default function DynamicExamRoute() {
  return <DynamicExamPage />;
}