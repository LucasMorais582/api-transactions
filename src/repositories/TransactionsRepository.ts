import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
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
}

export default TransactionsRepository;
