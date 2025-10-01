import { useEffect } from 'react';
import { Button, message, Space, Spin, Table, type TableProps } from 'antd';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface CartItemType {
  id: string;
  name: string;
  amount: number;
  price: number;
  totalPrice: number;
  key?: string;
}


const App = () => {
  const columns: TableProps<CartItemType>['columns'] = [
    {
      title: '购物号',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '商品名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: CartItemType) => (
        <Space size="middle">
          <a>直接购买</a>
          <a onClick={(e) => {
            e.preventDefault();
            confirmDelete(record.id);
          }}>删除此项</a>
        </Space>
      )
    },
  ];

  const{
        cartItem,
        loading,
        deleteLoading,
        error,
        confirmDelete,
        axiosData} = useCart();
  const navigate = useNavigate();
  const { isLoggedIn, isAuthChecked } = useAuth();
  
  // 在 useEffect 中诚实、完整地声明所有依赖
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

  // 如果认证检查尚未完成，显示加载中
  if (!isAuthChecked) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <p>检查登录状态中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>
        <button onClick={axiosData}>重新加载</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <p>加载购物车数据中...</p>
      </div>
    );
  }

  if (cartItem.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>您的购物车是空的</p>
        <Button color='primary' variant='solid' onClick={() => navigate('/home')}>去购物</Button>
      </div>
    );
  }

  return (
    <>
      <Table
        columns={columns}
        dataSource={cartItem}
        loading={deleteLoading}
        pagination={false}
      />
    </>
  );
};

export default App;