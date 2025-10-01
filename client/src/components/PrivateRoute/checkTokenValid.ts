import * as jwtDecode from 'jwt-decode';  // 全量导入

export const checkTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode.jwtDecode(token);  // 通过命名空间调用
    return decoded.exp && Date.now() < decoded.exp * 1000;
  } catch {
    return false;
  }
};