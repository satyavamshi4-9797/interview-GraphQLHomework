import { getAddress, saveAddress } from './address/address';
import { Address, Args, SaveAddressArgs } from './address/types';
import { getNearEarthObjects } from './nasa/nasa';

export const resolvers = {
  Query: {
    address: (_: any, args: Args, context: any): Address => {
      return getAddress(_, args, context);
    },
    nearEarthObjects: (_: any, args: { startDate: string; endDate: string }, context: any) => {
      return getNearEarthObjects(args.startDate, args.endDate);
    },
  },
  Mutation: {
    saveAddress: (_: any, args: SaveAddressArgs, context: any): Address => {
      return saveAddress(_, args, context);
    },
  },
};