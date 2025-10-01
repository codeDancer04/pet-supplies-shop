import type React from "react"
import styles from './index.module.css'
import OrderList from "../../components/OrderList";
import PrivateRoute from "../../components/PrivateRoute";
import HomeNavBar from "../../components/HomeNavBar";
const Profile:React.FC = ()=>{
    return(
        <>
        <PrivateRoute requireAuth={true}>

           <div className={styles.container}>

            <div className={styles['navbar-container']}>
            <HomeNavBar></HomeNavBar>
            </div>

            <div className={styles['order-container']}>
                <OrderList></OrderList>
            </div>

        </div> 

        </PrivateRoute>
        
        </>
    )
};
export default Profile;