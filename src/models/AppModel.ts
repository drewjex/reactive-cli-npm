import { BudgetModel } from './BudgetModel'
import fnx from 'fnx'
import * as uuid from 'uuid'

export enum View {
  CHOOSE_NAME,
  JOIN_OR_CREATE_SELECTION,
  JOIN_BUDGET,
  CREATE_BUDGET,
  ACTION_SELECTION,
  WITHDRAW,
  DEPOSIT,
}

export class AppModel extends fnx.Model<AppModel> {
  @fnx.optional budget? = fnx.object(BudgetModel)
  @fnx.optional userName? = fnx.string

  view: View = fnx.number

  @fnx.action
  setView?(view: View) {
    this.view = view
  }

  @fnx.action
  transaction?(fn: Function) {
    fn()
  }

  @fnx.action
  setUserName?(name: string) {
    this.userName = name
  }

  @fnx.action
  joinBudget?(name: string) {
    this.budget = {
      budgetName: name,
      transactions: { }
    }
  }
}
