const constants = require('../constants')
const { validIdLength, dbError, projectIdError, projectNotFound } = constants

const ObjectID = require('mongodb').ObjectID

module.exports = function(app, db) {
    app.get('/projects/:id', (req, res) => {
        const id = req.params.id
        if(!validIdLength.includes(id.length)) res.send(projectIdError)
        const details = {'_id': new ObjectID(id)}
        db.collection('projects').findOne(details, (err, item) => {
            if(err) {
                res.send(dbError)
            } else if(item) {
                db.collection('lowestBids').findOne({projectId: id}, (err, lowestBid) => {
                    if(lowestBid) {
                        //if(no winner && date > bidEnd) -> append winner: lowestBid
                        if(!item.winner) {

                            const bidEndTime = new Date(item.bidEnd)
                            bidEndTime.setDate(bidEndTime.getDate() + 1);
                            const currentSystemTime = new Date()
                            console.log(currentSystemTime, bidEndTime);
                            if(currentSystemTime > bidEndTime) {
                                db.collection('projects').findOneAndUpdate(details, {$set: {winner: lowestBid}})
                            }
                        }
                        item = { ...item, lowestBid}
                    }
                    console.log(item);
                    res.send({status: 200, data: item})
                })
            } else {
                res.send(projectNotFound)
            }
        })
    })
    app.get('/projects/', (req, res) => {
        const offset = req.query.offset ? Number(req.query.offset) : 0
        const limit = req.query.limit ? Number(req.query.limit): 25
        db.collection('projects').find().skip(offset).limit(limit).toArray((err, item) => {
            if(err) {
                res.send(dbError)
            } else {
                res.send({status: 200, data: item})
            }
        })
    })
    app.put('/projects/:id', (req, res) => {
        const id = req.params.id
        if(!validIdLength.includes(id.length)) res.send(projectIdError)

        const { projectName, description } = req.body
        const project = {projectName, description}
        const details = {'_id': new ObjectID(id)}
        db.collection('projects').update(details, {$set: project}, (err, item) => {
            if(err) {
                res.send(dbError)
            } else if(item.result.n) {
                res.send({status: 200, data: project, message: `Project ${id} Updated Successfully`})
            } else {
                res.send(projectNotFound)
            }
        })
    })
    app.post('/projects', (req, res) => {
        const { projectName, sellerId, description, bidStart, bidEnd, maxAmount } = req.body
        // if (projectName && sellerId && description, bidStart && bidEnd && maxAmount)
        const project = { projectName, sellerId, description, bidStart, bidEnd, maxAmount, winner: null }
        db.collection('projects').insert(project, (err, result) => {
            if(err) {
                res.send(dbError)
            } else {
                res.send({'status': '201 Created', 'projectId': result.insertedIds[0]})
            }
        })
    })
    app.delete('/projects/:id', (req, res) => {
        const id = req.params.id
        if(!validIdLength.includes(id.length)) res.send(projectIdError)

        const details = {'_id': new ObjectID(id)}
        db.collection('projects').remove(details, (err, item) => {
            if(err) {
                res.send(dbError)
            } else if(item.result.n) {
                res.send({status: 200, message: `Project ${id} Deleted Successfully`})
            } else {
                res.send(projectNotFound)
            }
        })
    })
}
