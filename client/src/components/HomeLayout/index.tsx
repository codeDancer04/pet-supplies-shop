import React from 'react';
import { Flex, Layout } from 'antd';
import HomeNavBar from '../HomeNavBar';
import HomeSearchInput from '../HomeSearchInput';
import HomeContentSiderLayout from '../HomeContentSiderLayout';
import HomeOtherContentLayout from '../HomeOtherContentLayout';

const { Header, Footer, Content } = Layout;

const headerStyle: React.CSSProperties = {
  color: '#000000ff',
  height: 64,
  paddingInline: 0,
  lineHeight: '64px',
  backgroundColor: '#ffffffff',
};

const contentStyle: React.CSSProperties = {
  minHeight: 120,
  lineHeight: '120px',
  color: '#000000ff',
  backgroundColor: '#ffffffff',
  position:'relative',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#949494ff',
};

const layoutStyle = {
  overflow: 'hidden',
};

const HomeLayout: React.FC = () => (
  <Flex gap="middle" wrap>
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>
            <HomeNavBar></HomeNavBar>
      </Header>
      <Content style={contentStyle}>
            <HomeSearchInput></HomeSearchInput>
            <HomeOtherContentLayout></HomeOtherContentLayout>
            <HomeContentSiderLayout></HomeContentSiderLayout>
      </Content>
      <Footer style={footerStyle}>
        <p>狗狗购 ©2025 Created by 李舰</p>
        <p>联系电话：+86 15579358995 qq邮箱：2048093857@qq.com</p>
      </Footer>
    </Layout>
  </Flex>
);

export default HomeLayout;