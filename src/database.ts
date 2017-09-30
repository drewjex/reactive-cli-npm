import * as firebase from 'firebase'

const config = {
  apiKey: "AIzaSyBd1NgrVuoSc3BBeRi4bWhJLtYUElhTBWk",
  authDomain: "reactive-462.firebaseapp.com",
  databaseURL: "https://reactive-462.firebaseio.com",
  projectId: "reactive-462",
  storageBucket: "reactive-462.appspot.com",
  messagingSenderId: "319244644108"
}
firebase.initializeApp(config)

const db = firebase.database()
const dbRef = db.ref('reactive-462')


export function joinBudget(budgetName, endpoint) {
  let ref = db.ref("budgets/"+budgetName).push()
  ref.set({endpoint})
  return ref.key
}

export function leaveBudget(budgetName, key) {
  db.ref("budgets/"+budgetName).child(key).remove()
}

export function getBudgets() {
  return new Promise(resolve => {
    db.ref('budgets').once("value", function(snapshot) {
      resolve(snapshot.val())
    })
  })
}

export function getCollaborators(budgetName) {
  return new Promise(resolve => {
    db.ref("budgets/"+budgetName).once("value", function(snapshot) {
      resolve(snapshot.val())
    })
  })
}