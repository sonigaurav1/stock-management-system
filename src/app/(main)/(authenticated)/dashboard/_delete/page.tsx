/* eslint-disable import/no-unresolved */
'use client';

import { api } from '@/../convex/_generated/api';
import { useMutation } from 'convex/react';

const ResetProductPrices = () => {
  const emptyProductPricesMutation = useMutation(api.products.default);

  const handleResetPrices = async () => {
    await emptyProductPricesMutation();
    alert('All product prices have been cleared!');
  };

  return <button onClick={handleResetPrices}>Clear Product Prices</button>;
};

export default ResetProductPrices;
