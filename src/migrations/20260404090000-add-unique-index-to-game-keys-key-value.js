'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('game_keys', ['key_value'], {
      unique: true,
      name: 'game_keys_key_value_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('game_keys', 'game_keys_key_value_unique');
  },
};
