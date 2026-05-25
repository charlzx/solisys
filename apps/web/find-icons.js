import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

const INVALID_ICONS = ['ChevronDown', 'ChevronUp', 'ChevronRight', 'ChevronLeft', 'GitCompare'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);
let foundCount = 0;

console.log('--- Scanning all files for invalid Phosphor imports ---');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@phosphor-icons/react')) {
    const matches = [];
    INVALID_ICONS.forEach(icon => {
      const regex = new RegExp(`import\\s+{[^}]*\\b${icon}\\b[^}]*}\\s+from\\s+['"]@phosphor-icons/react['"]`, 's');
      if (regex.test(content)) {
        matches.push(icon);
      }
    });

    if (matches.length > 0) {
      foundCount++;
      const relative = path.relative(__dirname, file);
      console.log(`[FOUND] ${relative}: matches [${matches.join(', ')}]`);
    }
  }
});

console.log(`--- Total files with invalid imports: ${foundCount} ---`);
