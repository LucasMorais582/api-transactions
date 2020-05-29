import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateTransactionFromCsvService from '../services/CreateTransactionFromCsvService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import uploadConfig from '../config/upload';

const transactionRouter = Router();
const upload = multer(uploadConfig);

transactionRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    select: ['id', 'title', 'value', 'type', 'created_at', 'updated_at'],
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const transactionFromCsv = new CreateTransactionFromCsvService();
    const transactions = await transactionFromCsv.execute(request.file.path);
    return response.json(transactions);
  },
);

transactionRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);
  return response.json('This transaction has been deleted.');
});

export default transactionRouter;
