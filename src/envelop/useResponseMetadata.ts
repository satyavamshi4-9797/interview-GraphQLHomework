import type { Plugin } from '@envelop/core';
import { ContextType } from '../types';

export const useResponseMetadata = (): Plugin<ContextType> => {
  return {
    onExecute({ args }) {
      const requestId = (args.contextValue as ContextType)?.requestId ?? '';
      return {
        onExecuteDone({ setResult, result }) {
          if (result && typeof result === 'object' && !('next' in result)) {
            const currentResult = result as Record<string, any>;
            setResult({
              ...currentResult,
              metadata: { requestId },
            } as typeof result);
          }
        },
      };
    },
  };
};