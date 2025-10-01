import HomeNavBar from "../../components/HomeNavBar";
import ShoppingCart from "../../components/ShoppingCart";
import styles from './index.module.css';

const Cart = () => {
    return (
        <div className={styles['dad-container']}>
            <HomeNavBar></HomeNavBar>
            <div className={styles['cart-container']}>
            <ShoppingCart/>
            </div>
        </div>
    );
}

export default Cart;