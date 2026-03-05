/**
 * GAMBIARRA: gera um HTML com todos os dados das tabelas para visualização.
 * Rodar: node scripts/view-seed-data.js
 * Depois abrir: seed-data-view.html no navegador
 * Pode apagar a pasta scripts/ e o arquivo seed-data-view.html quando não precisar mais.
 */

const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

const config = require(path.join(__dirname, '../src/config/config.js')).development;
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port || 5432,
  dialect: config.dialect,
  logging: false,
});

const TABLES = [
  { name: 'users', title: 'Users' },
  { name: 'categories', title: 'Categories' },
  { name: 'tags', title: 'Tags' },
  { name: 'games', title: 'Games' },
  { name: 'orders', title: 'Orders' },
  { name: 'order_items', title: 'Order Items' },
];

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtmlRow(cells, isHeader) {
  const tag = isHeader ? 'th' : 'td';
  return '<tr>' + cells.map(c => `<${tag}>${escapeHtml(c)}</${tag}>`).join('') + '</tr>';
}

async function main() {
  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dados do banco (seed) - Gambiarra</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; margin: 20px; background: #1a1a2e; color: #eee; }
    h1 { color: #e94560; font-size: 1.4rem; margin-bottom: 4px; }
    .hint { color: #888; font-size: 0.85rem; margin-bottom: 24px; }
    section { margin-bottom: 40px; }
    h2 { color: #0f3460; background: #16213e; padding: 10px 14px; border-radius: 8px; font-size: 1.1rem; }
    .table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #16213e; }
    table { width: 100%; border-collapse: collapse; background: #16213e; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #1a1a2e; }
    th { background: #0f3460; color: #e94560; font-weight: 600; white-space: nowrap; }
    tr:hover { background: #1f2b4d; }
    .count { color: #888; font-size: 0.9rem; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Dados do banco (seed)</h1>
  <p class="hint">Gambiarra temporária – pode apagar scripts/ e este arquivo depois.</p>
`;

  for (const { name, title } of TABLES) {
    const [rows] = await sequelize.query(`SELECT * FROM ${name} ORDER BY id`);
    const cols = rows.length ? Object.keys(rows[0]) : [];
    const headerRow = buildHtmlRow(cols, true);
    const dataRows = rows.map(r => buildHtmlRow(cols.map(c => r[c])));
    html += `
  <section>
    <h2>${title}</h2>
    <p class="count">${rows.length} registro(s)</p>
    <div class="table-wrap">
      <table>
        <thead>${headerRow}</thead>
        <tbody>${dataRows.join('')}</tbody>
      </table>
    </div>
  </section>
`;
  }

  html += `
</body>
</html>`;

  const outPath = path.join(__dirname, '..', 'seed-data-view.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Arquivo gerado: seed-data-view.html');
  console.log('Abra esse arquivo no navegador para ver os dados.');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
