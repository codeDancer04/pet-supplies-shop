import { Button, Modal, Tooltip } from 'antd';
import { InputNumber } from "antd";
import {PlusOutlined} from '@ant-design/icons';
import useCartButton from '../../hooks/useCartButton';

type Props = {
    productId:number,
    price:number
}

const App = ({productId,price}:Props) => {

  const {
    showModal,
    open,
    handleOk,
    confirmLoading,
    handleCancel,
    quantity,
    setQuantity,
    totalPrice
  } = useCartButton({productId:productId,price:price});

  return (
    <>
      <Tooltip title="加入购物车">
            <Button shape="circle" icon={<PlusOutlined />} onClick={showModal}/>
      </Tooltip>
      <Modal
        title="填写添加信息"
        open={open}
        onOk={()=>{
            handleOk()
        }}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>添加数量:</p>
        <InputNumber min={1} max={99} defaultValue={1}
        value={quantity} onChange={(value)=>setQuantity(value || 1)}/>
        <p>总价：¥{totalPrice.toFixed(2)}</p>
      </Modal>
    </>
  );
};

export default App;