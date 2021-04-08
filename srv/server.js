const cds = require('@sap/cds')
const proxy = require('@sap/cds-odata-v2-adapter-proxy')

global.__base = __dirname + "/"
console.log(global.__base)

console.log(`CDS Custom Boostrap from /srv/server.js`)

process.on('uncaughtException', function (err) {
    console.error(err.name + ': ' + err.message, err.stack.replace(/.*\n/, '\n')) // eslint-disable-line
})

// Specifying the services in the proxy to handle odata/v2 metadata
cds.on('bootstrap', app => app.use(proxy({
    services: {
        "/MasterDataService/": "MasterDataService",
        "/POService/": "POService"
    }
})))

//module.exports = cds.server


// delegate to default server.js:
module.exports = async (o) => {
    o.port = process.env.PORT || 4004
    //API route (Disabled by default)
    o.baseDir = global.__base
    o.routes = []

    const express = require('express')
    let app = express()
    app.express = express
    app.baseDir = o.baseDir
    o.app = app

    const path = require('path')
    const fileExists = require('fs').existsSync
    let expressFile = path.join(app.baseDir, 'server/express.js')
    if (fileExists(expressFile)) {
        await require(expressFile)(app)
    }

    //CDS REST Handler
    let restURL = "/rest/"
    cds.serve('POService')
        .from(global.__base + "/gen/csn.json")
        .to("rest")
        .at(restURL + 'POService')
        .with(require("./handlers/po-service"))        
        .in(app)
        .catch((err) => {
            app.logger.error(err);
        })

    cds.serve('MasterDataService')
        .from(global.__base + "/gen/csn.json")
        .to("rest")
        .at(restURL + 'MasterDataService')
        .with(require("./handlers/md-service"))          
        .in(app)
        .catch((err) => {
            app.logger.error(err);
        })

    o.app.httpServer = await cds.server(o)

    return o.app.httpServer
}