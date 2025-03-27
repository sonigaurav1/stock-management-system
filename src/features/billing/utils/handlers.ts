import { useCallback } from 'react';
import { Product } from '../interfaces/IBilling';

interface DispatchAction {
  type: string;
  payload?: any;
}

type Dispatch = (action: DispatchAction) => void;

export const useDebouncedSetSearchTerm = (dispatch: Dispatch) => {
  return useCallback(
    (value: string) => {
      dispatch({ type: 'SET_SEARCH_TERM', payload: value });
    },
    [dispatch]
  );
};

type DebouncedSetSearchTerm = (value: string) => void;

export const handleProductSelect =
  (dispatch: Dispatch, debouncedSetSearchTerm: DebouncedSetSearchTerm) =>
  (product: Product) => {
    dispatch({
      type: 'ADD_PRODUCT',
      payload: {
        ...product,
        quantity: 1, // Default quantity
        rate: product.rate,
        stockLevel: product.stockLevel // Include stockLevel
      }
    });
    debouncedSetSearchTerm('');
  };

export const handleQuantityChange =
  (dispatch: React.Dispatch<any>) =>
  (productId: string, newQuantity: number) => {
    if (isNaN(newQuantity) || newQuantity < 1) {
      alert('Quantity must be a valid number and at least 1.');
      return;
    }

    dispatch({
      type: 'UPDATE_PRODUCT_QUANTITY',
      payload: { productId, quantity: newQuantity }
    });
  };

export const handleRateChange =
  (dispatch: Dispatch) => (index: number, rate: number) => {
    if (rate < 0) return;
    dispatch({
      type: 'UPDATE_PRODUCT_RATE',
      payload: { index, rate }
    });
  };

export const handleRemoveProduct = (dispatch: Dispatch) => (index: number) => {
  dispatch({ type: 'REMOVE_PRODUCT', payload: { index } });
};
