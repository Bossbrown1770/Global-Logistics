const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'config.template.js');
const outputPath = path.join(__dirname, 'config.js');

let template = fs.readFileSync(templatePath, 'utf8');
template = template.replace(/__SUPABASE_URL__/g, process.env.SUPABASE_URL || '');
template = template.replace(/__SUPABASE_ANON_KEY__/g, process.env.SUPABASE_ANON_KEY || '');
fs.writeFileSync(outputPath, template, 'utf8');

console.log('✅ config.js generated');