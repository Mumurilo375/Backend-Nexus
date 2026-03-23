"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "categories",
      [
        { id: 1, name: "Ação" },
        { id: 2, name: "Aventura" },
        { id: 3, name: "RPG" },
        { id: 4, name: "Estratégia" },
        { id: 5, name: "Esportes" },
        { id: 6, name: "Indie" },
        { id: 7, name: "Simulação" },
        { id: 8, name: "Terror" },
        { id: 9, name: "Corrida" },
        { id: 10, name: "Luta" },
        { id: 11, name: "Tiro" },
        { id: 12, name: "Puzzle" },
        { id: 13, name: "Plataforma" },
        { id: 14, name: "Survival" },
        { id: 15, name: "Battle Royale" },
        { id: 16, name: "MOBA" },
        { id: 17, name: "MMORPG" },
        { id: 18, name: "Roguelike" },
        { id: 19, name: "Metroidvania" },
        { id: 20, name: "Point and Click" },
        { id: 21, name: "Visual Novel" },
        { id: 22, name: "Musical" },
        { id: 23, name: "Educacional" },
        { id: 24, name: "Sandbox" },
        { id: 25, name: "Tower Defense" },
        { id: 26, name: "Soulslike" },
        { id: 27, name: "Narrativo" },
        { id: 28, name: "Fantasia" },
        { id: 29, name: "Ficção Científica" },
        { id: 30, name: "Mundo Aberto" },
        { id: 31, name: "Samurai" },
        { id: 32, name: "Faroeste" },
        { id: 33, name: "Crime" },
        { id: 34, name: "Mitologia" },
        { id: 35, name: "Survival Horror" },
        { id: 36, name: "JRPG" },
        { id: 37, name: "Turnos" },
        { id: 38, name: "Anime" },
        { id: 39, name: "Cooperativo" },
        { id: 40, name: "Action RPG" },
        { id: 41, name: "Caça" },
        { id: 42, name: "Multiplayer" },
        { id: 43, name: "Assimétrico" },
        { id: 44, name: "Fazenda" },
        { id: 45, name: "Exploração" },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
