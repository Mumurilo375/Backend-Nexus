'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const gameCategoryInput = [
      { title: 'Elden Ring', categories: ['RPG', 'Ação', 'Mundo Aberto', 'Fantasia Sombria', 'Soulslike'] },
      { title: 'Baldur\'s Gate 3', categories: ['RPG', 'Narrativo', 'Tático', 'Fantasia', 'Cooperativo'] },
      { title: 'Cyberpunk 2077', categories: ['RPG', 'Ação', 'Mundo Aberto', 'Ficção Científica', 'Narrativo'] },
      { title: 'The Witcher 3: Wild Hunt', categories: ['RPG', 'Ação', 'Mundo Aberto', 'Fantasia', 'Narrativo'] },
      { title: 'Sekiro: Shadows Die Twice', categories: ['Ação', 'Aventura', 'Samurai', 'Fantasia', 'Desafiador'] },
      { title: 'Red Dead Redemption 2', categories: ['Ação', 'Aventura', 'Mundo Aberto', 'Faroeste', 'Narrativo'] },
      { title: 'Grand Theft Auto V Enhanced', categories: ['Ação', 'Aventura', 'Mundo Aberto', 'Crime', 'Multiplayer'] },
      { title: 'Hogwarts Legacy', categories: ['RPG', 'Ação', 'Aventura', 'Mundo Aberto', 'Fantasia'] },
      { title: 'God of War', categories: ['Ação', 'Aventura', 'Mitologia', 'Narrativo', 'Single Player'] },
      { title: 'Resident Evil 4', categories: ['Survival Horror', 'Ação', 'Terror', 'Aventura', 'Narrativo'] },
      { title: 'Persona 5 Royal', categories: ['JRPG', 'RPG', 'Turnos', 'Narrativo', 'Anime'] },
      { title: 'It Takes Two', categories: ['Cooperativo', 'Aventura', 'Plataforma', 'Puzzle', 'Multiplayer'] },
      { title: 'Black Myth: Wukong', categories: ['Action RPG', 'Mitologia', 'Fantasia', 'Ação', 'Single Player'] },
      { title: 'Monster Hunter Wilds', categories: ['Ação', 'RPG', 'Cooperativo', 'Caça', 'Fantasia'] },
      { title: 'Clair Obscur: Expedition 33', categories: ['RPG', 'Turnos', 'Fantasia', 'Narrativo', 'Single Player'] },
      { title: 'Metaphor: ReFantazio', categories: ['JRPG', 'RPG', 'Fantasia', 'Turnos', 'Narrativo'] },
      { title: 'Dead by Daylight', categories: ['Terror', 'Multiplayer', 'Assimétrico', 'Sobrevivência', 'Online'] },
      { title: 'Stardew Valley', categories: ['RPG', 'Simulação', 'Fazenda', 'Indie', 'Casual'] },
      { title: 'Hades', categories: ['Roguelike', 'Ação', 'Indie', 'Mitologia', 'Dungeon Crawler'] },
      { title: 'Hollow Knight', categories: ['Metroidvania', 'Ação', 'Plataforma', 'Indie', 'Exploração'] },
    ];

    const titles = gameCategoryInput.map((item) => item.title);
    const categoryNames = [...new Set(gameCategoryInput.flatMap((item) => item.categories))];

    const games = await queryInterface.sequelize.query(
      'SELECT id, title FROM games WHERE title IN (:titles)',
      {
        replacements: { titles },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM categories WHERE name IN (:categoryNames)',
      {
        replacements: { categoryNames },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const gameIdByTitle = new Map(games.map((game) => [game.title, game.id]));
    const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));

    const missingGames = titles.filter((title) => !gameIdByTitle.has(title));
    if (missingGames.length > 0) {
      throw new Error(`Jogos ausentes para vínculo de categoria: ${missingGames.join(', ')}`);
    }

    const missingCategories = categoryNames.filter((name) => !categoryIdByName.has(name));
    if (missingCategories.length > 0) {
      throw new Error(`Categorias ausentes para vínculo de jogo: ${missingCategories.join(', ')}`);
    }

    const rows = [];
    for (const item of gameCategoryInput) {
      const gameId = gameIdByTitle.get(item.title);
      const uniqueCategories = [...new Set(item.categories)];

      for (const categoryName of uniqueCategories) {
        rows.push({
          game_id: gameId,
          category_id: categoryIdByName.get(categoryName),
        });
      }
    }

    await queryInterface.bulkInsert('game_categories', rows, {});
  },

  async down(queryInterface, Sequelize) {
    const titles = [
      'Elden Ring',
      'Baldur\'s Gate 3',
      'Cyberpunk 2077',
      'The Witcher 3: Wild Hunt',
      'Sekiro: Shadows Die Twice',
      'Red Dead Redemption 2',
      'Grand Theft Auto V Enhanced',
      'Hogwarts Legacy',
      'God of War',
      'Resident Evil 4',
      'Persona 5 Royal',
      'It Takes Two',
      'Black Myth: Wukong',
      'Monster Hunter Wilds',
      'Clair Obscur: Expedition 33',
      'Metaphor: ReFantazio',
      'Dead by Daylight',
      'Stardew Valley',
      'Hades',
      'Hollow Knight',
    ];

    const games = await queryInterface.sequelize.query(
      'SELECT id FROM games WHERE title IN (:titles)',
      {
        replacements: { titles },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const gameIds = games.map((game) => game.id);
    if (gameIds.length === 0) {
      return;
    }

    await queryInterface.bulkDelete('game_categories', {
      game_id: {
        [Sequelize.Op.in]: gameIds,
      },
    }, {});
  },
};