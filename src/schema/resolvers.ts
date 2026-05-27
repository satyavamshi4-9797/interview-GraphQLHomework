import { getAddress, saveAddress } from './address/address';
import { Address, Args, SaveAddressArgs } from './address/types';

export const resolvers = {
  Query: {
    address: (_: any, args: Args, context: any): Address => {
      return getAddress(_, args, context);
    },
  },
  Mutation: {
    saveAddress: (_: any, args: SaveAddressArgs, context: any): Address => {
      return saveAddress(_, args, context);
    },
  },
};
