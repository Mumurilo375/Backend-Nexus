/**
 * Visualizador Interativo de Relações do Banco de Dados
 * Gera um HTML com 3 modos: Grafo, Exploração e Resumo
 * Rodar: node scripts/view-relationships.js
 * Depois abrir: relationships-view.html no navegador
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

// Mapeamento completo de relações entre tabelas
const RELATIONSHIPS = {
  users: {
    hasMany: [
      { table: 'reviews', fk: 'user_id', description: 'Avaliações feitas' },
      { table: 'review_votes', fk: 'user_id', description: 'Votos em avaliações' },
      { table: 'cart_items', fk: 'user_id', description: 'Itens no carrinho' },
      { table: 'wishlists', fk: 'user_id', description: 'Lista de desejos' },
      { table: 'orders', fk: 'user_id', description: 'Pedidos realizados' },
      { table: 'delivered_keys', fk: 'user_id', description: 'Chaves recebidas' }
    ]
  },
  games: {
    hasMany: [
      { table: 'game_images', fk: 'game_id', description: 'Galeria de imagens' },
      { table: 'reviews', fk: 'game_id', description: 'Avaliações recebidas' },
      { table: 'wishlists', fk: 'game_id', description: 'Em listas de desejos' },
      { table: 'game_platform_listings', fk: 'game_id', description: 'Listagens por plataforma' },
      { table: 'game_categories', fk: 'game_id', description: 'Categorias (pivot)' },
      { table: 'game_tags', fk: 'game_id', description: 'Tags (pivot)' }
    ]
  },
  platforms: {
    hasMany: [
      { table: 'game_platform_listings', fk: 'platform_id', description: 'Jogos disponíveis' }
    ]
  },
  game_platform_listings: {
    belongsTo: [
      { table: 'games', fk: 'game_id', description: 'Jogo' },
      { table: 'platforms', fk: 'platform_id', description: 'Plataforma' }
    ],
    hasMany: [
      { table: 'game_keys', fk: 'listing_id', description: 'Chaves disponíveis' },
      { table: 'cart_items', fk: 'listing_id', description: 'Em carrinhos' },
      { table: 'order_items', fk: 'listing_id', description: 'Em pedidos' },
      { table: 'promotion_listings', fk: 'listing_id', description: 'Promoções aplicadas' }
    ]
  },
  game_keys: {
    belongsTo: [
      { table: 'game_platform_listings', fk: 'listing_id', description: 'Listagem' }
    ],
    hasOne: [
      { table: 'order_items', fk: 'game_key_id', description: 'Item do pedido' },
      { table: 'delivered_keys', fk: 'game_key_id', description: 'Chave entregue' }
    ]
  },
  categories: {
    hasMany: [
      { table: 'game_categories', fk: 'category_id', description: 'Jogos (pivot)' }
    ]
  },
  tags: {
    hasMany: [
      { table: 'game_tags', fk: 'tag_id', description: 'Jogos (pivot)' }
    ]
  },
  game_categories: {
    belongsTo: [
      { table: 'games', fk: 'game_id', description: 'Jogo' },
      { table: 'categories', fk: 'category_id', description: 'Categoria' }
    ]
  },
  game_tags: {
    belongsTo: [
      { table: 'games', fk: 'game_id', description: 'Jogo' },
      { table: 'tags', fk: 'tag_id', description: 'Tag' }
    ]
  },
  reviews: {
    belongsTo: [
      { table: 'games', fk: 'game_id', description: 'Jogo avaliado' },
      { table: 'users', fk: 'user_id', description: 'Autor' }
    ],
    hasMany: [
      { table: 'review_votes', fk: 'review_id', description: 'Votos recebidos' }
    ]
  },
  review_votes: {
    belongsTo: [
      { table: 'reviews', fk: 'review_id', description: 'Avaliação' },
      { table: 'users', fk: 'user_id', description: 'Usuário que votou' }
    ]
  },
  cart_items: {
    belongsTo: [
      { table: 'users', fk: 'user_id', description: 'Usuário' },
      { table: 'game_platform_listings', fk: 'listing_id', description: 'Listagem' }
    ]
  },
  wishlists: {
    belongsTo: [
      { table: 'users', fk: 'user_id', description: 'Usuário' },
      { table: 'games', fk: 'game_id', description: 'Jogo' }
    ]
  },
  orders: {
    belongsTo: [
      { table: 'users', fk: 'user_id', description: 'Cliente' }
    ],
    hasMany: [
      { table: 'order_items', fk: 'order_id', description: 'Itens do pedido' }
    ]
  },
  order_items: {
    belongsTo: [
      { table: 'orders', fk: 'order_id', description: 'Pedido' },
      { table: 'game_platform_listings', fk: 'listing_id', description: 'Listagem' },
      { table: 'game_keys', fk: 'game_key_id', description: 'Chave reservada' }
    ],
    hasOne: [
      { table: 'delivered_keys', fk: 'order_item_id', description: 'Chave entregue' }
    ]
  },
  delivered_keys: {
    belongsTo: [
      { table: 'users', fk: 'user_id', description: 'Usuário' },
      { table: 'order_items', fk: 'order_item_id', description: 'Item do pedido' },
      { table: 'game_keys', fk: 'game_key_id', description: 'Chave' }
    ]
  },
  promotions: {
    hasMany: [
      { table: 'promotion_listings', fk: 'promotion_id', description: 'Listagens em promoção' }
    ]
  },
  promotion_listings: {
    belongsTo: [
      { table: 'promotions', fk: 'promotion_id', description: 'Promoção' },
      { table: 'game_platform_listings', fk: 'listing_id', description: 'Listagem' }
    ]
  }
};

// Configuração de cores e metadados por tipo de tabela
const TABLE_TYPES = {
  core: { tables: ['users', 'games', 'platforms'], color: '#e94560', label: 'Núcleo' },
  commerce: { tables: ['orders', 'order_items', 'cart_items', 'game_platform_listings', 'game_keys'], color: '#4ba3c3', label: 'Comércio' },
  content: { tables: ['game_images', 'categories', 'tags', 'promotions'], color: '#f39c12', label: 'Conteúdo' },
  social: { tables: ['reviews', 'review_votes', 'wishlists'], color: '#9b59b6', label: 'Social' },
  pivot: { tables: ['game_categories', 'game_tags', 'promotion_listings'], color: '#7f8c8d', label: 'Pivot' },
  tracking: { tables: ['delivered_keys'], color: '#1abc9c', label: 'Tracking' }
};

function getTableType(tableName) {
  for (const [type, config] of Object.entries(TABLE_TYPES)) {
    if (config.tables.includes(tableName)) {
      return { type, ...config };
    }
  }
  return { type: 'other', color: '#95a5a6', label: 'Outro' };
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJs(str) {
  if (str == null) return 'null';
  return JSON.stringify(str);
}

async function fetchAllData() {
  const data = {};
  const tables = Object.keys(RELATIONSHIPS);
  
  for (const table of tables) {
    const [rows] = await sequelize.query(`SELECT * FROM ${table} LIMIT 100`);
    data[table] = rows;
  }
  
  return data;
}

async function calculateStats(data) {
  const stats = {
    tables: {},
    relationships: {},
    totals: {
      records: 0,
      connections: 0
    }
  };

  const idSets = {};
  for (const [table, rows] of Object.entries(data)) {
    idSets[table] = new Set(rows.map(r => r.id).filter(v => v != null));
  }
  
  for (const [table, rows] of Object.entries(data)) {
    const typeInfo = getTableType(table);
    stats.tables[table] = {
      count: rows.length,
      type: typeInfo.type,
      color: typeInfo.color,
      hasData: rows.length > 0
    };
    stats.totals.records += rows.length;
    
    // Contar conexões reais por tipo de relacionamento
    const rels = RELATIONSHIPS[table] || {};
    const relationGroups = [
      { type: 'hasMany', list: rels.hasMany || [] },
      { type: 'hasOne', list: rels.hasOne || [] },
      { type: 'belongsTo', list: rels.belongsTo || [] }
    ];

    for (const group of relationGroups) {
      for (const rel of group.list) {
        const key = `${table}:${rel.table}:${rel.fk}:${group.type}`;
        if (!stats.relationships[key]) {
          stats.relationships[key] = {
            from: table,
            to: rel.table,
            fk: rel.fk,
            description: rel.description,
            relationType: group.type,
            count: 0
          };
        }

        let relationCount = 0;
        if (group.type === 'belongsTo' || group.type === 'hasOne') {
          // FK fica na tabela de origem
          const targetIds = idSets[rel.table] || new Set();
          relationCount = rows.reduce((acc, row) => {
            const fkValue = row[rel.fk];
            return acc + (fkValue != null && targetIds.has(fkValue) ? 1 : 0);
          }, 0);
        } else {
          // hasMany: FK fica na tabela de destino
          const sourceIds = idSets[table] || new Set();
          const targetRows = data[rel.table] || [];
          relationCount = targetRows.reduce((acc, row) => {
            const fkValue = row[rel.fk];
            return acc + (fkValue != null && sourceIds.has(fkValue) ? 1 : 0);
          }, 0);
        }

        stats.relationships[key].count = relationCount;
        stats.totals.connections += relationCount;
      }
    }
  }
  
  return stats;
}

function generateGraphData(stats) {
  const nodes = [];
  const dedupedEdges = {};
  
  // Nodes
  for (const [table, info] of Object.entries(stats.tables)) {
    nodes.push({
      id: table,
      label: table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: info.count,
      color: info.color,
      type: info.type,
      // Tamanho maior para leitura no grafo mesmo em tabelas com poucos registros.
      size: Math.max(64, Math.min(170, 64 + Math.sqrt(info.count) * 8))
    });
  }
  
  // Edges
  for (const rel of Object.values(stats.relationships)) {
    const pairKey = [rel.from, rel.to].sort().join('::');
    if (!dedupedEdges[pairKey]) {
      dedupedEdges[pairKey] = {
        from: rel.from,
        to: rel.to,
        labels: [rel.fk],
        descriptions: [rel.description],
        relationTypes: [rel.relationType],
        count: rel.count
      };
    } else {
      dedupedEdges[pairKey].labels.push(rel.fk);
      dedupedEdges[pairKey].descriptions.push(rel.description);
      dedupedEdges[pairKey].relationTypes.push(rel.relationType);
      dedupedEdges[pairKey].count += rel.count;
    }
  }

  const edges = Object.values(dedupedEdges).map(edge => ({
    from: edge.from,
    to: edge.to,
    label: edge.labels.join(', '),
    description: edge.descriptions.join(' | '),
    relationType: edge.relationTypes.join('/'),
    count: edge.count,
    width: Math.max(1.5, Math.min(6, (edge.count || 1) / 8)),
    isWeak: edge.count === 0
  }));
  
  return { nodes, edges };
}

function buildExplorationData(data) {
  const exploration = {};
  
  for (const [table, rows] of Object.entries(data)) {
    exploration[table] = rows.map(row => {
      const relations = {};
      const rels = RELATIONSHIPS[table] || {};
      const allRels = [...(rels.hasMany || []), ...(rels.hasOne || []), ...(rels.belongsTo || [])];
      
      for (const rel of allRels) {
        if (row[rel.fk] != null) {
          relations[rel.table] = {
            fk: rel.fk,
            value: row[rel.fk],
            description: rel.description
          };
        }
      }
      
      return {
        id: row.id,
        data: row,
        relations
      };
    });
  }
  
  return exploration;
}

function sensitiveField(fieldName) {
  const sensitive = ['password_hash', 'key_value', 'cpf'];
  return sensitive.some(s => fieldName.includes(s));
}

function formatFieldValue(key, value) {
  if (value == null) return '<span class="null">NULL</span>';
  if (sensitiveField(key)) {
    return `<span class="sensitive" data-value="${escapeHtml(value)}">••••••••</span>`;
  }
  if (typeof value === 'boolean') {
    return `<span class="bool ${value}">${value}</span>`;
  }
  if (typeof value === 'number') {
    return `<span class="num">${value}</span>`;
  }
  if (key.match(/_(at|date)$/)) {
    return `<span class="date">${new Date(value).toLocaleString('pt-BR')}</span>`;
  }
  if (String(value).length > 100) {
    return `<span class="long-text" title="${escapeHtml(value)}">${escapeHtml(String(value).slice(0, 100))}...</span>`;
  }
  return escapeHtml(value);
}

async function main() {
  console.log('🔍 Buscando dados do banco...');
  const data = await fetchAllData();
  
  console.log('📊 Calculando estatísticas...');
  const stats = await calculateStats(data);
  
  console.log('🕸️  Gerando grafo de relações...');
  const graph = generateGraphData(stats);
  
  console.log('🔗 Preparando dados de exploração...');
  const exploration = buildExplorationData(data);
  
  console.log('🎨 Gerando HTML...');
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visualizador de Relações - Database</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    
    /* Sidebar */
    .sidebar {
      width: 280px;
      background: #161b22;
      border-right: 1px solid #30363d;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid #30363d;
      background: #0d1117;
    }
    
    .sidebar-header h1 {
      font-size: 1.2rem;
      color: #58a6ff;
      margin-bottom: 4px;
    }
    
    .sidebar-header .subtitle {
      font-size: 0.85rem;
      color: #8b949e;
    }
    
    .mode-tabs {
      display: flex;
      padding: 12px;
      gap: 8px;
      border-bottom: 1px solid #30363d;
    }
    
    .mode-tab {
      flex: 1;
      padding: 8px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #8b949e;
      cursor: pointer;
      font-size: 0.85rem;
      text-align: center;
      transition: all 0.2s;
    }
    
    .mode-tab:hover {
      background: #1c2128;
      border-color: #58a6ff;
    }
    
    .mode-tab.active {
      background: #1f6feb;
      color: white;
      border-color: #1f6feb;
    }
    
    .tables-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    
    .table-item {
      padding: 10px 12px;
      margin-bottom: 6px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .table-item:hover {
      background: #1c2128;
      border-color: #58a6ff;
      transform: translateX(4px);
    }
    
    .table-item.active {
      background: #1c2128;
      border-color: #1f6feb;
      border-left: 3px solid #1f6feb;
    }
    
    .table-item .name {
      font-weight: 600;
      color: #c9d1d9;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .table-item .type-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 500;
    }
    
    .table-item .count {
      font-size: 0.8rem;
      color: #8b949e;
    }
    
    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .toolbar {
      padding: 16px 20px;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .search-box {
      flex: 1;
      padding: 8px 12px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #c9d1d9;
      font-size: 0.9rem;
    }
    
    .search-box:focus {
      outline: none;
      border-color: #58a6ff;
    }
    
    .toolbar-btn {
      padding: 8px 16px;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #c9d1d9;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    
    .toolbar-btn:hover {
      background: #30363d;
      border-color: #58a6ff;
    }
    
    .view-area {
      flex: 1;
      overflow: auto;
      padding: 20px;
      position: relative;
    }

    .graph-explore-layout {
      display: none;
      height: auto;
      gap: 14px;
      grid-template-rows: auto auto;
    }

    .graph-explore-layout.active {
      display: grid;
    }
    
    /* Graph View */
    #graph-container {
      width: 100%;
      height: 620px;
      min-height: 520px;
      position: relative;
      background: radial-gradient(circle at center, #161b22 0%, #0d1117 100%);
      border-radius: 12px;
      border: 1px solid #30363d;
      overflow: hidden;
    }
    
    #graph-svg {
      width: 100%;
      height: 100%;
    }
    
    .graph-node {
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .graph-node:hover circle {
      stroke-width: 3;
      filter: brightness(1.3);
    }
    
    .graph-edge {
      stroke: #30363d;
      stroke-width: 2;
      fill: none;
      opacity: 0.8;
    }

    .graph-edge.weak {
      stroke-dasharray: 6 5;
      opacity: 0.5;
    }
    
    .graph-edge.highlighted {
      stroke: #58a6ff;
      stroke-width: 2.5;
      opacity: 1;
    }
    
    .graph-label {
      fill: #c9d1d9;
      font-size: 11px;
      font-weight: 600;
      text-anchor: middle;
      pointer-events: none;
    }
    
    .graph-count {
      fill: #8b949e;
      font-size: 9px;
      text-anchor: middle;
      pointer-events: none;
    }
    
    /* Exploration View */
    .exploration-container {
      display: block;
      background: #11161e;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 14px;
      overflow: visible;
      min-height: 360px;
    }

    .exploration-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #58a6ff;
      margin-bottom: 10px;
    }
    
    .breadcrumb {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .breadcrumb-item {
      padding: 6px 12px;
      background: #21262d;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .breadcrumb-item:hover {
      background: #30363d;
    }
    
    .breadcrumb-separator {
      color: #8b949e;
    }
    
    .records-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
    }
    
    .record-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s;
    }
    
    .record-card:hover {
      border-color: #58a6ff;
      box-shadow: 0 4px 12px rgba(88, 166, 255, 0.15);
    }
    
    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #30363d;
    }
    
    .record-id {
      font-weight: 700;
      color: #58a6ff;
      font-size: 1.1rem;
    }
    
    .record-fields {
      margin-bottom: 12px;
    }
    
    .record-field {
      display: flex;
      padding: 6px 0;
      font-size: 0.85rem;
      border-bottom: 1px solid #21262d;
    }
    
    .record-field:last-child {
      border-bottom: none;
    }
    
    .field-key {
      flex: 0 0 140px;
      color: #8b949e;
      font-weight: 500;
    }
    
    .field-value {
      flex: 1;
      color: #c9d1d9;
      word-break: break-word;
    }
    
    .record-relations {
      padding-top: 12px;
      border-top: 1px solid #30363d;
    }
    
    .relations-title {
      font-size: 0.8rem;
      color: #8b949e;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .relation-link {
      display: inline-block;
      margin: 4px 6px 4px 0;
      padding: 4px 10px;
      background: #1f6feb;
      color: white;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }
    
    .relation-link:hover {
      background: #1a5bc5;
      transform: translateY(-1px);
    }
    
    /* Summary View */
    .summary-container {
      display: none;
    }
    
    .summary-container.active {
      display: block;
    }

    .summary-container {
      display: none;
      min-height: 100%;
    }

    .summary-container.active {
      display: block;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 20px;
    }
    
    .summary-card h3 {
      color: #58a6ff;
      font-size: 1rem;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .stat-item {
      padding: 12px;
      background: #0d1117;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: #8b949e;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #c9d1d9;
    }
    
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
    }
    
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }
    
    .top-list {
      list-style: none;
    }
    
    .top-list li {
      padding: 10px;
      background: #0d1117;
      border-radius: 6px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .top-list .rank {
      font-weight: 700;
      color: #58a6ff;
      margin-right: 12px;
    }
    
    .top-list .label {
      flex: 1;
      color: #c9d1d9;
    }
    
    .top-list .value {
      font-weight: 600;
      color: #8b949e;
    }
    
    /* Special field styles */
    .null {
      color: #6e7681;
      font-style: italic;
    }
    
    .bool {
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.8rem;
    }
    
    .bool.true {
      color: #3fb950;
      background: rgba(63, 185, 80, 0.1);
    }
    
    .bool.false {
      color: #f85149;
      background: rgba(248, 81, 73, 0.1);
    }
    
    .num {
      color: #79c0ff;
      font-weight: 500;
    }
    
    .date {
      color: #d2a8ff;
      font-size: 0.85rem;
    }
    
    .sensitive {
      cursor: pointer;
      color: #f85149;
      user-select: none;
    }
    
    .sensitive:hover::after {
      content: " 👁️";
    }
    
    .long-text {
      font-style: italic;
      color: #8b949e;
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    ::-webkit-scrollbar-track {
      background: #0d1117;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #30363d;
      border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #484f58;
    }
    
    /* Info panel */
    .info-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 16px;
      max-width: 300px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      display: none;
    }
    
    .info-panel.show {
      display: block;
    }
    
    .info-panel h4 {
      color: #58a6ff;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    
    .info-panel p {
      font-size: 0.8rem;
      color: #8b949e;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>🕸️ Visualizador de Relações</h1>
      <div class="subtitle">Database Explorer</div>
    </div>
    
    <div class="mode-tabs">
      <div class="mode-tab active" data-mode="graph">Grafo + Explorar</div>
      <div class="mode-tab" data-mode="summary">Resumo</div>
    </div>
    
    <div class="tables-list" id="tablesList"></div>
  </div>
  
  <!-- Main Content -->
  <div class="main-content">
    <div class="toolbar">
      <input type="text" class="search-box" id="searchBox" placeholder="Buscar em todas as tabelas...">
      <button class="toolbar-btn" id="toggleSensitive">👁️ Mostrar Sensíveis</button>
      <button class="toolbar-btn" id="resetView">🔄 Resetar</button>
    </div>
    
    <div class="view-area">
      <div id="graph-explore-layout" class="graph-explore-layout active">
        <!-- Graph View -->
        <div id="graph-container">
          <svg id="graph-svg"></svg>
        </div>

        <!-- Exploration always visible under graph -->
        <div class="exploration-container" id="exploration-view">
          <div class="exploration-title">Exploração de Relações</div>
          <div class="breadcrumb" id="breadcrumb"></div>
          <div class="records-grid" id="recordsGrid"></div>
        </div>
      </div>
      
      <!-- Summary View -->
      <div class="summary-container" id="summary-view">
        <div class="summary-grid">
          <div class="summary-card">
            <h3>📊 Estatísticas Gerais</h3>
            <div class="stat-item">
              <div class="stat-label">Total de Registros</div>
              <div class="stat-value" id="totalRecords">0</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total de Conexões</div>
              <div class="stat-value" id="totalConnections">0</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Tabelas</div>
              <div class="stat-value" id="totalTables">0</div>
            </div>
          </div>
          
          <div class="summary-card">
            <h3>🏆 Top Tabelas por Registros</h3>
            <ul class="top-list" id="topTables"></ul>
          </div>
          
          <div class="summary-card">
            <h3>🔗 Top Relações</h3>
            <ul class="top-list" id="topRelations"></ul>
          </div>
          
          <div class="summary-card">
            <h3>🎨 Tipos de Tabelas</h3>
            <div class="legend" id="typesLegend"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Info Panel -->
  <div class="info-panel" id="infoPanel">
    <h4 id="infoTitle"></h4>
    <p id="infoText"></p>
  </div>
  
  <script>
    // Data
    const GRAPH_DATA = ${JSON.stringify(graph)};
    const STATS = ${JSON.stringify(stats)};
    const EXPLORATION = ${JSON.stringify(exploration)};
    const ALL_DATA = ${JSON.stringify(data)};
    const TABLE_TYPES = ${JSON.stringify(TABLE_TYPES)};
    
    // State
    let currentMode = 'graph';
    let selectedTable = null;
    let showSensitive = false;
    let explorationPath = [];
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      initSidebar();
      initModeSwitch();
      initGraph();
      initExploration();
      initSummary();
      initToolbar();
      initSearch();
    });
    
    function initSidebar() {
      const tablesList = document.getElementById('tablesList');
      const sortedTables = Object.entries(STATS.tables)
        .sort((a, b) => b[1].count - a[1].count);
      
      sortedTables.forEach(([table, info]) => {
        const typeInfo = getTableTypeInfo(info.type);
        const item = document.createElement('div');
        item.className = 'table-item';
        item.dataset.table = table;
        item.innerHTML = \`
          <div class="name">
            <span>\${formatTableName(table)}</span>
            <span class="type-badge" style="background: \${info.color}20; color: \${info.color}">\${typeInfo.label}</span>
          </div>
          <div class="count">\${info.count} registro\${info.count !== 1 ? 's' : ''}</div>
        \`;
        item.onclick = () => selectTable(table);
        tablesList.appendChild(item);
      });
    }
    
    function initModeSwitch() {
      document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.onclick = () => {
          const mode = tab.dataset.mode;
          switchMode(mode);
        };
      });
    }
    
    function switchMode(mode) {
      currentMode = mode;
      
      // Update tabs
      document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
      });
      
      // Update views
      document.getElementById('graph-explore-layout').classList.toggle('active', mode === 'graph');
      document.getElementById('summary-view').classList.toggle('active', mode === 'summary');
      
      // Refresh exploration when entering graph mode
      if (mode === 'graph' && !explorationPath.length) {
        loadFirstTable();
      }

    }
    
    function initGraph() {
      const svg = document.getElementById('graph-svg');
      const container = document.getElementById('graph-container');
      const rect = container.getBoundingClientRect();
      const width = Math.max(900, Math.floor(rect.width));
      const height = Math.max(620, Math.floor(rect.height));
      svg.setAttribute('viewBox', \`0 0 \${width} \${height}\`);
      
      // Distribuição inicial em círculo para reduzir colisões logo no início.
      const ringRadius = Math.min(width, height) * 0.35;
      const nodes = GRAPH_DATA.nodes.map((n, index) => {
        const angle = (index / Math.max(1, GRAPH_DATA.nodes.length)) * Math.PI * 2;
        return ({
        ...n,
        x: width / 2 + Math.cos(angle) * ringRadius,
        y: height / 2 + Math.sin(angle) * ringRadius,
        vx: 0,
        vy: 0
      });
      });
      
      const edges = GRAPH_DATA.edges;
      
      // Draw edges
      edges.forEach(edge => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('graph-edge');
        if (edge.isWeak) line.classList.add('weak');
        line.style.strokeWidth = String(edge.width);
        line.dataset.from = edge.from;
        line.dataset.to = edge.to;
        svg.appendChild(line);
      });
      
      // Draw nodes
      nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('graph-node');
        g.dataset.table = node.id;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', node.size / 2);
        circle.setAttribute('fill', node.color);
        circle.setAttribute('stroke', '#c9d1d9');
        circle.setAttribute('stroke-width', '2');
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.classList.add('graph-label');
        label.setAttribute('dy', '4');
        label.textContent = node.label;
        
        const count = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        count.classList.add('graph-count');
        count.setAttribute('dy', '16');
        count.textContent = node.count;
        
        g.appendChild(circle);
        g.appendChild(label);
        g.appendChild(count);
        svg.appendChild(g);
        
        g.onclick = () => selectTable(node.id);
        g.onmouseenter = () => highlightConnections(node.id);
        g.onmouseleave = () => clearHighlight();
      });
      
      // Simulação física com anti-colisão para reduzir sobreposição.
      function simulate() {
        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 5000 / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;

            // Anti-overlap: empurra nós quando o raio mínimo não é respeitado.
            const minDist = (nodes[i].size / 2) + (nodes[j].size / 2) + 20;
            if (dist < minDist) {
              const overlap = (minDist - dist) / 2;
              const ox = (dx / dist) * overlap;
              const oy = (dy / dist) * overlap;
              nodes[i].x -= ox;
              nodes[i].y -= oy;
              nodes[j].x += ox;
              nodes[j].y += oy;
            }
          }
        }
        
        // Attraction along edges
        edges.forEach(edge => {
          const source = nodes.find(n => n.id === edge.from);
          const target = nodes.find(n => n.id === edge.to);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desired = 160;
            const force = (dist - desired) * 0.02;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });
        
        // Center gravity
        nodes.forEach(node => {
          const dx = width / 2 - node.x;
          const dy = height / 2 - node.y;
          node.vx += dx * 0.002;
          node.vy += dy * 0.002;
        });
        
        // Update positions
        nodes.forEach(node => {
          node.vx *= 0.86;
          node.vy *= 0.86;
          node.x += node.vx;
          node.y += node.vy;
          
          // Keep in bounds
          const margin = (node.size / 2) + 12;
          node.x = Math.max(margin, Math.min(width - margin, node.x));
          node.y = Math.max(margin, Math.min(height - margin, node.y));
        });
        
        // Update visual elements
        updateGraph();
      }
      
      function updateGraph() {
        // Update edges
        edges.forEach(edge => {
          const source = nodes.find(n => n.id === edge.from);
          const target = nodes.find(n => n.id === edge.to);
          if (source && target) {
            const line = svg.querySelector(\`.graph-edge[data-from="\${edge.from}"][data-to="\${edge.to}"]\`);
            if (line) {
              line.setAttribute('x1', source.x);
              line.setAttribute('y1', source.y);
              line.setAttribute('x2', target.x);
              line.setAttribute('y2', target.y);
            }
          }
        });
        
        // Update nodes
        nodes.forEach(node => {
          const g = svg.querySelector(\`.graph-node[data-table="\${node.id}"]\`);
          if (g) {
            g.setAttribute('transform', \`translate(\${node.x}, \${node.y})\`);
          }
        });
      }
      
      // Run simulation
      let frame = 0;
      const maxFrames = 550;
      const interval = setInterval(() => {
        simulate();
        frame++;
        if (frame >= maxFrames) clearInterval(interval);
      }, 16);
    }
    
    function highlightConnections(tableId) {
      const edges = document.querySelectorAll('.graph-edge');
      edges.forEach(edge => {
        if (edge.dataset.from === tableId || edge.dataset.to === tableId) {
          edge.classList.add('highlighted');
        }
      });
    }
    
    function clearHighlight() {
      document.querySelectorAll('.graph-edge').forEach(e => e.classList.remove('highlighted'));
    }
    
    function selectTable(table) {
      selectedTable = table;
      
      // Update sidebar
      document.querySelectorAll('.table-item').forEach(item => {
        item.classList.toggle('active', item.dataset.table === table);
      });
      
      // Show info
      const info = STATS.tables[table];
      const typeInfo = getTableTypeInfo(info.type);
      showInfo(formatTableName(table), \`\${info.count} registros • Tipo: \${typeInfo.label}\`);
      
      // Se estiver em resumo, volta para o layout principal para sincronizar a exploração.
      if (currentMode === 'summary') {
        switchMode('graph');
      }
      navigateToTable(table);
    }
    
    function initExploration() {
      if (!explorationPath.length) {
        loadFirstTable();
      }
    }
    
    function loadFirstTable() {
      const firstTable = Object.keys(STATS.tables).sort((a, b) => 
        STATS.tables[b].count - STATS.tables[a].count
      )[0];
      if (firstTable) {
        navigateToTable(firstTable);
      }
    }
    
    function navigateToTable(table, fromRecord = null) {
      if (fromRecord) {
        explorationPath.push({ table, fromRecord });
      } else {
        explorationPath = [{ table, fromRecord: null }];
      }
      renderExploration();
    }
    
    function renderExploration() {
      const current = explorationPath[explorationPath.length - 1];
      const records = EXPLORATION[current.table] || [];
      
      // Render breadcrumb
      const breadcrumb = document.getElementById('breadcrumb');
      breadcrumb.innerHTML = '';
      explorationPath.forEach((path, i) => {
        if (i > 0) {
          const sep = document.createElement('span');
          sep.className = 'breadcrumb-separator';
          sep.textContent = '›';
          breadcrumb.appendChild(sep);
        }
        const item = document.createElement('div');
        item.className = 'breadcrumb-item';
        item.textContent = formatTableName(path.table) + (path.fromRecord ? \` #\${path.fromRecord}\` : '');
        item.onclick = () => {
          explorationPath = explorationPath.slice(0, i + 1);
          renderExploration();
        };
        breadcrumb.appendChild(item);
      });
      
      // Render records
      const grid = document.getElementById('recordsGrid');
      grid.innerHTML = '';
      records.slice(0, 50).forEach(record => {
        const card = createRecordCard(current.table, record);
        grid.appendChild(card);
      });
    }
    
    function createRecordCard(table, record) {
      const card = document.createElement('div');
      card.className = 'record-card';
      
      let html = \`
        <div class="record-header">
          <div class="record-id">#\${record.id}</div>
          <span class="type-badge" style="background: \${STATS.tables[table].color}20; color: \${STATS.tables[table].color}">\${formatTableName(table)}</span>
        </div>
        <div class="record-fields">
      \`;
      
      // Show important fields (limit to 5)
      const importantFields = Object.entries(record.data)
        .filter(([key]) => !key.match(/(created_at|updated_at)/))
        .slice(0, 5);
      
      importantFields.forEach(([key, value]) => {
        html += \`
          <div class="record-field">
            <div class="field-key">\${key}</div>
            <div class="field-value">\${formatFieldValue(key, value)}</div>
          </div>
        \`;
      });
      
      html += '</div>';
      
      // Show relations
      const relations = Object.entries(record.relations || {});
      if (relations.length > 0) {
        html += '<div class="record-relations"><div class="relations-title">🔗 Relações</div>';
        relations.forEach(([relTable, rel]) => {
          html += \`<a class="relation-link" onclick="navigateToRelation('\${relTable}', \${rel.value})">\${formatTableName(relTable)} #\${rel.value}</a>\`;
        });
        html += '</div>';
      }
      
      card.innerHTML = html;
      return card;
    }
    
    function navigateToRelation(table, recordId) {
      navigateToTable(table, recordId);
    }
    
    function formatFieldValue(key, value) {
      if (value == null) return '<span class="null">NULL</span>';
      if (sensitiveField(key) && !showSensitive) {
        return '<span class="sensitive" onclick="toggleSensitiveValue(this)" data-value="' + escapeHtml(value) + '">••••••••</span>';
      }
      if (typeof value === 'boolean') {
        return '<span class="bool ' + value + '">' + value + '</span>';
      }
      if (typeof value === 'number') {
        return '<span class="num">' + value + '</span>';
      }
      if (key.match(/_(at|date)$/)) {
        return '<span class="date">' + new Date(value).toLocaleString('pt-BR') + '</span>';
      }
      if (String(value).length > 100) {
        return '<span class="long-text" title="' + escapeHtml(value) + '">' + escapeHtml(String(value).slice(0, 100)) + '...</span>';
      }
      return escapeHtml(value);
    }
    
    function sensitiveField(fieldName) {
      return ['password_hash', 'key_value', 'cpf'].some(s => fieldName.includes(s));
    }
    
    function toggleSensitiveValue(el) {
      if (el.textContent === '••••••••') {
        el.textContent = el.dataset.value;
      } else {
        el.textContent = '••••••••';
      }
    }
    
    function initSummary() {
      // Total stats
        document.getElementById('totalRecords').textContent = STATS.totals.records.toLocaleString('pt-BR');
      document.getElementById('totalConnections').textContent = STATS.totals.connections.toLocaleString('pt-BR');
      document.getElementById('totalTables').textContent = Object.keys(STATS.tables).length;
      
      // Top tables
      const topTables = Object.entries(STATS.tables)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);
      
      const topTablesList = document.getElementById('topTables');
      topTables.forEach(([table, info], i) => {
        const li = document.createElement('li');
        li.innerHTML = \`
          <span class="rank">#\${i + 1}</span>
          <span class="label">\${formatTableName(table)}</span>
          <span class="value">\${info.count}</span>
        \`;
        topTablesList.appendChild(li);
      });
      
      // Top relations
      const topRelations = Object.entries(STATS.relationships)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);
      
      const topRelationsList = document.getElementById('topRelations');
      topRelations.forEach(([key, rel], i) => {
        const li = document.createElement('li');
        li.innerHTML = \`
          <span class="rank">#\${i + 1}</span>
          <span class="label">\${formatTableName(rel.from)} → \${formatTableName(rel.to)}</span>
          <span class="value">\${rel.count}</span>
        \`;
        topRelationsList.appendChild(li);
      });
      
      // Types legend
      const typesLegend = document.getElementById('typesLegend');
      Object.entries(TABLE_TYPES).forEach(([type, config]) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = \`
          <div class="legend-color" style="background: \${config.color}"></div>
          <span>\${config.label}</span>
        \`;
        typesLegend.appendChild(item);
      });
    }
    
    function initToolbar() {
      document.getElementById('toggleSensitive').onclick = () => {
        showSensitive = !showSensitive;
        if (explorationPath.length) {
          renderExploration();
        }
        showInfo('Campos Sensíveis', showSensitive ? 'Visíveis' : 'Ocultos');
      };
      
      document.getElementById('resetView').onclick = () => {
        location.reload();
      };
    }
    
    function initSearch() {
      const searchBox = document.getElementById('searchBox');
      let timeout;
      searchBox.oninput = (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          performSearch(e.target.value);
        }, 300);
      };
    }
    
    function performSearch(query) {
      if (!query.trim()) return;
      
      const results = [];
      const lowerQuery = query.toLowerCase();
      
      Object.entries(ALL_DATA).forEach(([table, rows]) => {
        rows.forEach(row => {
          const matches = Object.entries(row).some(([key, value]) => {
            return String(value).toLowerCase().includes(lowerQuery);
          });
          if (matches) {
            results.push({ table, record: row });
          }
        });
      });
      
      showInfo('Busca', \`\${results.length} resultado(s) encontrado(s)\`);
      
      if (results.length > 0) {
        if (currentMode !== 'graph') {
          switchMode('graph');
        }
        const firstResult = results[0];
        selectTable(firstResult.table);
      }
    }
    
    function showInfo(title, text) {
      const panel = document.getElementById('infoPanel');
      document.getElementById('infoTitle').textContent = title;
      document.getElementById('infoText').textContent = text;
      panel.classList.add('show');
      setTimeout(() => panel.classList.remove('show'), 3000);
    }
    
    function formatTableName(table) {
      return table.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
    }
    
    function getTableTypeInfo(type) {
      return TABLE_TYPES[type] || { label: 'Outro', color: '#95a5a6' };
    }
    
    function escapeHtml(str) {
      if (str == null) return '';
      const div = document.createElement('div');
      div.textContent = String(str);
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
  
  const outPath = path.join(__dirname, '..', 'relationships-view.html');
  fs.writeFileSync(outPath, html, 'utf8');
  
  console.log('');
  console.log('✅ Arquivo gerado: relationships-view.html');
  console.log('📂 Abra esse arquivo no navegador para explorar as relações!');
  console.log('');
  console.log('Recursos disponíveis:');
  console.log('  🕸️  Modo Grafo - Visualização das conexões entre tabelas');
  console.log('  🔗 Modo Exploração - Navegue entre registros relacionados');
  console.log('  📊 Modo Resumo - Estatísticas e análises do banco');
  console.log('');
  
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  console.error(err.stack);
  process.exit(1);
});
