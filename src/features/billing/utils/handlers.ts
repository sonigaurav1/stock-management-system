import { useCallback } from 'react';
import { debounce } from 'lodash';
import { Product } from '../interfaces/IBilling';

interface DispatchAction {
  type: string;
  payload?: any;
}

type Dispatch = (action: DispatchAction) => void;

export const useDebouncedSetSearchTerm = (dispatch: Dispatch) => {
  const debouncedFunction = useCallback(
    (value: string) => {
      debounce(() => {
        dispatch({ type: 'SET_SEARCH_TERM', payload: value });
      }, 300)();
    },
    [dispatch]
  );

  return useCallback(
    (value: string) => {
      debouncedFunction(value);
    },
    [debouncedFunction]
  );
};

type DebouncedSetSearchTerm = (value: string) => void;

export const handleProductSelect =
  (dispatch: Dispatch, debouncedSetSearchTerm: DebouncedSetSearchTerm) =>
  (product: Product) => {
    dispatch({
      type: 'ADD_PRODUCT',
      payload: { ...product, quantity: 1, rate: product.rate }
    });
    debouncedSetSearchTerm('');
  };

export const handleQuantityChange =
  (dispatch: Dispatch) => (index: number, quantity: number) => {
    if (quantity < 1) return;
    dispatch({
      type: 'UPDATE_PRODUCT_QUANTITY',
      payload: { index, quantity }
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
