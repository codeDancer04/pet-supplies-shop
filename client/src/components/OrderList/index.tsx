import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { message, Space, Table, Button, Image, Tag, Modal } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import createTokenAxios from '../../utils/createTokenAxios';
import useAuth from '../../hooks/useAuth';

type OrderInfoType = {
  id: number,
  date: Date,
  name: string,
  amount: number,
  price: number,
  status: string,
  img_url?: string,
  key?: string
}

const OrderList: React.FC = () => {
  const api = useMemo(() => createTokenAxios(), []);
  const { isLoggedIn } = useAuth();
  
  const [orderInfo, setOrderInfo] = useState<OrderInfoType[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = 'http://localhost:3000';

  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const res = await api.get('/api/orders');
      if (res.data.success) {
        const formattedData = res.data.data.map((order: OrderInfoType) => ({
          ...order,
          key: order.id.toString(),
        }));
        setOrderInfo(formattedData);
      }
    } catch (error) {
      console.error('API请求失败:', error);
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  }, [api, isLoggedIn]);

  const handleCancel = async (orderId: number) => {
    Modal.confirm({
      title: '确认取消订单',
      content: '确定要取消这个订单吗？此操作无法撤销。',
      okText: '确认取消',
      okType: 'danger',
      cancelText: '暂不取消',
      onOk: async () => {
        try {
          const res = await api.delete(`/api/orders/${orderId}`);
          if (res.data.success) {
            message.success('订单已取消');
            fetchOrders(); // 刷新列表
          }
        } catch (error) {
          message.error('取消订单失败');
        }
      }
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns: TableProps<OrderInfoType>['columns'] = [
    {
      title: '商品信息',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <Space>
          <Image
            width={80}
            height={80}
            src={record.img_url ? `${API_BASE_URL}/img/${record.img_url}` : undefined}
            fallback="https://via.placeholder.com/60"
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 500 }}>{record.name}</span>
            <span style={{ fontSize: 12, color: '#999' }}>订单号: {record.id}</span>
          </div>
        </Space>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
    },
    {
      title: '总价',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === '已完成') color = 'success';
        if (status === '待发货') color = 'processing';
        if (status === '未完成') color = 'warning';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">查看详情</Button>
          <Button 
            type="text" 
            danger 
            size="small" 
            onClick={() => handleCancel(record.id)}
          >
            取消订单
          </Button>
        </Space>
      )
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={orderInfo} 
      loading={loading}
      pagination={{ pageSize: 5 }}
    />
  );
};

export default OrderList;
