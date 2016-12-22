const NODE_ENV = process.env.NODE_ENV;
const config = {
    'Development': {
        connectionOption: 'mongodb://localhost/dopma_dev'
    },
    'Production': {
        connectionOption: 'mongodb://localhost/dopma_dev'
    },
}

module.exports = config[NODE_ENV || 'Development'];
