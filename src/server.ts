import { createServer } from 'node:http';
import { genSchema } from './schema';
import { createYoga } from 'graphql-yoga';
import plugins from './envelop';

const yogaPort = 4000;

(async () => {
  const schema = await genSchema();
  const yoga = createYoga({
    schema,
    plugins: [
      // Ticket 3: enforce required 'client' header at the HTTP level
      {
        onRequest({ request, fetchAPI, endResponse }: any) {
          const client = request.headers.get('client');
          if (!client) {
            const response = new fetchAPI.Response(
              JSON.stringify({ errors: [{ message: 'Missing required header: client' }] }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
            endResponse(response);
          }
        },
      },
      ...plugins,
    ],
  });
  const server = createServer(yoga);

  server.listen(yogaPort, () => {
    console.log(`Server is listening at http://localhost:${yogaPort}/graphql`);
  });
})();
