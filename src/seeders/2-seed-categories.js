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

    // Reducao de ~30% no total de categorias (de 53 para 37)
    const categoriesAutoIncrement = [
      { name: 'Tiro' },
      { name: 'Puzzle' },
      { name: 'Plataforma' },
      { name: 'Survival' },
      { name: 'Roguelike' },
      { name: 'Metroidvania' },
      { name: 'Mundo Aberto' },
      { name: 'Soulslike' },
      { name: 'Narrativo' },
      { name: 'Fantasia' },
      { name: 'Cooperativo' },
      { name: 'Ficção Científica' },
      { name: 'Samurai' },
      { name: 'Faroeste' },
      { name: 'Crime' },
      { name: 'Multiplayer' },
      { name: 'Mitologia' },
      { name: 'Survival Horror' },
      { name: 'JRPG' },
      { name: 'Turnos' },
      { name: 'Anime' },
      { name: 'Action RPG' },
      { name: 'Caça' },
      { name: 'Assimétrico' },
      { name: 'Fazenda' },
      { name: 'Exploração' },
      { name: 'Single Player' },
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
