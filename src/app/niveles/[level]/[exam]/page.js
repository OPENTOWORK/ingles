import DynamicExamHomePage from '@/components/DynamicExamHomePage';
import exams from '@/data/exams';

// Generate static paths for all exams
export async function generateStaticParams() {
  const paths = [];
  
  // Generate paths for all levels and exams
  Object.keys(exams).forEach(level => {
    Object.keys(exams[level]).forEach(exam => {
      paths.push({
        level,
        exam
      });
    });
  });
  
  return paths;
}

export default function DynamicExamRoute() {
  return <DynamicExamHomePage />;
}