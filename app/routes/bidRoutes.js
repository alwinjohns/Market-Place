const ObjectID = require('mongodb').ObjectID

const constants = require('../constants')
const { validIdLength, dbError, projectIdError, bidtIdError, bidNotFound, projectNotFound, invalidBidAmount, bidDateOver, highBidAmount } = constants

module.exports = function(app, db) {
    app.get('/projects/:id/bids/:bidId', (req, res) => {
        const { id, bidId } = req.params

        if(!validIdLength.includes(id.length)) res.send(projectIdError)
        if(!validIdLength.includes(bidId.length)) res.send(bidtIdError)
        const details = { _id: new ObjectID(bidId), projectId: id }
        db.collection('bids').findOne(details, (err, item) => {
            if(err) {
                res.send(dbError)
            } else if(item) {
                res.send({status: 200, data: item})
            } else {
                res.send(bidNotFound)
            }
        })
    })

    app.get('/projects/:id/bids', (req, res) => {
        const id = req.params.id
        if(!validIdLength.includes(id.length)) res.send(projectIdError)
        const details = {'projectId': id}

        db.collection('bids').find(details).toArray((err, item) => {
            if(err) {
                res.send(dbError)
                return
            } else {
                res.send({status: 200, data: item})
            }
        })
    })

    // app.put('/projects/:id/bids/:bidId', (req, res) => {
    //     const id = req.params.id
    //     const { name, deadline } = req.body
    //     const project = { name, deadline }
    //     const details = {'_id': new ObjectID(id)}
    //     db.collection('projects').update(details, project, (err, item) => {
    //         if(err) {
    //             res.send(dbError)
    //         } else {
    //             res.send(item)
    //         }
    //     })
    // })

    app.post('/projects/:id/bids', (req, res) => {
        const id = req.params.id
        if(!validIdLength.includes(id.length)) res.send(projectIdError)
        const details = {'_id': new ObjectID(id)}
        const { buyerId, bidAmount } = req.body

        const newBid = { projectId: id, buyerId, bidAmount }

        db.collection('projects').findOne(details, (err, projectItem) => {
            if(err) {
                res.send(dbError)
            } else if(projectItem) {

                // validate new bid amount
                if(isNaN(bidAmount) || bidAmount <= 0) {
                    res.send(invalidBidAmount)
                    return
                }
                // check bid is less than max amount
                if(Number(bidAmount) > Number(projectItem.maxAmount)) {
                    res.send(highBidAmount)
                    return
                }
                //check bid deadline reached
                const bidEndTime = new Date(projectItem.bidEnd)
                bidEndTime.setDate(bidEndTime.getDate() + 1);
                const currentSystemTime = new Date()
                console.log(currentSystemTime, bidEndTime);
                if(currentSystemTime < bidEndTime) {
                    db.collection('bids').insert(newBid, (err, result) => {
                        if(err) {
                            res.send(dbError)
                        } else {
                            const bidId = 555//result.insertedIds[0]
                            db.collection('lowestBids').findOne({projectId: id}, (err, lowestBid) => {
                                if(lowestBid) {
                                    const shouldUpdateLowestBid = !lowestBid.bidAmount || (lowestBid.bidAmount > newBid.bidAmount)
                                    if(shouldUpdateLowestBid) {
                                            db.collection('lowestBids').update({projectId: id}, { buyerId, bidAmount, bidId, projectId: id }, (err, item) => {
                                            if(err) {
                                                res.send(dbError)
                                            } else {
                                                // console.log('item',item);
                                                // console.log('resu', result);
                                            }
                                        })
                                    }
                                } else {
                                    console.log(bidId);
                                    db.collection('lowestBids').insert({ buyerId, bidAmount, bidId, projectId: id })
                                }
                            })


                            res.send({'status': '201 Created', 'bidId': result.insertedIds[0]})
                        }
                    })
                } else {
                    res.send(bidDateOver)
                }
            } else {
                res.send(projectNotFound)
            }
        })
    })
    app.delete('/projects/:id/bids/:bidId', (req, res) => {
        const { id, bidId } = req.params

        if(!validIdLength.includes(id.length)) res.send(projectIdError)
        if(!validIdLength.includes(bidId.length)) res.send(bidtIdError)

        const details = { _id: new ObjectID(bidId), projectId: id }
        db.collection('bids').deleteOne(details, (err, item) => {
            if(err) {
                res.send(dbError)
            } else if(item.result.n){
                res.send({status: 200, message: `Bid ${bidId} Deleted Successfully`})
            }
            else {
                res.send(bidNotFound)
            }
        })
    })

}
