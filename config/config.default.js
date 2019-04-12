const config1 = {
    init: {}, // passed to engine.io
    namespace: {
        '/': {
            connectionMiddleware: [],
            packetMiddleware: [],
        },
        '/example': {
            connectionMiddleware: [],
            packetMiddleware: [],
        },
    },
}
module.exports = appIno => {
    console.log(appIno)
    return { keys: 12121212,io:config1 }
}
