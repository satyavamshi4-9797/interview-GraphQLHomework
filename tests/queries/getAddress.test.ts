import { parse } from 'graphql';
import { executor } from '../exectuor';

describe('getAddress', () => {
  test('Success', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                    state
                }
            }
        `;

    const variables = { username: 'jack' };

    const result = await executor({
      document: parse(query),
      variables,
    });

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          address: {
            street: '123 Street St.',
            city: 'Sometown',
            zipcode: '43215',
            state: 'OH',
          },
        },
      })
    );
  });

  test('Error', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    zipcode
                    state
                }
            }
        `;

    const variables = { username: 'john' };

    const result = await executor({
      document: parse(query),
      variables,
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'No address found in getAddress resolver',
          }),
        ]),
      })
    );
  });

  test('Response includes metadata with requestId', async () => {
    const query = `
      query GetAddress($username: String!) {
        address(username: $username) {
          street
        }
      }
    `;
    const result = (await executor({
      document: parse(query),
      variables: { username: 'jack' },
    })) as any;

    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('requestId');
    expect(typeof result.metadata.requestId).toBe('string');
    expect(result.metadata.requestId.length).toBeGreaterThan(0);
  });
});
