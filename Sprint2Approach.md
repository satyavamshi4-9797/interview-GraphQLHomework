## Sprint 2

### Ticket 8 — NASA Near Earth Objects API integration

The goal was to integrate the NASA NEO Feed API into the existing GraphQL server 
using GraphQL Mesh v0, keeping the resolver clean by using the generated SDK 
rather than making raw HTTP calls directly.

I started by looking at the NASA API response to understand the data structure. 
The main challenge was that `near_earth_objects` in the response is an object 
keyed by date rather than a flat array, so flattening it was going to be necessary 
before it could be returned as a clean list.

I installed `@graphql-mesh/cli` and `@graphql-mesh/json-schema` and created a 
`.meshrc.yml` config at the root of the project. I went with the `json-schema` 
handler since the NASA API is a plain REST endpoint with no OpenAPI spec — Mesh 
infers the schema from the JSON response shape.

One issue I ran into was the URL resolving to `/feed/feed` instead of `/feed`. 
The base endpoint already contained `/feed` and the path was adding it again. 
Fixing the path to start with `/?` resolved it.

After running `npx mesh build`, the `.mesh` folder was generated with the SDK. 
I noticed `getMeshSDK` wasn't available in this version so I used `getBuiltMesh` 
and called `mesh.execute()` directly.

The flattening and field mapping logic lives in `nasa.ts` using 
`Object.values().flat()` to turn the date-keyed response into a single array. 
Only the fields specified in the ticket are mapped — everything else from the 
NASA response is ignored. The resolver itself just calls `getNearEarthObjects` 
and returns the result, keeping it focused on a single responsibility.

Tested in the GraphQL playground with the sample dates from the ticket and got 
back 21 asteroids which matched the expected NASA API response for that date range.