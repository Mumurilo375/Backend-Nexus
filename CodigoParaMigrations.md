```bash
npx sequelize-cli db:seed --seed src/seeders/0-seed-games.js
npx sequelize-cli db:seed --seed src/seeders/1-seed-platforms-and-listings-and-keys.js
npx sequelize-cli db:seed --seed src/seeders/2-seed-categories.js
npx sequelize-cli db:seed --seed src/seeders/3-seed-tags.js
npx sequelize-cli db:seed --seed src/seeders/4-seed-users.js
npx sequelize-cli db:seed --seed src/seeders/5-seed-orders.js
npx sequelize-cli db:seed --seed src/seeders/6-seed-order-items.js
```

Para desfazer todos os seeds:
```bash
npx sequelize-cli db:seed:undo:all
```
npx sequelize-cli db:seed:all