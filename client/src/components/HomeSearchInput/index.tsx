import React from 'react';
import { Input, Space } from 'antd';
import type { GetProps } from 'antd';
import styles from './index.module.css';

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;


const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

const HomeSearchInput: React.FC = () => (
  <>
    <div className={styles['search-input-container']}>
      <img src="web-logo.jpg" alt="logo" className={styles['web-logo-img']}/>
      <Space direction="vertical" className={styles['search-area']}>
        <Search className={styles['home-search-input']}
        size='large'
        placeholder="搜索你想要的商品" onSearch={onSearch} enterButton />
        <div className={styles['a-bar']}>
          <a href="#">金毛专用粮</a>
          <a href="#">猫狗按摩器</a>
          <a href="#">澳洲进口猫条</a>
          <a href="#">粘毛贴</a>
          <a href="#">猫猫公主裙</a>
          <a href="#">柴犬驱虫药</a>
        </div>
      </Space>
    </div>
    
  </>
  
);

export default HomeSearchInput;
