const projectRoutes = require('./projectRoutes')
const bidRoutes = require('./bidRoutes')

module.exports = function(app, db) {
    projectRoutes(app, db),
    bidRoutes(app, db)
}
