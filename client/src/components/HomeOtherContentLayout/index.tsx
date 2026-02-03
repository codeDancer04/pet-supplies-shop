import MyCarousel from '../MyCarousel';
import ProfileBlock from '../ProfileBlock';
import AIChatBox from '../AIChatBox';
import styles from './index.module.css';

const App = ()=>{
    return(
        <>
        <div className={styles['layout-wrapper']}>
            <div className={styles['content-inner']}>
                <div className={styles['left-section']}>
                    <AIChatBox />
                </div>

                <div className={styles['center-section']}>
                    <MyCarousel></MyCarousel>
                </div>

                <div className={styles['right-section']}>
                    <ProfileBlock></ProfileBlock>
                </div>
                
            </div>
        </div>
        </>
    )
}
export default App;
