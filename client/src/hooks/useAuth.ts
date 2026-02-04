import { useNavigate } from "react-router-dom";
import createTokenAxios from "../utils/createTokenAxios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";

type UserInfo = {
  avatarUrl: string;
  name: string;
};

const useAuth = (defaultAvatarUrl = 'defaultAvatar.jpg') => {
  const api = useMemo(() => createTokenAxios(), []);
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false); // 添加认证检查状态
  const [userInfo, setUserInfo] = useState<UserInfo>({
    avatarUrl: defaultAvatarUrl,
    name: '您还未登录'
  });

  const checkLoginStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setIsAuthChecked(true); // 设置认证检查完成
      return;
    }
    
    try {
      const res = await api.get('/api/userinfo');
      if (res.data.success && res.data.data) {
        setIsLoggedIn(true);
        setUserInfo({
          avatarUrl: res.data.data.avatarUrl || defaultAvatarUrl,
          name: res.data.data.name || '未知用户'
        });
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsAuthChecked(true); // 确保认证检查完成状态被设置
    }
  }, [api, defaultAvatarUrl]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/api/logout', {});
    } catch {
      void 0;
    } finally {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserInfo({
        avatarUrl: defaultAvatarUrl,
        name: '您还未登录'
      });
      message.success('退出成功！');
    }
  }, [api, defaultAvatarUrl]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return {
    isLoggedIn,
    isAuthChecked, // 返回认证检查状态
    userInfo,
    handleLogin,
    handleLogout
  };
};

export default useAuth;
