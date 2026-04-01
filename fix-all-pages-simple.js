const fs = require('fs');
const path = require('path');

// Función para corregir una página específica
function fixPage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Solo procesar si tiene partInfo
    if (!content.includes('partInfo[part]')) {
      return;
    }
    
    // Extraer información de la ruta
    const pathParts = filePath.replace(/\\/g, '/').split('/');
    const levelIndex = pathParts.indexOf('niveles');
    const level = pathParts[levelIndex + 1].toUpperCase();
    const partNumber = pathParts[pathParts.length - 2].replace('part-', '');
    const section = pathParts.includes('listening') ? 'listening' : 
                   pathParts.includes('speaking') ? 'speaking' : 
                   pathParts.includes('writing') ? 'writing' : 'reading';
    
    console.log(`Processing: ${level} - ${section} - Part ${partNumber}`);
    
    // Determinar las claves de traducción
    let titleKey, descriptionKey, tipsKey, errorsKey;
    
    if (level === 'A1' || level === 'A2') {
      if (section === 'reading') {
        titleKey = `${level.toLowerCase()}Part${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}Part${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}Part${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}Part${partNumber}CommonErrors`;
      } else {
        titleKey = `${level.toLowerCase()}${section.charAt(0).toUpperCase() + section.slice(1)}Part${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}${section.charAt(0).toUpperCase() + section.slice(1)}Part${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}${section.charAt(0).toUpperCase() + section.slice(1)}Part${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}${section.charAt(0).toUpperCase() + section.slice(1)}Part${partNumber}CommonErrors`;
      }
    } else {
      // B1, B2, C1, C2
      if (section === 'reading') {
        titleKey = `${level.toLowerCase()}UoePart${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}UoePart${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}UoePart${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}UoePart${partNumber}CommonErrors`;
      } else {
        titleKey = `${level.toLowerCase()}${section.charAt(0).toUpperCase() + section.slice(1)}Part${partNumber}Title`;
        descriptionKey = `${level.toLowerCase()}${section.charAt(0).toUpperCase() + section.slice(1)}Part${partNumber}Description`;
        tipsKey = `${level.toLowerCase()}${section.charAt(0).toUpperCase() + section.slice(1)}Part${partNumber}Tips`;
        errorsKey = `${level.toLowerCase()}${section.charAt(0).toUpperCase() + section.slice(1)}Part${partNumber}CommonErrors`;
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
    content = content.replace(
      /const info = partInfo\[.*?\] \|\| \{\};/,
      newInfoObject
    );
    
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

// Función para encontrar archivos page.js de partes
function findPartFiles(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!item.startsWith('exam-')) {
          files.push(...findPartFiles(fullPath));
        }
      } else if (item === 'page.js') {
        const pathStr = fullPath.replace(/\\/g, '/');
        if (pathStr.includes('/part-') || pathStr.includes('/[part]/')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Ignorar errores
  }
  
  return files;
}

// Ejecutar correcciones
const nivelesDir = path.join(__dirname, 'src', 'app', 'niveles');
const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

console.log('🔧 Starting to fix all part pages...\n');

let totalFiles = 0;

for (const level of levels) {
  const levelDir = path.join(nivelesDir, level);
  console.log(`📁 Processing ${level.toUpperCase()}...`);
  
  const partFiles = findPartFiles(levelDir);
  console.log(`   Found ${partFiles.length} part page files`);
  
  for (const file of partFiles) {
    fixPage(file);
    totalFiles++;
  }
  
  console.log(`✅ ${level.toUpperCase()} completed\n`);
}

console.log(`🎉 All done! Processed ${totalFiles} part page files across all levels.`);















