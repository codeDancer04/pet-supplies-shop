import { useState } from 'react';
import { Button, message, Modal } from 'antd';
import { InputNumber } from "antd";
import createTokenAxios from '../../api/utils/createTokenAxios';
type dataFormType = {
    productId:number,
    amount:number,
    price:number
  }
type Props = {
    productId:number,
    price:number
}

const App = ({productId,price}:Props) => {
  const api = createTokenAxios();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    try{
        const token = localStorage.getItem('token');
        if(!token){
            console.log('获取token失败！');
            message.error('请先登录');
            return;
        }
        const dataForm:dataFormType = {
            productId:productId,
            amount:quantity,
            price:price * quantity,
        };
        const res = await api.post('/api/buy',dataForm);
        if(res.data.success){
            message.success(`购买成功！已生成订单信息`);
            setOpen(false);
        }
    }catch(err){
        console.error('购买请求失败:', err);
        message.error('购买过程中发生错误');
    }finally{
        setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('取消');
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" variant='solid' onClick={showModal}>
        购买
      </Button>
      <Modal
        title="填写购买信息"
        open={open}
        onOk={()=>{
            handleOk()
        }}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>购买数量:</p>
        <InputNumber min={1} max={99} defaultValue={1}
        value={quantity} onChange={(value)=>setQuantity(value || 1)}/>
        <p>总价：¥{(price * quantity).toFixed(2)}</p>
      </Modal>
    </>
  );
};

export default App;