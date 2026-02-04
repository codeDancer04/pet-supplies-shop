import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { cartReducer } from "../components/ShoppingCart/cartReducer";
import useAuth from "./useAuth";
import { message, Modal } from "antd";
import createTokenAxios from "../utils/createTokenAxios";

    interface CartItemType {
    id: string;
    name: string;
    amount: number;
    price: number;
    totalPrice: number;
    key?: string;
    }

    type ApiCartItem = {
    id: number | string;
    name: string;
    amount: number;
    price: number;
    [key: string]: unknown;
    }

    type CartState = {
    cartItem:CartItemType[];
    loading:boolean;
    deleteLoading:boolean;
    error:string | null;
    }

export const useCart = () => {
    const initialState:CartState = {
        cartItem:[],
        loading:true,
        error:null,
        deleteLoading:false
    }
    const[state,dispatch] = useReducer(cartReducer,initialState);

    const navigate = useNavigate();
    const { isLoggedIn, isAuthChecked } = useAuth();

    const api = useMemo(() => createTokenAxios(), []);

const axiosData = useCallback(async () => {
        if (!isLoggedIn) {
        message.error('请先登录！');
        navigate('/login');
        return;
        }

    dispatch({type:'SET_LOADING',payload:true})
    dispatch({type:'SET_ERROR',payload:null})

    try {
      const res = await api.get('/api/cart');
      console.log('API响应:', res.data);
      
      if (res.data.success) {
        if (!Array.isArray(res.data.data)) {
          console.error('API返回的数据不是数组:', res.data.data);
          dispatch({type:'SET_ERROR',payload:'服务器返回的数据格式不正确'})
          return;
        }
        
        const formattedData: CartItemType[] = (res.data.data as ApiCartItem[]).map((item) => ({
          id: String(item.id),
          name: item.name,
          amount: item.amount,
          price: item.price,
          key: String(item.id),
          totalPrice: item.price * item.amount
        }));
        dispatch({type:'SET_CARTITEMS',payload:formattedData}); 
        message.success('购物车数据查询成功');
      } else {
        dispatch({type:'SET_ERROR',payload:'获取购物车数据失败'});
        message.error('获取购物车数据失败');
      }
    } catch (err: unknown) {
      console.log('API请求失败:', err);
      dispatch({type:'SET_ERROR',payload:'服务器错误，请稍后重试'});
      const status = (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { status?: number } }).response?.status
      ) || undefined;
      if (status === 401) {
        message.error('登录已过期，请重新登录');
        navigate('/login');
      } else {
        message.error('加载购物车失败');
      }
    } finally {
      dispatch({type:'SET_LOADING',payload:false});
    }
  }, [api, isLoggedIn,navigate]);

  useEffect(() => {
    if (isAuthChecked) {
      if (isLoggedIn) {
        axiosData();
      } else {
        message.error('请先登录！');
        navigate('/login');
      }
    }
  }, [isAuthChecked, isLoggedIn,axiosData,navigate]);

  const confirmDelete = (itemId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要从购物车中移除此商品吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => handleRemoveItem(itemId),
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    dispatch({type:'SET_DELETELOADING',payload:true});
    try {
      const res = await api.delete(`/api/cart/${itemId}`);
      if (res.data.success) {
        message.success('商品已移除');
        dispatch({type:'SET_CARTITEMS',payload:state.cartItem.filter(item => item.id !== itemId)});
      }
    } catch (error) {
      message.error('移除商品失败');
      console.error('移除商品失败:', error);
    } finally {
      dispatch({type:'SET_DELETELOADING',payload:false});
    }
  };
    return {
        // 状态
        cartItem: state.cartItem,
        loading: state.loading,
        deleteLoading: state.deleteLoading,
        error: state.error,
        //方法
        handleRemoveItem,
        confirmDelete,
        axiosData,
        }
}

    

