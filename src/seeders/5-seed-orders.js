'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const statuses = ['pending', 'paid', 'delivering', 'completed', 'cancelled'];
    const methods = ['credit_card', 'pix', 'paypal'];

    const orders = [];
    for (let i = 1; i <= 45; i++) {
      const userId = ((i - 1) % 18) + 1;
      const numItems = 1 + (i % 4);
      const subtotal = Number((Math.random() * 200 + 20).toFixed(2));
      const discount = i % 5 === 0 ? Number((subtotal * 0.1).toFixed(2)) : 0;
      const total = Number((subtotal - discount).toFixed(2));
      orders.push({
        order_number: `ORD-2024-${String(i).padStart(4, '0')}`,
        user_id: userId,
        status: statuses[i % statuses.length],
        subtotal,
        discount_amount: discount,
        total_amount: total,
        payment_method: methods[i % methods.length],
        created_at: now
      });
    }

    await queryInterface.bulkInsert('orders', orders, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders', null, {});
  }
};
