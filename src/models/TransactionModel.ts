import fnx from 'fnx'

export class TransactionModel extends fnx.Model<{}> {
  @fnx.readonly id = fnx.string
  @fnx.readonly created = fnx.number
  amount = fnx.number
  origin = fnx.string

  @fnx.optional location? = fnx.string

  @fnx.action
  setLocation?(location: string) {
    this.location = location
  }
}
