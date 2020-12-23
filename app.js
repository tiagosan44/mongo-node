const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const circulationRepo = require('./repos/circulationRepo')
const data = require('./circulation.json')

const url = 'mongodb://localhost:27017'
const dbName = 'circulation'
 
async function  main() {
    const client = new MongoClient(url)
    await client.connect()
    try {
        // load data
        const results = await circulationRepo.loadData(data)
        assert.strictEqual(data.length, results.insertedCount)

        // get data
        const getData = await circulationRepo.get()
        assert.strictEqual(data.length, getData.length)

        // filter data
        const filterData = await circulationRepo.get( {Newspaper: getData[4].Newspaper} )
        assert.deepStrictEqual(filterData[0], getData[4])

        // limit
        const limitData = await circulationRepo.get( {}, 3 )
        assert.deepStrictEqual(limitData.length, 3)

        // by Id
        const id = getData[4]._id.toString()
        const byId = await circulationRepo.getById(id)
        assert.deepStrictEqual(byId, getData[4])

        // add
        const newItem = {
            "Newspaper": "My paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        }
        const addedItem = await circulationRepo.add(newItem);
        assert.ok(addedItem._id)
        const addedItemQuery = await circulationRepo.getById(addedItem._id);
        assert.deepStrictEqual(addedItemQuery, newItem)

        // update
        const updatedItem = await circulationRepo.update(addedItem._id, {
            "Newspaper": "My new paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
          });
          assert.strictEqual(updatedItem.Newspaper, "My new paper");
          const newAddedItemQuery = await circulationRepo.getById(addedItem._id);
          assert.strictEqual(newAddedItemQuery.Newspaper, "My new paper");

        const removed = await circulationRepo.remove(addedItem._id)
        assert(removed)
        const deletedItem = await circulationRepo.getById(addedItem._id)
        assert.strictEqual(deletedItem, null)

        const avgFinalists = await circulationRepo.averageFinalists()
        console.log("Average finalists: " + avgFinalists)

        const avgBychange = await circulationRepo.averageFinalistsByChange()
        console.log(avgBychange)
    } catch(error) {
        console.log(error)
    } finally {
        const admin = client.db(dbName).admin()
        console.log(await admin.listDatabases())
        // drop
        await client.db(dbName).dropDatabase()
        console.log(await admin.listDatabases())
        client.close()
    }
}

 main()

