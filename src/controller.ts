import axios from 'axios'
import { joinBudget, leaveBudget, getCollaborators } from './database' 
import * as ip from 'ip'
import { AppModel } from './models/AppModel'
import { Node } from './node'

const ipAddress = ip.address()
let node:Node;

export async function join (model: AppModel, port: number) {
  let key = joinBudget(model.budget.budgetName, ipAddress+":"+port)
  node = new Node(model.userName, ipAddress, port, key)
  node.start()
  let collaborators = await getCollaborators(model.budget.budgetName) 
  if (Object.keys(collaborators).length > 1) {
    let key = Object.keys(collaborators)[0]
    const response = await axios.post("http://" + collaborators[key].endpoint + '/requestTransactions')
    model.budget.transactions.applySnapshot(response.data)
  }
}

export function leave (model: AppModel) {
  leaveBudget(model.budget.budgetName, node.key)
}

export async function sendTransaction(model: AppModel) {
  let collaborators = await getCollaborators(model.budget.budgetName)
  Object.keys(collaborators).forEach(key => { 
    if (key != node.key) {
      axios.post(
          "http://" + collaborators[key].endpoint + '/addTransaction',
          model.budget.getMostRecentTransaction().getSnapshot({asJSON:true})
          //model.budget.transactions.getSnapshot({asJSON:true})
      ).catch((error) => {
        console.log("ERROR:"+error)
      })
    }
  })
}

export async function updateTransaction(model: AppModel) {
  let collaborators = await getCollaborators(model.budget.budgetName)
  Object.keys(collaborators).forEach(key => { 
    if (key != node.key) {
      axios.post(
          "http://" + collaborators[key].endpoint + '/updateTransaction',
          model.budget.getMostRecentTransaction()
      ).catch((error) => {
        console.log("ERROR:"+error)
      })
    }
  })
}