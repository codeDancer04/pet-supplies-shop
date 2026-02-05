import type React from "react"
import { useEffect, useMemo, useState } from "react"
import styles from './index.module.css'
import OrderList from "../../components/OrderList";
import PrivateRoute from "../../components/PrivateRoute";
import HomeNavBar from "../../components/HomeNavBar";
import { Button, Form, Input, message, Avatar, Typography, Divider } from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import createTokenAxios from "../../utils/createTokenAxios";
import useAuth from "../../hooks/useAuth";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
    const { userInfo, checkLoginStatus } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const api = useMemo(() => createTokenAxios(), []);

    // 当 userInfo 更新时，回填表单
    useEffect(() => {
        if (userInfo) {
            form.setFieldsValue({
                name: userInfo.name,
                phoneNumber: userInfo.phoneNumber,
                address: userInfo.address
            });
        }
    }, [userInfo, form]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await api.put('/api/userinfo', values);
            if (res.data.success) {
                message.success('个人信息更新成功');
                // 刷新用户信息
                await checkLoginStatus();
            } else {
                message.error(res.data.message || '更新失败');
            }
        } catch (error) {
            console.error(error);
            message.error('更新失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PrivateRoute requireAuth={true}>
            <div className={styles.container}>
                <div className={styles['navbar-container']}>
                    <HomeNavBar />
                </div>

                <div className={styles['content-wrapper']}>
                    {/* 左侧个人信息区域 */}
                    <div className={styles['user-info-side']}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar 
                                size={80} 
                                src={userInfo.avatarUrl} 
                                icon={<UserOutlined />} 
                                style={{ marginBottom: 16 }}
                            />
                            <Title level={4} style={{ margin: 0 }}>{userInfo.name}</Title>
                            <Text type="secondary">{userInfo.phoneNumber}</Text>
                        </div>

                        <Divider>编辑资料</Divider>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="昵称"
                                name="name"
                                rules={[{ required: true, message: '请输入昵称' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="请输入昵称" />
                            </Form.Item>

                            <Form.Item
                                label="手机号"
                                name="phoneNumber"
                            >
                                <Input prefix={<PhoneOutlined />} disabled placeholder="手机号暂不支持修改" />
                            </Form.Item>

                            <Form.Item
                                label="收货地址"
                                name="address"
                                rules={[{ required: false, message: '请输入收货地址' }]}
                            >
                                <Input.TextArea 
                                    rows={3} 
                                    placeholder="请输入详细收货地址" 
                                    style={{ resize: 'none' }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block loading={loading}>
                                    保存修改
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    {/* 右侧订单列表区域 */}
                    <div className={styles['order-list-side']}>
                        <Title level={4} style={{ marginBottom: 24 }}>我的订单</Title>
                        <OrderList />
                    </div>
                </div>
            </div>
        </PrivateRoute>
    )
};

export default Profile;