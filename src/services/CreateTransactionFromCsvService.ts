import { getCustomRepository, getRepository, In } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

class CreateTransactionFromCsvService {
  public async execute(filePath: string): Promise<Transaction[]> {
    let titleCategoriesFiltered;
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const { transactions, categories } = await transactionsRepository.loadCSV(
      filePath,
    );

    const categoriesVerifyExistence = await categoryRepository.find({
      where: { title: In(categories) },
    });

    if (categoriesVerifyExistence) {
      const titleCategories = categoriesVerifyExistence.map(
        (category: Category) => category.title,
      );

      titleCategoriesFiltered = categories
        .filter(index => !titleCategories.includes(index))
        .filter((value, index, self) => self.indexOf(value) === index);
    } else titleCategoriesFiltered = categories;

    const newCategories = categoryRepository.create(
      titleCategoriesFiltered.map((title: string) => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);

    const allCategories = [...newCategories, ...categoriesVerifyExistence];
    const newTransactions = transactionsRepository.create(
      transactions.map(index => ({
        title: index.title,
        type: index.type,
        value: index.value,
        category: allCategories.find(
          category => category.title === index.category,
        ),
      })),
    );

    await transactionsRepository.save(newTransactions);
    return newTransactions;
  }
}

export default CreateTransactionFromCsvService;
