/**
 * Logs a message with a timestamp.
 * 
 * @param text - The message to be logged. Can be a string or an Error object.
 * 
 * @example
 * message('Application submitted successfully');
 * // Output: [13.04.2023 15:30:45] Application submitted successfully
 */
const message = (text: string | Error) => {
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

    console.log(`[${formattedDate}] ${text}`);
};

export default message;