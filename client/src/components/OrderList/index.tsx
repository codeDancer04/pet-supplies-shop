import React, { useEffect, useState } from 'react';
import { message, Space, Table } from 'antd';
import type { TableProps } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import createTokenAxios from '../../utils/createTokenAxios';
import useAuth from '../../hooks/useAuth';

type OrderInfoType = {
  id: number,
  date: Date,
  name: string,
  amount: number,
  price: number,
  status: string
  key?: string
}

const App: React.FC = () => {
  const columns: TableProps<OrderInfoType>['columns'] = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
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
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '操作',
      key: 'action',
      render: (record) => (
        <Space size="middle">
          <a>查看详情</a>
          <a onClick={(e) => {
            e.preventDefault();
            handleCancel(record.id);
          }}>取消订单</a>
        </Space>)
    },
  ];

  const api = createTokenAxios();
  const { isLoggedIn, isAuthChecked } = useAuth(); // 获取认证检查状态
  
  const handleCancel = async (id: number) => {
    const res = await api.delete(`/api/orders/${id}`);
    if (res.data.success) {
      message.success('订单取消成功');
      axiosData();
    }
  }

  const [orderInfo, setOrderInfo] = useState<OrderInfoType[]>([]);

  const axiosData = async () => {
    if (!isLoggedIn) {
      message.error('未登录！');
      return;
    }
    
    try {
      const res = await api.get('/api/orders');

      if (res.data.success) {
        const formattedData = res.data.data.map((order: OrderInfoType) => ({
          ...order,
          key: order.id.toString(),
        }));
        setOrderInfo(formattedData);
        console.log(formattedData);
      } else {
        message.error('未获得正确响应');
        console.log('未获得正确响应');
      }
    } catch (error) {
      console.error('API请求失败:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error('登录已过期，请重新登录');
        } else if (error.response?.status === 404) {
          message.error('API接口不存在，请检查后端服务');
        } else {
          message.error(`请求失败: ${error.message}`);
        }
      }
    }
  }

  useEffect(() => {
    // 只有当认证检查完成后再获取订单数据
    if (isAuthChecked) {
      axiosData();
    }
  }, [isAuthChecked]); // 依赖 isAuthChecked

  return (
    <>
      <Table columns={columns} dataSource={orderInfo} />
    </>
  )
};

export default App;