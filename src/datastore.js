import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import LodashId from 'lodash-id'
// import path from 'path'

const adapter = new FileSync('db.json')

const db = Datastore(adapter)

db._.mixin(LodashId)

if (!db.has('tableDataDB').value()) {
  db.set('tableDataDB', []).write()
}

if (!db.has('booksPathHistoryDB').value()) {
  db.set('booksPathHistoryDB', []).write()
}

export default db
