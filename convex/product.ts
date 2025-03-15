import { mutation } from './_generated/server';

export default mutation(async ({ db }) => {
  const products = await db.query('products').collect(); // Fetch all products

  for (const product of products) {
    await db.patch(product._id, {
      purchasePrice: undefined,
      discountPrice: undefined,
      barcode: undefined
    }); // Empty the column
  }
});
