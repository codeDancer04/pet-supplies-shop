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
        <div className={styles['profile-card']}>

            <div className={styles['avatar-wrapper']}>
                <Image src={`http://localhost:3000/img/${userInfo.avatarUrl}`}></Image>
            </div>

            <div className={styles['user-info']}>
                <span>{userInfo.name}</span>
            </div>

            <div className={styles['action-buttons']}>
                {isLoggedIn?(<Button className={styles['login-btn']} onClick={handleLogout}>退出登录</Button>):
                (<Button className={styles['login-btn']} onClick={handleLogin}>立即登录</Button>)}
                
            </div>

            <div className={styles['quick-links']}>
                <a href='#' style={{display:'block'}} className={styles['link-item']}>
                    <div className={styles['link-content']}>
                    <span>购物车</span>
                    </div>
                </a>
                <a href='http://localhost:5173/profile' style={{display:'block'}} className={styles['link-item']}>
                    <div className={styles['link-content']}>
                    <span>我的订单</span>
                    </div>
                </a>
                <a href='#' style={{display:'block'}} className={styles['link-item']}>
                    <div className={styles['link-content']}>
                    <span>修改信息</span>
                    </div>
                </a>
                <a href='#' style={{display:'block'}} className={styles['link-item']}>
                    <div className={styles['link-content']}>
                    <span>我的消息</span>
                    </div>
                </a>
            </div>

        </div>
        </>
    )
};
export default App;
