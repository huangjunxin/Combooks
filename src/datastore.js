import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import LodashId from 'lodash-id'
// import path from 'path'

const adapter = new FileSync('db.json')

const db = Datastore(adapter)

db._.mixin(LodashId)

if (!db.has('bookListDataDB').value()) {
  db.set('bookListDataDB', []).write()
}

if (!db.has('pathHistoryDataDB').value()) {
  db.set('pathHistoryDataDB', []).write()
}

export default db
