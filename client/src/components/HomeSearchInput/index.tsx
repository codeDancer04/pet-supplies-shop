import React from 'react';
import { Input, Space } from 'antd';
import type { GetProps } from 'antd';
import styles from './index.module.css';

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;
import createTokenAxios from '../../utils/createTokenAxios';
import { message } from 'antd';

// 搜索商品
const fetchSearch = async (keyword: string) => {
  const api = createTokenAxios();
  try {
    const res = await api.get('/api/search', {
      params: { keyword },
    });
    if (res.data?.success) {
      message.success(`查询成功！共${res.data.data.length}条商品`);
    } else {
      message.error(res.data?.message ?? '查询失败');
    }
  } catch (err) {
    console.error('查询失败:', err);
    message.error('查询过程中发生错误');
  }
};

const onSearch: SearchProps['onSearch'] = async (value) => {
  await fetchSearch(String(value ?? '').trim());
};

const HomeSearchInput: React.FC = () => (
  <>
    <div className={styles['search-input-container']}>
      <img src="web-logo.jpg" alt="logo" className={styles['web-logo-img']}/>
      <Space direction="vertical" className={styles['search-area']}>
        <Search className={styles['home-search-input']}
        size='large'
        placeholder="搜索你想要的商品" onSearch={onSearch} enterButton />
        <div className={styles['a-bar']}>
          {[
            '金毛专用粮',
            '宠物火腿肠',
            '冻干大棒骨',
            '粘毛贴',
            '宠物酸奶',
            '柴犬冻干粮',
          ].map((label) => (
            <a
              key={label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                fetchSearch(label);
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </Space>
    </div>
    
  </>
  
);

export default HomeSearchInput;
