const colors = require('colors');

const logAndSendError = (message, res, err = {}) => {
    console.log(' '.repeat(10) + JSON.stringify(message).bgRed.black)
    console.log(' '.repeat(10) + err);
    res.status(200).send(err)
}

const logError = (message) => {
    console.log(' '.repeat(10) + message)
}

module.exports = {
    logAndSendError,
    logError
}