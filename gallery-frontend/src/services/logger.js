const logger = {
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  info: (message) => console.log(`[INFO] ${message}`),
};

export default logger;
