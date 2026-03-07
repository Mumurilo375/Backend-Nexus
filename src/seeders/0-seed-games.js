'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const gamesWithFixedIds = [
      { id: 1, title: 'Jogo de Aventura Demo', description: 'Um jogo de aventura para testes.', long_description: 'Descrição longa do jogo de aventura. Ideal para testar a aplicação.', release_date: new Date('2024-01-15'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 2, title: 'RPG Épico', description: 'RPG de fantasia para testes.', long_description: 'Explore um mundo de fantasia neste RPG de testes.', release_date: new Date('2024-03-01'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 3, title: 'Corrida Extreme', description: 'Jogo de corrida para testes.', long_description: 'Corridas emocionantes em pistas variadas.', release_date: new Date('2023-11-20'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 4, title: 'Dungeon Crawler', description: 'Explore masmorras e colete tesouros.', long_description: 'Um roguelike clássico com geração procedural de dungeons e combate tático.', release_date: new Date('2024-02-10'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 5, title: 'Space Explorer', description: 'Explore o espaço em naves customizáveis.', long_description: 'Simulador espacial com economia, combate e exploração de galáxias.', release_date: new Date('2023-09-05'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 6, title: 'Farm Simulator', description: 'Construa e administre sua fazenda.', long_description: 'Simulação de fazenda com cultivo, animais, clima e expansão.', release_date: new Date('2024-04-01'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 7, title: 'Shadow Realm', description: 'Terror psicológico em primeira pessoa.', long_description: 'Enfrente seus medos em um mundo distorcido cheio de criaturas sobrenaturais.', release_date: new Date('2023-10-31'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 8, title: 'Street Brawler', description: 'Lute nas ruas e desbloqueie golpes.', long_description: 'Jogo de luta 2D com diversos personagens e modos de jogo.', release_date: new Date('2024-01-20'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 9, title: 'Puzzle Master', description: 'Resolva quebra-cabeças desafiadores.', long_description: 'Centenas de níveis de puzzle com mecânicas únicas e visuais minimalistas.', release_date: new Date('2023-12-01'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { id: 10, title: 'Kingdom Builder', description: 'Construa seu reino e defenda-o.', long_description: 'Estratégia em tempo real com construção de cidades e batalhas em massa.', release_date: new Date('2024-05-15'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
    ];

    const gamesAutoIncrement = [
      { title: 'Neon Drift', description: 'Corrida futurista com visuais neon.', long_description: 'Arcade de corrida com trilha sonora eletrônica e pistas alucinantes.', release_date: new Date('2024-03-22'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Mystery Mansion', description: 'Resolva o mistério da mansão abandonada.', long_description: 'Aventura point-and-click com múltiplos finais e personagens memoráveis.', release_date: new Date('2023-08-12'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Titanfall Arena', description: 'Batalha em arenas com titãs.', long_description: 'FPS com mecânicas de mobilidade e mechas em partidas competitivas.', release_date: new Date('2024-06-01'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Village Survival', description: 'Sobreviva e construa em um mundo pós-apocalíptico.', long_description: 'Survival com crafting, base building e inimigos que evoluem com o tempo.', release_date: new Date('2024-02-28'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Rhythm Quest', description: 'Acerte os ritmos e desbloqueie músicas.', long_description: 'Jogo musical com dezenas de faixas e níveis de dificuldade progressivos.', release_date: new Date('2023-11-15'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Tower Defense Legends', description: 'Defenda sua base com torres e heróis.', long_description: 'TD com dezenas de torres, heróis upgradeáveis e modos infinitos.', release_date: new Date('2024-04-18'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Cyber Heist', description: 'Roubo em mundo cyberpunk.', long_description: 'Ação furtiva em cenários futuristas com múltiplas abordagens por missão.', release_date: new Date('2024-07-10'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Ocean Explorer', description: 'Explore o fundo do mar e descubra segredos.', long_description: 'Exploração submarina com criaturas, naufrágios e história envolvente.', release_date: new Date('2023-07-20'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Soccer Pro', description: 'Simulador de futebol realista.', long_description: 'Controle times, ligas e torneios com física e animações realistas.', release_date: new Date('2024-08-01'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Castle Siege', description: 'Assedie castelos ou defenda as muralhas.', long_description: 'Estratégia medieval com unidades, catapultas e batalhas épicas.', release_date: new Date('2024-01-08'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Pixel Quest', description: 'Aventura 2D em estilo retrô.', long_description: 'Metroidvania pixel art com mapa aberto e chefes desafiadores.', release_date: new Date('2023-12-25'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Last Stand', description: 'Zumbis e armas em onda infinita.', long_description: 'FPS de sobrevivência contra hordas com upgrade de armas entre rodadas.', release_date: new Date('2024-03-15'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Magic Academy', description: 'Aprenda magia e enfrente duelos.', long_description: 'RPG com sistema de magias, escolas elementais e torneios de feiticeiros.', release_date: new Date('2024-05-30'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Racing Legends', description: 'Carros clássicos em pistas icônicas.', long_description: 'Simulador de corrida com carros licenciados e física realista.', release_date: new Date('2024-09-12'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Stardust', description: 'Exploração espacial relaxante.', long_description: 'Colete recursos, construa estações e descubra novos sistemas estelares.', release_date: new Date('2023-06-01'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Haunted Hospital', description: 'Terror em um hospital abandonado.', long_description: 'Survival horror com pouca munição e criaturas que ouvem seus passos.', release_date: new Date('2024-10-01'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Cozy Café', description: 'Gerencie um café aconchegante.', long_description: 'Simulação casual de café com clientes, receitas e decoração.', release_date: new Date('2024-04-05'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Battle Royale Zero', description: '100 jogadores, um vencedor.', long_description: 'Battle royale com mapa grande, veículos e zona que encolhe.', release_date: new Date('2024-11-20'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: true, created_at: now, updated_at: now },
      { title: 'Legacy (inativo)', description: 'Jogo descontinuado para testes.', long_description: 'Usado apenas para testar listagem de jogos inativos.', release_date: new Date('2022-01-01'), cover_image_url: 'https://via.placeholder.com/460x215', is_active: false, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('games', gamesWithFixedIds, {});
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('games', 'id'), COALESCE(MAX(id), 1)) FROM games;"
    );
    await queryInterface.bulkInsert('games', gamesAutoIncrement, {});
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('games', 'id'), COALESCE(MAX(id), 1)) FROM games;"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('games', null, {});
  }
};
