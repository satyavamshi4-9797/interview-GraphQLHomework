import * as fs from 'fs';
import * as path from 'path';
import { Addresses, Address, Args, SaveAddressArgs } from './types';
import { GraphQLError } from 'graphql';

const addressesPath = path.join(__dirname, '../../../data/addresses.json');

const readAddresses = (): Addresses => {
  const raw = fs.readFileSync(addressesPath, 'utf-8');
  return JSON.parse(raw) as Addresses;
};

const writeAddresses = (addresses: Addresses): void => {
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2), 'utf-8');
};

const _getAddress = (username: string): Address | null => {
  const addresses = readAddresses();
  return addresses[username] ?? null;
};

export const getAddress = (_: any, args: Args, context: any): Address => {
  context.logger.info('getAddress', 'Enter resolver');
  const address = _getAddress(args.username);
  if (address) {
    context.logger.info('getAddress', 'Returning address');
    return address;
  }
  context.logger.error('getAddress', 'No address found');
  throw new GraphQLError('No address found in getAddress resolver');
};

export const saveAddress = (_: any, args: SaveAddressArgs, context: any): Address => {
  context.logger.info('saveAddress', 'Enter resolver');
  const addresses = readAddresses();
  const newAddress: Address = {
    street: args.street,
    city: args.city,
    zipcode: args.zipcode,
    state: args.state,
  };
  addresses[args.username] = newAddress;
  writeAddresses(addresses);
  context.logger.info('saveAddress', 'Address saved');
  return newAddress;
};
