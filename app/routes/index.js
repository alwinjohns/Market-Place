const projectRoutes = require('./projectRoutes')

module.exports = function(app, db) {
    projectRoutes(app, db)
}
