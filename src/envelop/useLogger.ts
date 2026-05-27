import type { Plugin } from '@envelop/core';
import { Logger } from '../logger';
import { ContextType } from '../types';

export const useLogger = (): Plugin<ContextType> => {
  return {
    onExecute({ args, extendContext }) {
      // Ticket 4 & 5: requestId and client are already on context from buildHeaders;
      // create the logger here and wire them in.
      const context = args.contextValue as ContextType;
      const logger = new Logger();
      logger.setRequestId(context.requestId ?? '');
      logger.setClient(context.client ?? '');
      extendContext({ logger });
    },
  };
};
