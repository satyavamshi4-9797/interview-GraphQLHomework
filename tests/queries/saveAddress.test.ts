import { parse } from 'graphql';
import { executor } from '../exectuor';
import * as fs from 'fs';
import * as path from 'path';

const addressesPath = path.join(__dirname, '../../data/addresses.json');

// Store original data so we can restore it after each test
let originalData: string;

beforeEach(() => {
  originalData = fs.readFileSync(addressesPath, 'utf-8');
});

afterEach(() => {
  fs.writeFileSync(addressesPath, originalData, 'utf-8');
});

describe('saveAddress mutation', () => {
  test('Successfully saves a new address', async () => {
    const mutation = `
      mutation SaveAddress(
        $username: String!
        $street: String!
        $city: String!
        $zipcode: String!
        $state: String!
      ) {
        saveAddress(
          username: $username
          street: $street
          city: $city
          zipcode: $zipcode
          state: $state
        ) {
          street
          city
          zipcode
          state
        }
      }
    `;

    const variables = {
      username: 'newuser',
      street: '999 New Ave',
      city: 'Newcity',
      zipcode: '12345',
      state: 'CA',
    };

    const result = (await executor({
      document: parse(mutation),
      variables,
    })) as any;

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          saveAddress: {
            street: '999 New Ave',
            city: 'Newcity',
            zipcode: '12345',
            state: 'CA',
          },
        },
      })
    );
  });

  test('Does not overwrite existing records', async () => {
    const mutation = `
      mutation SaveAddress(
        $username: String!
        $street: String!
        $city: String!
        $zipcode: String!
        $state: String!
      ) {
        saveAddress(
          username: $username
          street: $street
          city: $city
          zipcode: $zipcode
          state: $state
        ) {
          street
        }
      }
    `;

    // Save a new user
    await executor({
      document: parse(mutation),
      variables: {
        username: 'tempuser',
        street: '111 Temp St',
        city: 'TempCity',
        zipcode: '00000',
        state: 'TX',
      },
    });

    // Verify jack's address is still intact
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
    const result = (await executor({
      document: parse(query),
      variables: { username: 'jack' },
    })) as any;

    expect(result.data.address).toEqual({
      street: '123 Street St.',
      city: 'Sometown',
      zipcode: '43215',
      state: 'OH',
    });
  });

  test('Persists address to file', async () => {
    const mutation = `
      mutation SaveAddress(
        $username: String!
        $street: String!
        $city: String!
        $zipcode: String!
        $state: String!
      ) {
        saveAddress(
          username: $username
          street: $street
          city: $city
          zipcode: $zipcode
          state: $state
        ) {
          street
        }
      }
    `;

    await executor({
      document: parse(mutation),
      variables: {
        username: 'persistuser',
        street: '777 Persist Ln',
        city: 'Persistville',
        zipcode: '54321',
        state: 'NY',
      },
    });

    const saved = JSON.parse(fs.readFileSync(addressesPath, 'utf-8'));
    expect(saved['persistuser']).toEqual({
      street: '777 Persist Ln',
      city: 'Persistville',
      zipcode: '54321',
      state: 'NY',
    });
  });
});
