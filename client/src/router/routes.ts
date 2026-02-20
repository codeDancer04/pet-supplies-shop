import { createBrowserRouter, type RouteObject } from "react-router-dom";
import Chat from "../pages/Chat";
import Home from '../pages/Home';
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import Signup from "../pages/Signup";
import Cart from "../pages/Cart";

const routes:RouteObject[] = [
    {
        index:true,
        Component:Home
    },
    {
        path:'/login',
        Component:Login
    },
    {
        path:'/signup',
        Component:Signup
    },
    {
        path:'/home',
        Component:Home
    },
    {
        path:'/profile',
        Component:Profile
    },
    {
        path:'/cart',
        Component:Cart
    },
    {
        path:'/chat',
        Component:Chat
    },
];
export default createBrowserRouter(routes);