'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const [orders] = await queryInterface.sequelize.query(
      'SELECT id, user_id FROM orders ORDER BY id ASC LIMIT 10;'
    );
    const [listings] = await queryInterface.sequelize.query(
      'SELECT id FROM game_platform_listings ORDER BY id ASC LIMIT 10;'
    );
    const [gameKeys] = await queryInterface.sequelize.query(
      "SELECT id, listing_id FROM game_keys WHERE status = 'available' ORDER BY id ASC;"
    );

    if (!orders.length || !listings.length || !gameKeys.length) {
      throw new Error('Seed order_items requer orders, listagens e keys disponiveis.');
    }

    const items = [];
    const keysByListing = new Map();

    for (const gameKey of gameKeys) {
      const listingId = Number(gameKey.listing_id);
      const list = keysByListing.get(listingId) ?? [];
      list.push(Number(gameKey.id));
      keysByListing.set(listingId, list);
    }

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

        const keyPool = keysByListing.get(Number(listingId)) ?? [];
        const gameKeyId = keyPool.shift();

        if (!gameKeyId) {
          throw new Error(`Não há key disponível para a listing ${listingId}.`);
        }

        const price = 49.99 + (listingId % 20);

        items.push({
          order_id: orderId,
          listing_id: listingId,
          game_key_id: gameKeyId,
          price,
          created_at: now,
        });
      }
    }

    await queryInterface.bulkInsert('order_items', items, {});

    const [seededItems] = await queryInterface.sequelize.query(`
      SELECT oi.id AS order_item_id, oi.game_key_id, o.user_id
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE oi.game_key_id IS NOT NULL
    `);

    const deliveredKeys = seededItems.map((item) => ({
      user_id: Number(item.user_id),
      order_item_id: Number(item.order_item_id),
      game_key_id: Number(item.game_key_id),
      delivered_at: now,
    }));

    await queryInterface.bulkInsert('delivered_keys', deliveredKeys, {});

    const soldKeyIds = deliveredKeys.map((item) => item.game_key_id).join(',');
    await queryInterface.sequelize.query(`
      UPDATE game_keys
      SET status = 'sold', reserved_at = NULL, sold_at = :now
      WHERE id IN (${soldKeyIds})
    `, {
      replacements: { now },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('delivered_keys', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
  }
};
