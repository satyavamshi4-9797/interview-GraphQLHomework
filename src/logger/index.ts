import winston from 'winston';

export class Logger {
  private winston: any;
  requestId: string = '';
  client: string = '';

  constructor() {
    this.winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [new winston.transports.Console()],
    });
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  setClient(client: string) {
    this.client = client;
  }

  private buildMeta(extra?: string | object): object {
    const base = { requestId: this.requestId, client: this.client };
    if (!extra) return base;
    if (typeof extra === 'string') return { ...base, detail: extra };
    return { ...base, ...extra };
  }

  info(message: string, meta?: string | object) {
    this.winston.info(message, this.buildMeta(meta));
  }

  error(message: string, meta?: string | object) {
    this.winston.error(message, this.buildMeta(meta));
  }

  warn(message: string, meta?: string | object) {
    this.winston.warn(message, this.buildMeta(meta));
  }
}
