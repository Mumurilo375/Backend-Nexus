'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Preços aproximados dos games (ids 1-28) para consistência
    const gamePrices = {
      1: 49.99, 2: 79.99, 3: 39.99, 4: 34.99, 5: 59.99, 6: 44.99, 7: 54.99, 8: 29.99,
      9: 19.99, 10: 69.99, 11: 24.99, 12: 39.99, 13: 89.99, 14: 49.99, 15: 27.99, 16: 32.99,
      17: 64.99, 18: 46.99, 19: 149.99, 20: 41.99, 21: 21.99, 22: 36.99, 23: 52.99, 24: 119.99,
      25: 31.99, 26: 44.99, 27: 18.99, 28: 9.99,
    };

    const items = [];
    let itemId = 0;

    // Cada pedido (1-45) recebe 1 a 4 itens com jogos variados
    for (let orderId = 1; orderId <= 45; orderId++) {
      const numItems = 1 + (orderId % 4);
      const usedGames = new Set();
      for (let j = 0; j < numItems; j++) {
        let gameId = ((orderId + j * 7) % 28) + 1;
        if (usedGames.has(gameId)) gameId = (gameId % 28) + 1;
        usedGames.add(gameId);
        const price = gamePrices[gameId] || 29.99;
        items.push({ order_id: orderId, game_id: gameId, price, created_at: now, updated_at: now });
        itemId++;
      }
    }

    await queryInterface.bulkInsert('order_items', items, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_items', null, {});
  }
};
