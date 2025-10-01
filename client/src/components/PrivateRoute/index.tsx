import { Navigate, useLocation } from 'react-router-dom';
import { checkTokenValid } from './checkTokenValid';
import type { ReactNode } from 'react';
import { message } from 'antd';

interface AuthRouteProps {
  children: ReactNode; // 明确声明children类型
  requireAuth?: boolean;
  redirectTo?: string;  // 未认证时重定向路径（默认'/login'）
}

const App = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthRouteProps) => {  
  const location = useLocation();
  const isAuthenticated = checkTokenValid();  //检查是否有token

  if (requireAuth && !isAuthenticated) {
    message.error('请先登录！');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    message.info('您已登录！');
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>; // 使用Fragment包裹确保类型安全
};

export default App;