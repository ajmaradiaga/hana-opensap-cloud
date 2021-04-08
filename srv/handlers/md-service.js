/* eslint-disable no-unused-vars */
const cds = require('@sap/cds')
module.exports = cds.service.impl(function () {

  const { Buyer, Products, ProductImages } = this.entities()

  this.before(['READ'], Buyer, async (po, req) => {
    console.log(`InBuyer`)
    // req.on('succeeded', () => {
    //   global.it || console.log(`< emitting: poChanged ${header.ID}`)
    //   this.emit('poChange', header)
    //  })
  })
})