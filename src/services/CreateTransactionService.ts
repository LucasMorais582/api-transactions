import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Request> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const checkBalance = await transactionsRepository.getBalance();
      if (value > checkBalance.total)
        throw new AppError('This income is biger than your current balance.');
    }

    let categoryVerify = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryVerify) {
      categoryVerify = await categoryRepository.create({ title: category });
      await categoryRepository.save(categoryVerify);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryVerify.id,
    });

    await transactionsRepository.save(transaction);

    // Customização do objeto para ser mostrado
    const transactionResponse = {
      id: transaction.id,
      title,
      value,
      type,
      category: categoryVerify.title,
    };
    return transactionResponse;
  }
}

export default CreateTransactionService;
