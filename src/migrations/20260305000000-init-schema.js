"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // USERS
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      cpf: {
        type: Sequelize.STRING(14),
        allowNull: true,
        unique: true,
      },
      avatar_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("users", ["email"]);
    await queryInterface.addIndex("users", ["username"]);
    await queryInterface.addIndex("users", ["cpf"]);

    // PLATFORMS
    await queryInterface.createTable("platforms", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      icon_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("platforms", ["name"]);
    await queryInterface.addIndex("platforms", ["slug"]);
    await queryInterface.addIndex("platforms", ["is_active"]);

    // GAMES
    await queryInterface.createTable("games", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      long_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      release_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      cover_image_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("games", ["title"]);
    await queryInterface.addIndex("games", ["release_date"]);
    await queryInterface.addIndex("games", ["is_active"]);

    // GAME IMAGES
    await queryInterface.createTable("game_images", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "games",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("game_images", ["game_id"]);
    await queryInterface.addIndex("game_images", ["sort_order"]);

    // CATEGORIES
    await queryInterface.createTable("categories", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
    });
    await queryInterface.addIndex("categories", ["name"]);

    // GAME_CATEGORIES (pivot)
    await queryInterface.createTable("game_categories", {
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "games",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    await queryInterface.addIndex("game_categories", ["game_id"]);
    await queryInterface.addIndex("game_categories", ["category_id"]);

    // TAGS
    await queryInterface.createTable("tags", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
    });
    await queryInterface.addIndex("tags", ["name"]);

    // GAME_TAGS (pivot)
    await queryInterface.createTable("game_tags", {
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "games",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "tags",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    await queryInterface.addIndex("game_tags", ["game_id"]);
    await queryInterface.addIndex("game_tags", ["tag_id"]);

    // GAME PLATFORM LISTINGS
    await queryInterface.createTable("game_platform_listings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "games",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      platform_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "platforms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("game_platform_listings", {
      fields: ["game_id", "platform_id"],
      type: "unique",
      name: "unique_game_platform_listing",
    });
    await queryInterface.addIndex("game_platform_listings", ["game_id"]);
    await queryInterface.addIndex("game_platform_listings", ["platform_id"]);
    await queryInterface.addIndex("game_platform_listings", ["is_active"]);

    // GAME KEYS
    await queryInterface.createTable("game_keys", {
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
      key_value: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "available",
      },
      reserved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sold_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("game_keys", ["listing_id"]);
    await queryInterface.addIndex("game_keys", ["status"]);
    await queryInterface.addIndex("game_keys", ["listing_id", "status"]);

    // REVIEWS
    await queryInterface.createTable("reviews", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "games",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("reviews", {
      fields: ["game_id", "user_id"],
      type: "unique",
      name: "unique_game_user_review",
    });
    await queryInterface.addIndex("reviews", ["game_id"]);
    await queryInterface.addIndex("reviews", ["user_id"]);
    await queryInterface.addIndex("reviews", ["rating"]);
    await queryInterface.addIndex("reviews", ["created_at"]);

    // REVIEW VOTES
    await queryInterface.createTable("review_votes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      review_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "reviews",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("review_votes", {
      fields: ["review_id", "user_id"],
      type: "unique",
      name: "unique_review_user_vote",
    });
    await queryInterface.addIndex("review_votes", ["review_id"]);
    await queryInterface.addIndex("review_votes", ["user_id"]);

    // CART ITEMS
    await queryInterface.createTable("cart_items", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      added_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("cart_items", {
      fields: ["user_id", "listing_id"],
      type: "unique",
      name: "unique_user_listing_cart",
    });
    await queryInterface.addIndex("cart_items", ["user_id"]);

    // WISHLISTS
    await queryInterface.createTable("wishlists", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "games",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      added_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("wishlists", {
      fields: ["user_id", "game_id"],
      type: "unique",
      name: "unique_user_game_wishlist",
    });
    await queryInterface.addIndex("wishlists", ["user_id"]);

    // ORDERS
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("orders", ["order_number"]);
    await queryInterface.addIndex("orders", ["user_id"]);
    await queryInterface.addIndex("orders", ["status"]);
    await queryInterface.addIndex("orders", ["created_at"]);

    // ORDER ITEMS
    await queryInterface.createTable("order_items", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      game_key_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: "game_keys",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("order_items", ["order_id"]);
    await queryInterface.addIndex("order_items", ["listing_id"]);
    await queryInterface.addIndex("order_items", ["game_key_id"]);

    // DELIVERED KEYS
    await queryInterface.createTable("delivered_keys", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      order_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "order_items",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      game_key_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "game_keys",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("delivered_keys", ["user_id"]);
    await queryInterface.addIndex("delivered_keys", ["order_item_id"]);
    await queryInterface.addIndex("delivered_keys", ["game_key_id"]);

    // PROMOTIONS
    await queryInterface.createTable("promotions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      discount_percentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("promotions", ["is_active"]);
    await queryInterface.addIndex("promotions", ["start_date"]);
    await queryInterface.addIndex("promotions", ["end_date"]);

    // PROMOTION LISTINGS
    await queryInterface.createTable("promotion_listings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      promotion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "promotions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    });
    await queryInterface.addConstraint("promotion_listings", {
      fields: ["promotion_id", "listing_id"],
      type: "unique",
      name: "unique_promotion_listing",
    });
    await queryInterface.addIndex("promotion_listings", ["promotion_id"]);
    await queryInterface.addIndex("promotion_listings", ["listing_id"]);
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse dependency order
    await queryInterface.dropTable("promotion_listings");
    await queryInterface.dropTable("promotions");
    await queryInterface.dropTable("delivered_keys");
    await queryInterface.dropTable("order_items");
    await queryInterface.dropTable("orders");
    await queryInterface.dropTable("wishlists");
    await queryInterface.dropTable("cart_items");
    await queryInterface.dropTable("review_votes");
    await queryInterface.dropTable("reviews");
    await queryInterface.dropTable("game_keys");
    await queryInterface.dropTable("game_platform_listings");
    await queryInterface.dropTable("game_tags");
    await queryInterface.dropTable("tags");
    await queryInterface.dropTable("game_categories");
    await queryInterface.dropTable("categories");
    await queryInterface.dropTable("game_images");
    await queryInterface.dropTable("games");
    await queryInterface.dropTable("platforms");
    await queryInterface.dropTable("users");
  },
};
