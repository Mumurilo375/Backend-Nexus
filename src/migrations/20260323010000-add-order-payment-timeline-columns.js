'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'payment_confirmed_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('orders', ['payment_confirmed_at']);
    await queryInterface.addIndex('orders', ['cancelled_at']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('orders', ['cancelled_at']);
    await queryInterface.removeIndex('orders', ['payment_confirmed_at']);

    await queryInterface.removeColumn('orders', 'cancelled_at');
    await queryInterface.removeColumn('orders', 'payment_confirmed_at');
  },
};
