// Script para rodar os seeders na ordem correta
// Execute: node scripts/seed-all-in-order.js

const { execSync } = require('child_process');

const seeders = [
  'src/seeders/0-seed-games.js',
  'src/seeders/1-seed-platforms-and-listings-and-keys.js',
  'src/seeders/2-seed-categories.js',
  'src/seeders/3-seed-tags.js',
  'src/seeders/4-seed-users.js',
  'src/seeders/5-seed-orders.js',
  'src/seeders/6-seed-order-items.js',
];

function run(cmd) {
  console.log('Executando:', cmd);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error('Erro ao executar:', cmd);
    process.exit(1);
  }
}

console.log('Desfazendo todos os seeders...');
run('npx sequelize-cli db:seed:undo:all');

for (const seeder of seeders) {
  run(`npx sequelize-cli db:seed --seed ${seeder}`);
}

console.log('Todos os seeders executados com sucesso!');
