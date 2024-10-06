import util from 'util';

const debugLog = util.debuglog('app'); // Run the app with NODE_DEBUG=app to enable logging debug statements to the console.

/**
 * Logs a message with a timestamp.
 * 
 * @param text - The message to be logged. Can be a string or an Error object.
 * 
 * @example
 * message('Application submitted successfully');
 * // Output: [13.04.2023 15:30:45] Application submitted successfully
 */
const message = (text: string | Error, level: 'info' | 'debug' | 'warn' | 'error' = 'info') => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    };
    const formattedDate = date.toLocaleString('en-US', options);

    const logMessage = `[${formattedDate}] [${level.toUpperCase()}] ${text}`;

    if (level === 'debug') {
        debugLog(logMessage);
    } else {
        console.log(logMessage);
    }
};

export default message;
