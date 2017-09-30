import { TransactionModel } from './TransactionModel'
import fnx from 'fnx'
import * as uuid from 'uuid'

export class BudgetModel extends fnx.Model<{}> {
  transactions = fnx.mapOf(fnx.object(TransactionModel))
  budgetName = fnx.string

  @fnx.computed
  getTotal?() {
    let total = 0
    Object.keys(this.transactions).forEach(id => {
      total += this.transactions[id].amount
    })
    return total
  }

  @fnx.computed
  getTransactionsOrderedByDateCreated?() {
    return Object.keys(this.transactions).map(id => this.transactions[id]).sort((t1, t2) => {
      return t1.created < t2.created ? 1 : -1
    })
  }

  @fnx.computed
  getMostRecentTransaction?() {
    return this.getTransactionsOrderedByDateCreated()[0]
  }

  @fnx.action
  createTransaction?(amount: number, origin: string) {
    const id = uuid.v4()
    this.transactions[id] = {
      amount, id, origin, created: Date.now()
    }
    return id
  }

  @fnx.action
  addExistingTransaction?(transaction: TransactionModel) {
    this.transactions[transaction.id] = transaction
  }
}
