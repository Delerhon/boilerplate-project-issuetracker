const colors = require('colors');

const logAndSendError = (status, message, res, err = {}) => {
    console.log(' '.repeat(10) + `${status}: ${message}`.bgRed.black)
    console.log(' '.repeat(10) + err);
    res.status(status).send(err)
}

const logError = (message) => {
    console.log(' '.repeat(10) + message)
}

module.exports = {
    logAndSendError,
    logError
}