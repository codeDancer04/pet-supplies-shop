import styles from './index.module.css';
import {Button, Image} from 'antd';
import useAuth from '../../hooks/useAuth';
type Props = {
    defaultAvatarUrl?:string,
}

const App = ({defaultAvatarUrl = 'defaultAvatar.jpg'}:Props)=>{
    
    const {
      isLoggedIn,
      userInfo,
      handleLogin,
      handleLogout
    } = useAuth(defaultAvatarUrl);

    return(
        <>
        <div className={styles['dad-container']}>

            <div className={styles['avatar-container']}>
                <Image src={`http://localhost:3000/img/${userInfo.avatarUrl}`}></Image>
            </div>

            <div className={styles['info-container']}>
                <span>{userInfo.name}</span>
            </div>

            <div className={styles['button-container']}>
                {isLoggedIn?(<Button color='primary' variant='solid' onClick={handleLogout}>退出登录</Button>):
                (<Button color='primary' variant='solid' onClick={handleLogin}>立即登录</Button>)}
                
            </div>

            <div className={styles['link-container']}>
                <a href='#' style={{display:'block'}} className={styles['a-container']}>
                    <div className={styles['d-container']}>
                    <span>购物车</span>
                    </div>
                </a>
                <a href='http://localhost:5173/profile' style={{display:'block'}} className={styles['a-container']}>
                    <div className={styles['d-container']}>
                    <span>我的订单</span>
                    </div>
                </a>
                <a href='#' style={{display:'block'}} className={styles['a-container']}>
                    <div className={styles['d-container']}>
                    <span>修改信息</span>
                    </div>
                </a>
                <a href='#' style={{display:'block'}} className={styles['a-container']}>
                    <div className={styles['d-container']}>
                    <span>我的消息</span>
                    </div>
                </a>
            </div>

        </div>
        </>
    )
};
export default App;