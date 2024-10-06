import util from 'util';

const debugLog = util.debuglog('app'); // Run the app with NODE_DEBUG=app to enable logging debug statements to the console.

/**
 * Logs a message with a timestamp and log level.
 * 
 * @param text - The message to be logged. Can be a string or an Error object.
 * @param level - The log level. Can be 'info', 'debug', 'warn', or 'error'. Defaults to 'info'.
 * 
 * @example
 * message('Application submitted successfully', 'info');
 * // Output: [13.04.2023 15:30:45] [INFO] Application submitted successfully
 * 
 * @example
 * message('Detailed debug information', 'debug');
 * // Output (when NODE_DEBUG=app): [13.04.2023 15:31:00] [DEBUG] Detailed debug information
 * 
 * @example
 * message('Warning: Low disk space', 'warn');
 * // Output: [13.04.2023 15:31:15] [WARN] Warning: Low disk space
 * 
 * @example
 * message('Error: Connection failed', 'error');
 * // Output: [13.04.2023 15:31:30] [ERROR] Error: Connection failed
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
