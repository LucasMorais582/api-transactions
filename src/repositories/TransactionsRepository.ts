/* eslint-disable func-names */
import { EntityRepository, Repository } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface ResponseObject {
  transactions: TransactionDTO[];
  categories: string[];
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = await this.find({ where: { type: 'income' } });
    const incomeValue = income.map(index => {
      return index.value;
    });
    const totalIncome = incomeValue.reduce(function (total, index) {
      return total + index;
    }, 0);

    const outcome = await this.find({ where: { type: 'outcome' } });
    const outcomeValue = outcome.map(index => {
      return index.value;
    });
    const totalOutcome = outcomeValue.reduce(function (total, index) {
      return total + index;
    }, 0);

    const balance: Balance = {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };

    return balance;
  }

  public async loadCSV(filePath: string): Promise<ResponseObject> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: TransactionDTO[] = [];
    const categories: string[] = [];
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value || !category)
        throw new AppError('This document is invalid.');

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    await fs.promises.unlink(filePath);
    return { transactions, categories };
  }
}

export default TransactionsRepository;
