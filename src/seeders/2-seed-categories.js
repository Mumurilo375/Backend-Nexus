'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const categoriesWithFixedIds = [
        { id: 1, name: 'Ação' },
        { id: 2, name: 'Aventura' },
        { id: 3, name: 'RPG' },
        { id: 4, name: 'Estratégia' },
        { id: 5, name: 'Esportes' },
        { id: 6, name: 'Indie' },
        { id: 7, name: 'Simulação' },
        { id: 8, name: 'Terror' },
        { id: 9, name: 'Corrida' },
        { id: 10, name: 'Luta' },
    ];

    const categoriesAutoIncrement = [
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
    ];

    await queryInterface.bulkInsert('categories', categoriesWithFixedIds, {});
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE(MAX(id), 1)) FROM categories;"
    );
    await queryInterface.bulkInsert('categories', categoriesAutoIncrement, {});
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE(MAX(id), 1)) FROM categories;"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
