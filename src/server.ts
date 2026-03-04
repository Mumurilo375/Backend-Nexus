import app from './app';
import sequelize from './config/database';

const port = 3000;

sequelize.sync({alter: true});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});