import * as express from 'express'
import * as uuid from 'uuid'
import * as http from 'http'
import * as createIO from 'socket.io'
import * as path from 'path'
import axios from 'axios'
import * as bodyParser from 'body-parser'
import { AppModel } from './models/AppModel'
import { app } from './app'

export class Node {

  id = uuid.v4()
  app: express.Application
  server: http.Server
  io: any 

  constructor(public name: string, public ipaddress: string, public port:number, public key: string) {
    this.app = express()
    this.app.use(bodyParser.json());
    this.server = http.createServer(this.app)
    this.io = createIO(this.server)
    let socket: any;

    this.app.post('/requestTransactions', (req, res) => {
      //console.log(app.budget.transactions.getSnapshot({asString:true}))
      res.json(JSON.stringify(app.budget.transactions))
    })

    this.app.post('/addTransaction', (req, res) => {
      app.budget.addExistingTransaction(req.body)
      res.end()
    })

    this.app.post('/updateTransaction', (req, res) => {
      app.budget.getMostRecentTransaction().setLocation(req.body.location)
      res.end()
    })
  }

  start() {
    this.server.listen(this.port)
  }
}
