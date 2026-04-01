const fs = require('fs');
const path = require('path');

// Función para corregir una página de parte específica
function fixPartPage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extraer información de la ruta
    const pathParts = filePath.split('/');
    const level = pathParts[pathParts.indexOf('niveles') + 1].toUpperCase();
    const partNumber = pathParts[pathParts.length - 2].replace('part-', '');
    const section = pathParts.includes('listening') ? 'listening' : 
                   pathParts.includes('speaking') ? 'speaking' : 
                   pathParts.includes('writing') ? 'writing' : 'reading';
    
    console.log(`Processing: ${level} - ${section} - Part ${partNumber}`);
    
    // Verificar si ya tiene useTranslation importado
    if (!content.includes('useTranslation')) {
      // Agregar import de useTranslation
      content = content.replace(
        "'use client';\nimport { useRouter } from 'next/navigation';",
        "'use client';\nimport { useRouter } from 'next/navigation';\nimport { useTranslation } from '@/hooks/useTranslation';"
      );
      
      // Agregar useTranslation hook
      content = content.replace(
        'export default function TheoryPage() {\n  const router = useRouter();',
        'export default function TheoryPage() {\n  const router = useRouter();\n  const { t } = useTranslation();'
      );
    }
    
    // Determinar las claves de traducción según el nivel y sección
    let titleKey, descriptionKey, tipsKey, errorsKey;
    
    if (level === 'A1' || level === 'A2') {
      if (section === 'reading') {
        titleKey = `${level.toLowerCase()}Part${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}Part${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}Part${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}Part${partNumber}CommonErrors`;
      } else if (section === 'listening') {
        titleKey = `${level.toLowerCase()}ListeningPart${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}ListeningPart${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}ListeningPart${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}ListeningPart${partNumber}CommonErrors`;
      } else if (section === 'speaking') {
        titleKey = `${level.toLowerCase()}SpeakingPart${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}SpeakingPart${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}SpeakingPart${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}SpeakingPart${partNumber}CommonErrors`;
      }
    } else {
      // B1, B2, C1, C2
      if (section === 'reading') {
        titleKey = `${level.toLowerCase()}UoePart${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}UoePart${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}UoePart${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}UoePart${partNumber}CommonErrors`;
      } else if (section === 'listening') {
        titleKey = `${level.toLowerCase()}ListeningPart${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}ListeningPart${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}ListeningPart${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}ListeningPart${partNumber}CommonErrors`;
      } else if (section === 'speaking') {
        titleKey = `${level.toLowerCase()}SpeakingPart${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}SpeakingPart${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}SpeakingPart${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}SpeakingPart${partNumber}CommonErrors`;
      } else if (section === 'writing') {
        titleKey = `${level.toLowerCase()}WritingPart${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}WritingPart${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}WritingPart${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}WritingPart${partNumber}CommonErrors`;
      }
    }
    
    // Reemplazar el uso de partInfo con traducciones
    const newInfoObject = `const info = {
    title: t.${titleKey},
    description: t.${descriptionKey},
    tips: t.${tipsKey},
    commonErrors: t.${errorsKey}
  };`;
    
    // Buscar y reemplazar la línea que usa partInfo
    const partInfoRegex = /const info = partInfo\[part\] \|\| \{\};/;
    if (partInfoRegex.test(content)) {
      content = content.replace(partInfoRegex, newInfoObject);
    } else {
      // Si no encuentra el patrón exacto, buscar variaciones
      const altRegex = /const info = partInfo\[.*?\] \|\| \{\};/;
      if (altRegex.test(content)) {
        content = content.replace(altRegex, newInfoObject);
      }
    }
    
    // Reemplazar textos hardcodeados con traducciones
    content = content.replace(/📋 What is this part\?/g, '{t.whatIsThisPart}');
    content = content.replace(/💡 Tips for Success/g, '{t.tipsForSuccess}');
    content = content.replace(/⚠️ Common Mistakes to Avoid/g, '{t.commonMistakes}');
    content = content.replace(/📚 Study Strategy/g, '{t.studyStrategy}');
    content = content.replace(/Read this information carefully before attempting practice exercises\. \n          Understanding the format and requirements will help you perform better\./g, '{t.studyStrategyText}');
    content = content.replace(/← Previous Part/g, '{t.previousPart}');
    content = content.replace(/Next Part →/g, '{t.nextPart}');
    content = content.replace(/📚 Back to Index/g, '{t.backToIndex}');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${path.relative(process.cwd(), filePath)}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Función recursiva para encontrar todos los archivos page.js de partes
function findPartPageFiles(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Saltar carpetas que empiecen con exam-
        if (!item.startsWith('exam-')) {
          files.push(...findPartPageFiles(fullPath));
        }
      } else if (item === 'page.js') {
        // Incluir archivos page.js que estén en carpetas de partes
        const pathStr = fullPath.replace(/\\/g, '/');
        if (pathStr.includes('/part-') || pathStr.includes('/[part]/')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Ignorar errores de directorios inaccesibles
  }
  
  return files;
}

// Ejecutar correcciones para todos los niveles
const nivelesDir = path.join(__dirname, 'src', 'app', 'niveles');
const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

console.log('🔧 Starting to fix all part pages...\n');

let totalFiles = 0;

for (const level of levels) {
  const levelDir = path.join(nivelesDir, level);
  console.log(`📁 Processing ${level.toUpperCase()}...`);
  
  const partPageFiles = findPartPageFiles(levelDir);
  console.log(`   Found ${partPageFiles.length} part page files`);
  
  for (const file of partPageFiles) {
    fixPartPage(file);
    totalFiles++;
  }
  
  console.log(`✅ ${level.toUpperCase()} completed\n`);
}

console.log(`🎉 All done! Fixed ${totalFiles} part page files across all levels.`);
console.log('\n📝 Note: You may need to add missing translations to src/utils/translations.js');
console.log('   for any parts that don\'t have translations yet.');
