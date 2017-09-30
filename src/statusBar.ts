import * as terminalKit from 'terminal-kit'
import * as boxen from 'boxen'
import * as chalk from 'chalk'
import { app } from './app'
import { TransactionModel } from './models/TransactionModel'
import { View } from './models/AppModel'
import fnx from 'fnx'

const term = terminalKit.terminal

export const STATUS_BAR_HEIGHT = 6

export function initStatusBar() {
  term.clear()
  term.moveTo(STATUS_BAR_HEIGHT, 1)
  fnx.reaction(() => {
    renderStatusBar()
  })
}

function renderStatusBar() {
  term.saveCursor()
  clearCurrentStatusBar()

  let status = ''

  if (app.view === View.CHOOSE_NAME) {
    append('Name: ' + chalk.gray.italic('Not chosen'))
  } else {
    append('Name: ' + chalk.bold(app.userName))
  }

  if (app.budget != undefined) {
    append('Budget: ' + chalk.bold(app.budget.budgetName))
    append('Balance: ' + formatMoney(app.budget.getTotal()))
    append('Last Transaction: ' + formatTransaction(app.budget.getMostRecentTransaction()))
  } else {
    append('Budget: ' + chalk.gray.italic('No active budget'))
    append('Balance: ' + chalk.gray.italic('No active budget'))
    append('Last Transaction: ' + chalk.gray.italic('No active budget'))
  }

  term(boxen(status.trim(), {
    padding: 1, borderColor: 'cyan'
  }))

  term.restoreCursor()

  function append(line: string) {
    status += line + '\n'
  }
}

function clearCurrentStatusBar() {
  term.moveTo(1, STATUS_BAR_HEIGHT + 1)
  term.eraseDisplayAbove()
  term.moveTo(1, 1)
}

function formatMoney(amount: number, options?: { addSign: boolean }) {
  let amountString = Math.abs(amount).toFixed(2)
  if (amount < 0) {
    return chalk.bold.red('-$' + amountString)
  } else {
    let str = '$' + amountString
    if (options && options.addSign) {
      str = '+' + str
    }
    return chalk.bold.green(str)
  }
}

function formatTransaction(transaction: TransactionModel) {
  if (transaction == undefined) {
    return chalk.gray.italic('No transactions recorded')
  }
  let formatted = ''
  formatted += formatMoney(transaction.amount, { addSign: true }) + ' '
  formatted += 'from ' + (transaction.location || chalk.gray.italic('fetching...')) + ' '
  formatted += 'by ' + transaction.origin
  return formatted
}