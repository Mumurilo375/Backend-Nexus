'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('system_requirements', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      os: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      processor: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      memory: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      graphics: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      storage: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('system_requirements', ['game_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('system_requirements');
  }
};
