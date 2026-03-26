'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'payment_provider', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'provider_checkout_session_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'provider_payment_intent_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'payment_status', {
      type: Sequelize.STRING(30),
      allowNull: false,
      defaultValue: 'pending',
    });

    await queryInterface.addColumn('orders', 'payment_error_code', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'payment_error_message', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'card_brand', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'card_last4', {
      type: Sequelize.STRING(4),
      allowNull: true,
    });

    await queryInterface.addIndex('orders', ['payment_provider']);
    await queryInterface.addIndex('orders', ['provider_checkout_session_id']);
    await queryInterface.addIndex('orders', ['provider_payment_intent_id']);
    await queryInterface.addIndex('orders', ['payment_status']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('orders', ['payment_status']);
    await queryInterface.removeIndex('orders', ['provider_payment_intent_id']);
    await queryInterface.removeIndex('orders', ['provider_checkout_session_id']);
    await queryInterface.removeIndex('orders', ['payment_provider']);

    await queryInterface.removeColumn('orders', 'card_last4');
    await queryInterface.removeColumn('orders', 'card_brand');
    await queryInterface.removeColumn('orders', 'payment_error_message');
    await queryInterface.removeColumn('orders', 'payment_error_code');
    await queryInterface.removeColumn('orders', 'payment_status');
    await queryInterface.removeColumn('orders', 'provider_payment_intent_id');
    await queryInterface.removeColumn('orders', 'provider_checkout_session_id');
    await queryInterface.removeColumn('orders', 'payment_provider');
  },
};
