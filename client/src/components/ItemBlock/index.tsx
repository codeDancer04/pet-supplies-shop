import styles from './index.module.css'
import ImageLink from '../ImageLink';
import BuyModal from '../BuyModal';
import AddModal from '../AddModal';

type ItemBlockProps = {
    key:number,
    name: string,
    category: string,
    productId: number,
    price: number,
    img_url: string
}
const API_BASE_URL = 'http://localhost:3000';

const App = (ItemInfo:ItemBlockProps) =>{
    return(
        <>
            <div className={styles['item-container']}>

                <div className={styles['item-img-container']}>
                    <ImageLink  imgUrl={`${API_BASE_URL}${ItemInfo.img_url}`} href='#'
                    imgWidth='100%' imgHeight='100%'
                    />
                </div>
                
                <div className={styles['item-title-container']}>
                    <span className={styles['name-font']}>{ItemInfo.name}</span>
                </div>

                <div className={styles['item-btn-container']}>
                    <div className={styles.space0}></div>
                    <span className={styles['price-font']}>{ItemInfo.price}元</span>
                    <div className={styles.space1}></div>
                    <AddModal productId={ItemInfo.productId} price={ItemInfo.price}></AddModal>
                    <div className={styles.space2}></div>
                    <BuyModal productId={ItemInfo.productId} price={ItemInfo.price}></BuyModal>
                </div>

            </div>
        </>
    )
};
export default App;