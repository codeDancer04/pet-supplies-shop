interface CartItemType {
  id: string;
  name: string;
  amount: number;
  price: number;
  totalPrice: number;
  key?: string;
}

type CartState = {
 cartItem:CartItemType[];
 loading:boolean;
 deleteLoading:boolean;
 error:string | null;
}

type CartAction = 
|{type:'SET_ERROR',payload:string|null}
|{type:'SET_LOADING',payload:boolean}
|{type:'SET_DELETELOADING',payload:boolean}
|{type:'SET_CARTITEMS',payload:CartItemType[]}

export const cartReducer = (state:CartState,action:CartAction) => {
    switch(action.type){
        case'SET_LOADING':
            return{...state,loading:action.payload};
        case'SET_DELETELOADING':
            return{...state,deleteLoading:action.payload};
        case'SET_ERROR':
            return{...state,error:action.payload};
        case'SET_CARTITEMS':
            return{...state,cartItem:action.payload};
            default:
            return state;
    }
}