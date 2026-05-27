# My Approach

## Ticket 1 — Adding `state` to the Address schema
Pretty straightforward — I added `state: String` to the GraphQL address type and 
updated the TypeScript type to match. The goal was to keep both in sync so there 
are no surprises at runtime.

## Ticket 2 — saveAddress mutation
I created a mutation that takes a username plus all the address fields and saves 
it to `addresses.json`. I reused the same `readAddresses` and `writeAddresses` 
helper functions that the existing `getAddress` resolver already used, so I wasn't 
duplicating file reading logic in two places.

## Ticket 3 — Enforcing the `client` header
This one had two parts. If the header is missing entirely I reject it at the HTTP 
level inside `server.ts` using a Yoga plugin — this made more sense than doing it 
in envelop since envelop doesn't have an `onRequest` hook. For the `strata` client 
specifically, I block mutations inside the `buildHeaders` envelop plugin by checking 
the operation type and throwing a GraphQLError if someone tries to run a mutation.

## Ticket 4 — requestId showing up in every log
The bug was that there was no requestId being generated before hitting the resolvers. 
I fixed this by generating a UUID in the `buildHeaders` envelop plugin on every 
request and putting it on the context. Then in the `useLogger` plugin I wire it into 
the logger so every single log statement automatically picks it up.

## Ticket 5 — client header in the logs
Same idea as Ticket 4 — I grabbed the `client` header value in `buildHeaders` and 
added it to context alongside the requestId. The logger then includes it in every 
log line automatically.

## Ticket 6 — Appending requestId to responses
I used the envelop `onExecuteDone` hook to add a `metadata` object to every response 
containing the requestId. This way the client always knows which requestId belongs 
to which response without having to dig through logs.

## Ticket 7 — Tests
I wrote tests covering the main scenarios — successfully fetching an address, getting 
an error when a user doesn't exist, saving a new address, making sure saving doesn't 
wipe out existing records, checking the file actually gets written, and verifying that 
every response comes back with a unique requestId in the metadata.

## General thoughts
The envelop plugin system was really useful for keeping things like logging, headers 
and response metadata out of the resolvers themselves. It meant the resolvers stay 
focused on just their job and the cross-cutting stuff lives in one place. The JSON 
file as a database is obviously not something you'd do in production but it kept 
things simple and worked well for this scope.