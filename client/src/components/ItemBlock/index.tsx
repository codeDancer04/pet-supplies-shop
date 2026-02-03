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
    console.log(ItemInfo);
    return(
        <div className={styles['product-card']}>
            <div className={styles['image-wrapper']}>
                <ImageLink  imgUrl={`${API_BASE_URL}/img/${ItemInfo.img_url}`} href='#'
                imgWidth='100%' imgHeight='100%'
                />
            </div>
            
            <div className={styles['product-details']}>
                <div className={styles['title-wrapper']}>
                    <span className={styles['product-name']} title={ItemInfo.name}>{ItemInfo.name}</span>
                </div>

                <div className={styles['card-footer']}>
                    <span className={styles['product-price']}>
                        <span className={styles['currency']}>¥</span>
                        {ItemInfo.price}
                    </span>
                    
                    <div className={styles['actions']}>
                        <AddModal productId={ItemInfo.productId} price={ItemInfo.price}></AddModal>
                        <BuyModal productId={ItemInfo.productId} price={ItemInfo.price}></BuyModal>
                    </div>
                </div>
            </div>
        </div>
    )
};
export default App;
