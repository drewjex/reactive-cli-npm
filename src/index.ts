import * as inquirer from 'inquirer'
import * as terminalKit from 'terminal-kit'
import { AppModel } from './models/AppModel'
import { reaction } from 'fnx'
import axios from 'axios'
import * as boxen from 'boxen'
import { times } from 'lodash'
import { initStatusBar, STATUS_BAR_HEIGHT } from './statusBar'
import { app } from './app'
import { View } from './models/AppModel'
import * as Database from './database' 
import fnx from 'fnx'
import * as chalk from 'chalk'
import * as Controller from './controller'
import { Node } from './node'

const term = terminalKit.terminal
let port = random(3000, 3090)

start()

function start() {
  const views = {
    [View.CHOOSE_NAME]: displayChooseName,
    [View.JOIN_OR_CREATE_SELECTION]: displayJoinOrCreateSelection,
    [View.CREATE_BUDGET]: displayCreateBudget,
    [View.JOIN_BUDGET]: displayJoinBudget,
    [View.ACTION_SELECTION]: displayActionSelection,
    [View.DEPOSIT]: displayDepositSelection,
    [View.WITHDRAW]: displayWithdrawSelection,
  }

  initStatusBar()
  fnx.reaction(() => {
    term.moveTo(1, STATUS_BAR_HEIGHT + 4)
    term.eraseDisplayBelow()
    views[app.view]()
  })  
}

async function displayChooseName() {
  const { name } = await inquirer.prompt({
    name: 'name',
    message: 'Choose your name',
    validate: required
  })
  app.transaction(() => {
    app.setUserName(name.trim())
    app.setView(View.JOIN_OR_CREATE_SELECTION)
  })
}

async function displayJoinOrCreateSelection() {
  const { choice } = await inquirer.prompt({
    name: 'choice',
    message: 'Would you like to create a new budget or join an existing one?',
    type: 'list',
    choices: [ 'Join', 'Create' ]
  })
  if (choice === 'Join') {
    app.setView(View.JOIN_BUDGET)
  } else {
    app.setView(View.CREATE_BUDGET)
  }
}

async function displayCreateBudget() {
  const { name } = await inquirer.prompt({
    name: 'name',
    message: 'Pick a name for your budget',
    validate: required
  })
  app.transaction(() => {
    app.joinBudget(name.trim())
    app.setView(View.ACTION_SELECTION)
    Controller.join(app, port)
  })
}

async function displayJoinBudget() {
  let budgets = await Database.getBudgets()
  const { choice } = await inquirer.prompt({
    name: 'choice',
    message: 'Choose a budget from the list below:',
    type: 'list',
    choices:  Object.keys(budgets)
  })
  app.transaction(() => {
    app.joinBudget(choice)
    Controller.join(app, port)
    app.setView(View.ACTION_SELECTION)
  })
}

async function displayActionSelection() {
  let confirmShutdown: boolean
  do {
    const { choice } = await inquirer.prompt({
      name: 'choice',
      message: 'What would you like to do?',
      type: 'list',
      choices: [ 'Widthdraw', 'Deposit', 'Shutdown' ]
    })
    if (choice === 'Widthdraw') {
      app.setView(View.WITHDRAW)
      break
    } else if (choice === 'Deposit') {
      app.setView(View.DEPOSIT)
      break
    } else {
      console.log(chalk.yellow(chalk.bold('Warning:') + ' If changes from your machine have not been'))
      console.log(chalk.yellow('synced with a living node your changes will be lost!'))
      console.log(chalk.yellow('If all machines in a budget disconnect your budget will'))
      console.log(chalk.yellow('be lost forever...'))
      confirmShutdown = (await inquirer.prompt({
        name: 'confirm',
        type: 'confirm',
        message: 'Are you sure you\'d like to continue?',
        default: false
      })).confirm
    }
  } while (!confirmShutdown)
  if (confirmShutdown) {
    Controller.leave(app)
    term.clear()
    process.exit(0)
  }
}

async function displayDepositSelection() {
  const { amount } = await inquirer.prompt({
    name: 'amount',
    message: 'How much would you like to deposit (in dollars)?',
    validate: combineValidators(required, isNumber)
  })
  app.transaction(() => {
    createTransaction(parseFloat(amount.trim()))
    app.setView(View.ACTION_SELECTION)
  })
}

async function displayWithdrawSelection() {
  const { amount } = await inquirer.prompt({
    name: 'amount',
    message: 'How much would you like to withdraw (in dollars)?',
    validate: combineValidators(required, isNumber)
  })
  app.transaction(() => {
    createTransaction(-parseFloat(amount.trim()))
    app.setView(View.ACTION_SELECTION)
  })
}

function createTransaction(amount) {
  const id = app.budget.createTransaction(amount, app.userName)
  setTransactionLocation(id)
  Controller.sendTransaction(app)
}

async function setTransactionLocation(id) {
  const res = await axios.get('http://geoip.nekudo.com/api')
  app.budget.transactions[id].setLocation(res.data.city)
  Controller.updateTransaction(app)
}

function combineValidators(...validators: ((value: string) => true | string)[]) {
  return (value: string) => {
    for (let i = 0; i < validators.length; i++) {
      let result = validators[i](value)
      if (typeof result === 'string') {
        return result
      }
    }
    return true
  }
}

function isNumber(value: string) {
  if (/^\d+(\.\d+)?$/.test(value.trim())) {
    return true
  } else {
    return 'Should be positive number'
  }
}

function required(value: string) {
  if (value != undefined && value.trim().length > 0) {
    return true
  } else {
    return 'Required'
  }
}

function random(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}
