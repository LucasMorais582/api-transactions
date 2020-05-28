import { getCustomRepository, DeleteResult } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<DeleteResult> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transactionVerify = await transactionRepository.findOne({
      where: { id },
    });
    if (!transactionVerify) throw new AppError('This transaction dont exist.');

    const responseDelete = await transactionRepository.delete(id);
    return responseDelete;
  }
}

export default DeleteTransactionService;
