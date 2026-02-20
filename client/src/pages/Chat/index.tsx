import AIShoppingModePage from '../../components/AIShoppingModePage';
import HomeNavBar from '../../components/HomeNavBar';
import styles from './index.module.css';
const Chat = ()=>{
    return(
        <>
        <div className={styles['chat-container']}>
            <HomeNavBar/>
            <div className={styles['chat-content']}>
                <AIShoppingModePage/>
            </div>
        </div>
        </>
    )
}
export default Chat;