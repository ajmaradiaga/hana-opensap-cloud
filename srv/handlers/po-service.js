const cds = require('@sap/cds')
module.exports = cds.service.impl(function () {

  const { POs, POnoDraft } = this.entities()

  this.after(['CREATE', 'UPDATE', 'DELETE'], [POs, POnoDraft], async (po, req) => {
    const header = req.data
    req.on('succeeded', () => {
      global.it || console.log(`< emitting: poChanged ${header.ID}`)
      this.emit('poChange', header)
    })
  })

  this.on('sleep', async (req) => {
    if (req._.req.db) {
      req._.req.loggingContext.getTracer(__filename).info('Inside CDS Sleep Function Handler')
     
      try {
        if (!await breaker.fire(req._.req.db)) {
          throw { "Error": "Query Timeout" }
        }
        return true
      } catch (error) {
        req._.req.loggingContext.getLogger('/Application/CDSSleep').error(error)
        req._.req.db.abort()
        return false
      }
    }
    return false
  })

})