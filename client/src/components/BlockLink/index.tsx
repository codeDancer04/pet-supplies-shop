import type { JSX } from "react";
import styles from './index.module.css';
type Props = {
    href:string,
    title:string,
    icon?:JSX.Element,
}
const App = ({href,title,icon}:Props) =>{
    return(
        <>
        <a href={href} style={{display:'block'}} className={styles['dad-container']}>
            <div className={styles['son-container']}>
                {icon}
                <span>{title}</span>
            </div>
        </a>
        
        </>
    )
};
export default App;