import type { Plugin, OnExecuteDoneHookResultOnNextHook } from '@envelop/core';
import { ContextType } from '../types';

/**
 * Ticket 6: Append requestId from context to every GraphQL response.
 *
 * onExecuteDone in envelop v5 works via onNext / onEnd hooks
 * because the result may be an AsyncIterable (subscriptions).
 * For regular queries/mutations the single result comes through onNext.
 */
export const useResponseMetadata = (): Plugin<ContextType> => {
  return {
    onExecute({ args }) {
      const requestId = (args.contextValue as ContextType)?.requestId ?? '';
      return {
        onExecuteDone({ setResult, result }) {
          // For single-value (non-streaming) results, result is the ExecutionResult directly
          if (result && typeof result === 'object' && !('next' in result)) {
            setResult({
              ...(result as object),
              metadata: { requestId },
            } as typeof result);
          }
        },
      };
    },
  };
};
