'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      { name: 'Ação' },
      { name: 'Aventura' },
      { name: 'RPG' },
      { name: 'Estratégia' },
      { name: 'Esportes' },
      { name: 'Indie' },
      { name: 'Simulação' },
      { name: 'Terror' },
      { name: 'Corrida' },
      { name: 'Luta' },
      { name: 'Tiro' },
      { name: 'Puzzle' },
      { name: 'Plataforma' },
      { name: 'Survival' },
      { name: 'Battle Royale' },
      { name: 'MOBA' },
      { name: 'MMORPG' },
      { name: 'Roguelike' },
      { name: 'Metroidvania' },
      { name: 'Point and Click' },
      { name: 'Visual Novel' },
      { name: 'Musical' },
      { name: 'Educacional' },
      { name: 'Sandbox' },
      { name: 'Tower Defense' },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
