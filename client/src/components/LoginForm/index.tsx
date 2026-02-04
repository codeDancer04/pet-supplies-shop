import React from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import styles from './index.module.css';
import logo from './loginl-logo.jpg';
import { Link,useNavigate } from 'react-router-dom';
import createTokenAxios from '../../utils/createTokenAxios';

type LoginFormValues = {
  phone_number: string;
  password: string;
};

const LoginForm: React.FC = () => {

  const navigate = useNavigate();
  const api = createTokenAxios();
  const onFinish = async (values: LoginFormValues) => {
    try {
      // 发送登录请求
      const response = await api.post('/api/login', {
        phone_number: values.phone_number,
        password: values.password
      });

      // 处理成功响应
      if (response.data.success) {
        message.success(response.data.message||'登录成功');
        localStorage.setItem('token',response.data.data.token);
        navigate('/home');
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;
      switch (status) {
        case 400:
          message.error(data?.message || '请求参数错误');
          break;
        case 401:
          message.error(data?.message || '认证失败！');
          break;
        case 500:
          message.error(data?.message || '服务器内部错误');
          break;
        default:
          message.error(status ? `未知错误 (${status})` : '请求失败');
      }
    }
  
    };

  const onFinishFailed = (errorInfo: unknown) => {
    message.warning('请正确填写表单');
    console.log('Failed:', errorInfo);
  };

  return (
  <div className={styles['login-container']}>
    <img className={styles['login-logo-img']} src={logo} alt="logo"/>
    <div className={styles['login-form-container']}>
      <Form
        className={styles['login-form']}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="phone_number"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" label={null}>
          <Checkbox>记住我</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>
        <div className={styles.space}></div>
        <div className={styles['signup-link-container']}>
          <span>没有账号？去</span>
          <Link to='/signup'>注册一个</Link>  
        </div>
      </Form>  
    </div>   
  </div>
);
}

export default LoginForm;
