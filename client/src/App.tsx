import { RouterProvider } from 'react-router-dom';
import router from './router/routes';
import { ConfigProvider } from 'antd';
import '@ant-design/v5-patch-for-react-19';

function App() {

  return (
    <>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#fa8c16', // 主色改为橙色
          colorInfo: '#fa8c16',    // 信息色
        },
        components:{
          Menu:{
            itemHeight:55,
          },
          Carousel: {
            arrowSize:24
          },
        }
      }}
    >

    <RouterProvider router={router}></RouterProvider>

    </ConfigProvider>
    </>
  )
}

export default App;
