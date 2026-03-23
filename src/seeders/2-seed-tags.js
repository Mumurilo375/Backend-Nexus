"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "tags",
      [
        { id: 1, name: "singleplayer" },
        { id: 2, name: "multiplayer" },
        { id: 3, name: "coop" },
        { id: 4, name: "open world" },
        { id: 5, name: "story rich" },
        { id: 6, name: "fantasy" },
        { id: 7, name: "fps" },
        { id: 8, name: "casual" },
        { id: 9, name: "competitive" },
        { id: 10, name: "pvp" },
        { id: 11, name: "pve" },
        { id: 12, name: "sci-fi" },
        { id: 13, name: "horror" },
        { id: 14, name: "relaxing" },
        { id: 15, name: "difficult" },
        { id: 16, name: "pixel graphics" },
        { id: 17, name: "2d" },
        { id: 18, name: "3d" },
        { id: 19, name: "first person" },
        { id: 20, name: "third person" },
        { id: 21, name: "controller friendly" },
        { id: 22, name: "online coop" },
        { id: 23, name: "local coop" },
        { id: 24, name: "rpg" },
        { id: 25, name: "exploration" },
        { id: 26, name: "crafting" },
        { id: 27, name: "survival" },
        { id: 28, name: "roguelike" },
        { id: 29, name: "procedural generation" },
        { id: 30, name: "atmospheric" },
        { id: 31, name: "realistic" },
        { id: 32, name: "cartoon" },
        { id: 33, name: "anime" },
        { id: 34, name: "retro" },
        { id: 35, name: "early access" },
        { id: 36, name: "mods" },
        { id: 37, name: "vr" },
        { id: 38, name: "family friendly" },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tags", null, {});
  },
};
