import { Router } from 'express';
import transactionRouter from './transaction.routes';
import categoryRouter from './category.routes';

const routes = Router();

routes.use('/transactions', transactionRouter);
routes.use('/categories', categoryRouter);

export default routes;
