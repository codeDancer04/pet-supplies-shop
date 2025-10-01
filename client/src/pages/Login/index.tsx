import type React from "react"
import LoginForm from "../../components/LoginForm";
import HomeNavBar from "../../components/HomeNavBar";
import PrivateRoute from "../../components/PrivateRoute";

const Login:React.FC = ()=>{
    return(
        <>
        <HomeNavBar></HomeNavBar>
        <PrivateRoute requireAuth={false}>
            <LoginForm></LoginForm> 
        </PrivateRoute>
        
        </>
    )
};
export default Login;