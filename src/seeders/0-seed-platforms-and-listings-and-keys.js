'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Plataformas básicas
    await queryInterface.bulkInsert('platforms', [
      { id: 1, name: 'Steam', slug: 'steam', icon_url: null, is_active: true, created_at: now },
      { id: 2, name: 'PlayStation', slug: 'playstation', icon_url: null, is_active: true, created_at: now },
      { id: 3, name: 'Xbox', slug: 'xbox', icon_url: null, is_active: true, created_at: now },
      { id: 4, name: 'Nintendo Switch', slug: 'nintendo-switch', icon_url: null, is_active: true, created_at: now },
    ], {});

    // Criar listagens (game + plataforma) e keys simples
    const listings = [];
    const keys = [];

    // Todos os jogos aceitam Steam, PlayStation e Xbox.
    // Apenas Hades (19), Metaphor (16), Monster Hunter (14) e Persona 5 Royal (11) aceitam Nintendo Switch.
    const gamesWithSwitch = new Set([11, 14, 16, 19]);

    let listingId = 1;
    let keyId = 1;

    for (let gameId = 1; gameId <= 20; gameId++) {
      const acceptedPlatforms = gamesWithSwitch.has(gameId) ? [1, 2, 3, 4] : [1, 2, 3];

      for (const platformId of acceptedPlatforms) {
        const price = 49.99 + (gameId * 2) + platformId;
        listings.push({
          id: listingId,
          game_id: gameId,
          platform_id: platformId,
          price,
          is_active: true,
          created_at: now,
          updated_at: now,
        });

        // Adiciona algumas keys "available" para cada listing
        for (let k = 0; k < 5; k++) {
          keys.push({
            id: keyId++,
            listing_id: listingId,
            key_value: `KEY-${gameId}-${platformId}-${k}`.padEnd(16, 'X'),
            status: 'available',
            reserved_at: null,
            sold_at: null,
            created_at: now,
          });
        }

        listingId++;
      }
    }

    // Inserir listagens e keys com IDs fixos (para facilitar outros seeders)
    await queryInterface.bulkInsert('game_platform_listings', listings, {});
    await queryInterface.bulkInsert('game_keys', keys, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('game_keys', null, {});
    await queryInterface.bulkDelete('game_platform_listings', null, {});
    await queryInterface.bulkDelete('platforms', null, {});
  }
};

