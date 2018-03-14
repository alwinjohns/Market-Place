const ObjectID = require('mongodb').ObjectID

module.exports = function(app, db) {
    app.get('/projects/:id', (req, res) => {
        const id = req.params.id
        const details = {'_id': new ObjectID(id)}
        db.collection('projects').findOne(details, (err, item) => {
            if(err) {
                res.send({'error': 'An error occured'})
            } else {
                res.send(item)
            }
        })
    })
    // app.get('/projects/', (req, res) => {
    //     const id = req.params.id
    //     const details = {'_id': new ObjectID(id)}
    //     db.collection('projects').findOne(details, (err, item) => {
    //         if(err) {
    //             res.send({'error': 'An error occured'})
    //         } else {
    //             res.send(item)
    //         }
    //     })
    // })
    app.put('/projects/:id', (req, res) => {
        const id = req.params.id
        const { name, deadline } = req.body
        const project = {name, deadline}
        const details = {'_id': new ObjectID(id)}
        db.collection('projects').update(details, project, (err, item) => {
            if(err) {
                res.send({'error': 'An error occured'})
            } else {
                res.send('updated')
            }
        })
    })
    app.post('/projects', (req, res) => {
        const { name, deadline } = req.body
        const project = {name, deadline}
        db.collection('projects').insert(project, (err, result) => {
            if(err) {
                res.send({'error': 'An error occured'})
            } else {
                res.send(result.ops[0])
            }
        })
    })
    app.delete('/projects/:id', (req, res) => {
        const id = req.params.id
        const details = {'_id': new ObjectID(id)}
        db.collection('projects').remove(details, (err, item) => {
            if(err) {
                res.send({'error': 'An error occured'})
            } else {
                res.send('deleted')
            }
        })
    })

}
