import express, { Request, Response, Router } from 'express';
import UserController from './controllers/user.controller';

const app = express();
app.use(express.json());

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello, World! (typescript)');
});

router.get('/users', UserController.findAll);
router.post('/users', UserController.create);
router.get('/users/:id', UserController.getById);

app.use(router);


export default app;


/*router.get('/users', UserController.getAllUsers); router.post('/users', UserController.createUser); router.get('/users/:id', UserController.getUserById); router.put('/users/:id', UserController.updateUser); router.delete('/users/:id', UserController.deleteUser);*/