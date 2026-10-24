import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Home from './pages/Home/Home';
import Menu from './pages/Menu/Menu';
import About from './pages/About/About';
import Login from './pages/Account/Login';
import Register from './pages/Account/Register';
import CheckEmail from './pages/Account/CheckEmail';
import ConfirmEmail from './pages/Account/ConfirmEmail';
import ForgotPassword from './pages/Account/ForgotPassword';
import ResetPassword from './pages/Account/ResetPassword';
import BookTable from './pages/Reservation/BookTable';
import Confirm from './pages/Reservation/Confirm';
import Details from './pages/Reservation/Details';
import Cancel from './pages/Reservation/Cancel';
import Order from './pages/Order/Order';
import OrderListPage from './pages/Order/OrderListPage';
import Shipping from './pages/Order/Shipping';
import Checkout from './pages/Order/Checkout';
import Placed from './pages/Order/Placed';
import Contact from './pages/Contact/Contact';
import Account from './pages/Account/Account';
import NotFound from './pages/NotFound';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="menu" element={<Menu />} />
                            <Route path="about" element={<About />} />
                            <Route path="order" element={<Order />} />
                            <Route path="order/list" element={<OrderListPage />} />
                            <Route path="order/shipping" element={<Shipping />} />
                            <Route path="order/checkout" element={<Checkout />} />
                            <Route path="order/:code" element={<Placed />} />
                            <Route path="reservation" element={<BookTable />} />
                            <Route path="reservation/confirm" element={<Confirm />} />
                            <Route path="reservation/:code" element={<Details />} />
                            <Route path="reservation/:code/cancel" element={<Cancel />} />
                            <Route path="contact" element={<Contact />} />
                            <Route path="account" element={<Account />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                        <Route element={<AuthLayout />}>
                            <Route path="account/login" element={<Login />} />
                            <Route path="account/register" element={<Register />} />
                            <Route path="account/check-email" element={<CheckEmail />} />
                            <Route path="account/confirm-email" element={<ConfirmEmail />} />
                            <Route path="account/forgot-password" element={<ForgotPassword />} />
                            <Route path="account/reset-password" element={<ResetPassword />} />
                        </Route>
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
