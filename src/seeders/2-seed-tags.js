'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tags', [
      { name: 'singleplayer' },
      { name: 'multiplayer' },
      { name: 'coop' },
      { name: 'open world' },
      { name: 'story rich' },
      { name: 'fantasy' },
      { name: 'fps' },
      { name: 'casual' },
      { name: 'competitive' },
      { name: 'pvp' },
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
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tags', null, {});
  }
};
