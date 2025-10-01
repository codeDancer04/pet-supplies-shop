import React, { useEffect, useState } from 'react';
import {
    DribbbleCircleFilled,
    GiftFilled,
    MedicineBoxFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PayCircleFilled,
  ShoppingFilled,
  SkinFilled,
  SmileFilled,
  StarFilled,
  ToolFilled
} from '@ant-design/icons';
import { Button, Layout, Menu, message, theme } from 'antd';
import styles from './index.module.css';
import ItemList from '../ItemList';
import createAxios from '../../utils/createAxios';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const api = createAxios();
  const [products,setProducts] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const axiosProduct = async (info:{key:string})=>{  //请求商品信息函数
    try {
        const res = await api('/api/products',{
            params:{
                category:info.key
            }
        });
        if(res.data.success){
            console.log('查询成功',res.data);
            setProducts(res.data.data);
        }else{
            message.error(res.data.message);
            console.log('查询失败');
        }
    } catch (error:any) {
        console.error('请求失败:'+error);
        message.error(error.res.data.message);
    }
  }

  useEffect(()=>{
    axiosProduct({key:'food'});  //渲染默认商品信息
  },[])

  const handleMenuClick = async (info:{key:string})=>{
    axiosProduct(info);  //请求分类商品信息
  }

  return (
    <div className={styles['dad-container']}>
        <div className={styles['son-container']}>
        <Layout className={styles.lo}>
        <Sider className={styles.si} trigger={null} collapsible collapsed={collapsed}>
            <div className={styles["demo-logo-vertical"]} />
            <Menu
            className={styles.me}
            onClick={handleMenuClick}
            theme="light"
            mode="inline"
            defaultSelectedKeys={['food']}
            items={[
                {
                key: 'food',
                icon: <SmileFilled />,
                label: '宠物粮食',
                },
                {
                key: 'furniture',
                icon: <GiftFilled />,
                label: '宠物家具',
                },
                {
                key: 'toy',
                icon: <DribbbleCircleFilled />,
                label: '趣味玩具',
                },
                {
                key: 'clothes',
                icon: <SkinFilled />,
                label: '服装饰品',
                },
                {
                key: 'tool',
                icon: <ToolFilled />,
                label: '管理工具',
                },
                {
                key: 'medicine',
                icon: <MedicineBoxFilled />,
                label: '医护清洁',
                },
                {
                key: 'vip',
                icon: <StarFilled />,
                label: '会员专享',
                },
                {
                key: 'discount',
                icon: <PayCircleFilled />,
                label: '折扣商品',
                },
                {
                key: 'import',
                icon: <ShoppingFilled />,
                label: '进口商品',
                },
            ]}
            />
        </Sider>
        <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                fontSize: '16px',
                width: 64,
                height: 64,
                }}
            />
            <span>分类商品</span>
            </Header>
            <Content
            style={{
                margin: '5px 5px',
                padding: 5,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                overflowY: 'auto',  // 关键属性：启用垂直滚动
                maxHeight: 'calc(100vh - 465px)', // 动态计算最大高度
                height: '100%'      // 确保高度填充
            }}
            >
            <ItemList products={products}></ItemList>
            </Content>
        </Layout>
        </Layout>
    </div> 
    </div>
    
  );
};

export default App;