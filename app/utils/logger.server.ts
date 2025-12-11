import fs from 'fs';
import path from 'path';

const logFilePath = path.resolve('logs/app.log');

// Ensure the logs directory exists
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

/**
 * Logs multiple arguments to a file in a pretty format.
 * Works like console.log but writes to logs/app.log
 */
export function info(...args: any[]) {
  const timestamp = new Date().toISOString();

  // Format each argument
  const formattedArgs = args.map(arg => {
    if (typeof arg === 'string') {
      return arg;
    } else if (typeof arg === 'object') {
      return JSON.stringify(arg, null, 2); // pretty-print JSON
    } else {
      return String(arg);
    }
  });

  // Join into a single log entry
  const logMessage = `[${timestamp}] ${formattedArgs.join(' ')}\n`;

  fs.appendFile(logFilePath, logMessage, err => {
    if (err) {
      console.error('Failed to write log:', err);
    }
  });
}
