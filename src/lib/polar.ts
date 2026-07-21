import { Polar } from '@polar-sh/sdk';

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || 'sandbox_polar_token',
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

export const POLAR_PLANS = {
  STARTER_BUSINESS: {
    id: 'plan_starter_business',
    name: 'Business Starter',
    price: '$49/mo',
    locationsAllowed: 1,
    keywordsAllowed: 10,
  },
  AGENCY_GROWTH: {
    id: 'plan_agency_growth',
    name: 'Agency Growth',
    price: '$199/mo',
    locationsAllowed: 15,
    keywordsAllowed: 150,
  },
  AGENCY_SCALE: {
    id: 'plan_agency_scale',
    name: 'Agency Unlimited',
    price: '$499/mo',
    locationsAllowed: 100,
    keywordsAllowed: 1000,
  },
};
