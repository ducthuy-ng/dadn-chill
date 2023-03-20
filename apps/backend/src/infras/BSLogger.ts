import { createLogger, Logger as BSLoggerType, LogLevels } from 'bs-logger';
import { Logger, LogLevel } from '../core/usecases/Logger';

export class BSLogger implements Logger {
  public static ApplicationName = 'dadn-chill';

  private static LogLevelMapping = {
    [LogLevel.INFO]: LogLevels.info,
    [LogLevel.DEBUG]: LogLevels.debug,
    [LogLevel.WARN]: LogLevels.warn,
    [LogLevel.ERROR]: LogLevels.error,
  };

  private logger: BSLoggerType;

  constructor(namespace: string, { target = 'stdout:debug', level = LogLevel.INFO }) {
    this.logger = createLogger({
      context: {
        application: BSLogger.ApplicationName,
        namespace: namespace,
        logLevel: BSLogger.LogLevelMapping[level],
      },
      targets: target,
    });
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(message, args);
  }
  info(message: string, ...args: unknown[]): void {
    this.logger.info(message, args);
  }
  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(message, args);
  }
  error(message: string, ...args: unknown[]): void {
    this.logger.error(message, args);
  }
}
