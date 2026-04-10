"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("listing_price_changes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      listing_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "game_platform_listings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      previous_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      next_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      changed_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("listing_price_changes", ["listing_id"]);
    await queryInterface.addIndex("listing_price_changes", ["changed_by_user_id"]);
    await queryInterface.addIndex("listing_price_changes", ["created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("listing_price_changes");
  },
};
