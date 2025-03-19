import { Product } from '../interfaces/IBilling';

export const initialState = {
  searchTerm: '',
  selectedProducts: [] as Product[],
  isGenerating: false
};

export const reducer = (
  state: typeof initialState,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'ADD_PRODUCT':
      const existingProductIndex = state.selectedProducts.findIndex(
        (product) => product.id === action.payload.id
      );
      if (existingProductIndex !== -1) {
        return {
          ...state,
          selectedProducts: state.selectedProducts.map((product, index) =>
            index === existingProductIndex
              ? { ...product, quantity: product.quantity + 1 }
              : product
          ),
          isGenerating: false
        };
      }
      return {
        ...state,
        selectedProducts: [...state.selectedProducts, action.payload],
        isGenerating: false
      };
    case 'UPDATE_PRODUCT_QUANTITY':
      return {
        ...state,
        selectedProducts: state.selectedProducts.map((product, index) =>
          index === action.payload.index
            ? { ...product, quantity: action.payload.quantity }
            : product
        ),
        isGenerating: false
      };
    case 'UPDATE_PRODUCT_RATE':
      return {
        ...state,
        selectedProducts: state.selectedProducts.map((product, index) =>
          index === action.payload.index
            ? { ...product, rate: action.payload.rate }
            : product
        ),
        isGenerating: false
      };
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        selectedProducts: state.selectedProducts.filter(
          (_, index) => index !== action.payload.index
        ),
        isGenerating: false
      };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    default:
      return state;
  }
};
