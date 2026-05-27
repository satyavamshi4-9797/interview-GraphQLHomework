import type { Plugin } from '@envelop/core';
import { v4 as uuid } from 'uuid';
import { ContextType } from '../types';
import { GraphQLError, OperationTypeNode } from 'graphql';

/**
 * Tickets 3, 4, 5
 * - Ticket 4: generates a new requestId per execution and puts it on context
 * - Ticket 5: extracts client header from request and puts it on context
 * - Ticket 3: rejects mutations from the 'strata' client
 *
 * Note: the "client header required" enforcement (reject if missing)
 * is handled at the Yoga plugin level in server.ts because envelop plugins
 * do not have an onRequest hook.
 */
export const buildHeaders = (): Plugin<ContextType> => {
  return {
    onExecute({ args, extendContext }) {
      const requestId = uuid();
      const request = (args.contextValue as any)?.request as Request | undefined;
      const client = request?.headers?.get('client') ?? '';

      // Ticket 3: reject mutations for strata client
      if (client === 'strata') {
        const operation = args.document.definitions.find(
          (def: any) => def.kind === 'OperationDefinition'
        ) as any;
        if (operation?.operation === OperationTypeNode.MUTATION) {
          throw new GraphQLError('Mutations are not allowed for client: strata');
        }
      }

      extendContext({ requestId, client } as Partial<ContextType>);
    },
  };
};
