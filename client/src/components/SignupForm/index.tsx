import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Upload} from 'antd';
import styles from './index.module.css';
import logo from './signup-logo.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const SignupForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
const onFinish = async(values: any) => {
  // 创建FormData对象，用于处理文件上传
  const formData = new FormData();
  
  // 添加表单数据到FormData
  formData.append('phone_number', values.phone);
  formData.append('password', values.confirmPassword);
  formData.append('name', values.name);
  
  // 如果有上传头像，将第一个文件添加到FormData
  if (values.avatar && values.avatar.length > 0) {
    formData.append('avatar', values.avatar[0].originFileObj);
  }

  try {
    //axios.post(url, data, config) 
    const response = await axios.post('http://localhost:3000/api/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // 设置正确的请求头
      }
    });

    // 处理成功响应
    if (response.status === 201) {
      message.success(response.data.message);
      navigate('/login');
    }
  } catch (error) {
    // 处理错误响应
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
       message.error(error.response.data.message);
      } else {
        alert('注册失败，请稍后重试！');
      }
    } else {
      console.error('未知错误:', error);
      alert('发生未知错误！');
    }
  }
};

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles['signup-container']}>
      <img className={styles['signup-logo-img']} src={logo} alt="logo" />
      <div className={styles['signup-form-container']}>
        <Form
          className={styles['signup-form']}
          form={form}
          name="signup"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="phone"
            label="输入电话"
            rules={[
              { required: true, message: '请输入电话号码' },
              { min: 8, message: '账号至少11位字符' }
            ]}
          >
            <Input placeholder='请输入11位数字' />
          </Form.Item>

          <Form.Item
            name="password"
            label="输入密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, max: 20, message: '密码长度8-20位' }
            ]}
          >
            <Input.Password placeholder='请输入8-20位字符' />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="再次输入密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({  //自定义验证函数
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder='请输入相同密码' />
          </Form.Item>

          <Form.Item
            name="name"
            label="输入昵称"
            rules={[
              { required: true, message: '请输入昵称' },
            ]}
          >
            <Input placeholder='请输入昵称' />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="上传头像"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              action="/upload.do"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // 阻止自动上传
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>点击上传</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 14 }}>
            <Button type="primary" htmlType="submit" className={styles['signup-form-submit-btn']}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SignupForm;