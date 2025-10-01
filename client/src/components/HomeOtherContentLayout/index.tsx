import BlockLink from '../BlockLink';
import MyCarousel from '../MyCarousel';
import ProfileBlock from '../ProfileBlock';
import styles from './index.module.css';
import{ AccountBookOutlined, CameraOutlined, FileUnknownOutlined, FormOutlined, PhoneOutlined, RubyOutlined, SkinOutlined, ToolOutlined } from '@ant-design/icons';

const App = ()=>{
    return(
        <>
        <div className={styles['dad-container']}>
            <div className={styles['son-container']}>
                <div className={styles['ad-container']}>
                    <BlockLink href={'#'} title={'注册会员'} icon={<RubyOutlined />}></BlockLink>
                    <BlockLink href={'#'} title={'门店预约'} icon={<FormOutlined />}></BlockLink>
                    <BlockLink href={'#'} title={'洗护服务'} icon={<SkinOutlined />}></BlockLink>
                    <BlockLink href={'#'} title={'拍摄写真'} icon={<CameraOutlined />}></BlockLink>
                    <BlockLink href={'#'} title={'折扣商品'} icon={<AccountBookOutlined />}></BlockLink>
                    <BlockLink href={'#'} title={'专业驯化'} icon={<ToolOutlined />}></BlockLink>
                    <BlockLink href={'#'} title={'养宠知识'} icon={<FileUnknownOutlined />}></BlockLink>
                    <BlockLink href={'#'} title={'咨询客服'} icon={<PhoneOutlined />}></BlockLink>

                </div>

                <div className={styles['carousel-container']}>
                    <MyCarousel></MyCarousel>
                </div>

                <div className={styles['profile-container']}>
                    <ProfileBlock></ProfileBlock>
                </div>
                
            </div>
        </div>
        </>
    )
}
export default App;