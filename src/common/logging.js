/**
 * Represents a logging method that can feed other systems like datadog, sentry, etc
 * 
 * @param {Error} e
 */
const logErrorEvent = (e) => {
    console.error(e.message)
}

module.exports = {logErrorEvent}