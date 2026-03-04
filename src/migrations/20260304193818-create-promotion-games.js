'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('promotion_games', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      promotion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'promotions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.addConstraint('promotion_games', {
      fields: ['promotion_id', 'game_id'],
      type: 'unique',
      name: 'unique_promotion_game'
    });
    await queryInterface.addIndex('promotion_games', ['promotion_id']);
    await queryInterface.addIndex('promotion_games', ['game_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('promotion_games');
  }
};
