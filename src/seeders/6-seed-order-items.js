'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const [orders] = await queryInterface.sequelize.query(
      'SELECT id FROM orders ORDER BY id ASC LIMIT 10;'
    );
    const [listings] = await queryInterface.sequelize.query(
      'SELECT id FROM game_platform_listings ORDER BY id ASC LIMIT 10;'
    );

    if (!orders.length || !listings.length) {
      throw new Error('Seed order_items requer orders e game_platform_listings já populados.');
    }

    const items = [];

    // Cada pedido recebe 1 a 3 itens com listagens variadas.
    for (let i = 0; i < orders.length; i++) {
      const orderId = orders[i].id;
      const numItems = 1 + (i % 3);
      const usedListings = new Set();

      for (let j = 0; j < numItems; j++) {
        let listingId = listings[(i + j) % listings.length].id;
        if (usedListings.has(listingId)) {
          listingId = listings[(i + j + 1) % listings.length].id;
        }
        usedListings.add(listingId);

        const price = 49.99 + (listingId % 20);

        items.push({
          order_id: orderId,
          listing_id: listingId,
          game_key_id: null,
          price,
          created_at: now,
        });
      }
    }

    await queryInterface.bulkInsert('order_items', items, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_items', null, {});
  }
};
