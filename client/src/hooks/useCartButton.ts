import createTokenAxios from "../api/utils/createTokenAxios";
import { useState } from "react";
import useAuth from "./useAuth";
import { message } from "antd";

type DataFormType = {
    productId:number,
    amount:number,
    totalPrice:number
  }
type UseCartProps = {
    productId:number,
    price:number
}
type UseCartReturn = {
    open: boolean;
    quantity: number;
    confirmLoading: boolean;
    showModal: () => void;
    handleOk: () => Promise<void>;
    handleCancel: () => void;
    setQuantity: (value: number) => void;
    totalPrice:number;
}

const useCartButton = ({ productId, price }: UseCartProps):UseCartReturn => {
    const api = createTokenAxios();
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const {isLoggedIn,isAuthChecked} = useAuth(); 

    const showModal = () => {
    setOpen(true);
  };

    const handleOk = async () => {
    setConfirmLoading(true);
    if(isAuthChecked && !isLoggedIn){
        message.error('请先登录！');
        console.log('检查登陆状态成功：用户未登录');
        setConfirmLoading(false);
        return;
    
    }
    
    try{
        const dataForm:DataFormType = {
            productId:productId,
            amount:quantity,
            totalPrice:price * quantity,
        };
        const res = await api.post('/api/cart/add',dataForm);
        if(res.data.success){
            message.success('添加至购物车成功！');
            setOpen(false);
        }
    }catch(err){
        console.error('添加请求失败:', err);
        message.error('添加过程中发生错误');
    }finally{
        setConfirmLoading(false);
    }
  };

    const handleCancel = () => {
    console.log('取消');
    setOpen(false);
  };

  return{
    showModal,
    open,
    handleOk,
    confirmLoading,
    handleCancel,
    quantity,
    setQuantity,
    totalPrice:price * quantity
  }

};
export default useCartButton;