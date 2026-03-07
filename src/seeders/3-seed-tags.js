'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tagsWithFixedIds = [
      { id: 1, name: 'singleplayer' },
      { id: 2, name: 'multiplayer' },
      { id: 3, name: 'coop' },
      { id: 4, name: 'open world' },
      { id: 5, name: 'story rich' },
      { id: 6, name: 'fantasy' },
      { id: 7, name: 'fps' },
      { id: 8, name: 'casual' },
      { id: 9, name: 'competitive' },
      { id: 10, name: 'pvp' },
    ];

    const tagsAutoIncrement = [
      { name: 'pve' },
      { name: 'sci-fi' },
      { name: 'horror' },
      { name: 'relaxing' },
      { name: 'difficult' },
      { name: 'pixel graphics' },
      { name: '2d' },
      { name: '3d' },
      { name: 'first person' },
      { name: 'third person' },
      { name: 'controller friendly' },
      { name: 'online coop' },
      { name: 'local coop' },
      { name: 'rpg' },
      { name: 'exploration' },
      { name: 'crafting' },
      { name: 'survival' },
      { name: 'roguelike' },
      { name: 'procedural generation' },
      { name: 'atmospheric' },
      { name: 'realistic' },
      { name: 'cartoon' },
      { name: 'anime' },
      { name: 'retro' },
      { name: 'early access' },
      { name: 'mods' },
      { name: 'vr' },
      { name: 'family friendly' },
    ];

    await queryInterface.bulkInsert('tags', tagsWithFixedIds, {});
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('tags', 'id'), COALESCE(MAX(id), 1)) FROM tags;"
    );
    await queryInterface.bulkInsert('tags', tagsAutoIncrement, {});
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('tags', 'id'), COALESCE(MAX(id), 1)) FROM tags;"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tags', null, {});
  }
};
