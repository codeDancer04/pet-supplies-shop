import React, { useEffect, useState } from 'react';
import { HeartFilled, HomeFilled, PhoneFilled,SmileFilled, ToolFilled, WechatFilled } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import styles from './index.module.css';
import { Link, useLocation } from 'react-router-dom';


type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    label: (
    <Link to='/login'>登录/注册</Link>
      ),
    key: 'login',
    icon: <WechatFilled />,
  },
  {
    label:(
      <Link to='/home'>首页</Link>
    ),
    key:'home',
    icon:<HomeFilled />
  },
  {
    label:(
      <Link to='/cart'>购物车</Link>
    ),
    key:'cart',
    icon:<HeartFilled />
  },
  {
    label:(
      <Link to='/profile'>我的信息</Link>
    ),
    key: 'profile',
    icon: <SmileFilled />,
  },
  {
    key: 'chat',
    label: (
      <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
        咨询客服
      </a>
    ),
    icon:<PhoneFilled />
  },
  {
    key: 'about',
    label: (
      <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
        Bug反馈
      </a>
    ),
    icon:<ToolFilled />
  },
];

const HomeNavBar: React.FC = () => {
  const location = useLocation();
  const [current, setCurrent] = useState('home');

  useEffect(()=>{
    const pathToKey:Record<string,string> = {
      '/login': 'login',
      '/home': 'home',
      '/profile': 'profile',
      '/cart': 'cart'
    };
    setCurrent(pathToKey[location.pathname] || 'home');
  },[location.pathname])

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height:'64px',
      backgroundColor: '#fff', // 背景色防止透明
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)' // 添加阴影效果
    }}>
      <Menu onClick={onClick} selectedKeys={[current]}
      className={styles['home-nav-bar']} 
      mode="horizontal" items={[
            items[0],
            items[1],
            items[2],
            items[3],
            { 
            key: 'spacer', 
            className: styles.spacer, 
            },
            items[4],
            items[5]
        ]} />
    </div>
  );
};

export default HomeNavBar;