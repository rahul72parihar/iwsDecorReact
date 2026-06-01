import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home.jsx';

import Products from './pages/Products/Products.jsx';
import ProductDetails from './pages/Products/ProductDetails.jsx';

import CategoryProducts from './pages/Categories/CategoryProducts.jsx';

import Cart from './pages/Cart/Cart.jsx';
import Wishlist from './pages/Wishlist/Wishlist.jsx';

import Checkout from './pages/Checkout/Checkout.jsx';
import Shipping from './pages/Checkout/Shipping.jsx';
import Payment from './pages/Checkout/Payment.jsx';
import OrderSuccess from './pages/Checkout/OrderSuccess.jsx';

import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import ResetPassword from './pages/Auth/ResetPassword.jsx';

import Profile from './pages/User/Profile.jsx';
import Orders from './pages/User/Orders.jsx';
import OrderDetails from './pages/User/OrderDetails.jsx';
import Addresses from './pages/User/Addresses.jsx';
import UserWishlist from './pages/User/Wishlist.jsx';

import SearchResults from './pages/Search/SearchResults.jsx';

import BrassCollection from './pages/Collections/BrassCollection.jsx';
import Chandeliers from './pages/Collections/Chandeliers.jsx';
import PendantLights from './pages/Collections/PendantLights.jsx';
import WallLights from './pages/Collections/WallLights.jsx';

import About from './pages/Static/About.jsx';
import Contact from './pages/Static/Contact.jsx';
import FAQ from './pages/Static/FAQ.jsx';
import Blog from './pages/Static/Blog.jsx';
import BlogDetails from './pages/Static/BlogDetails.jsx';
import PrivacyPolicy from './pages/Static/PrivacyPolicy.jsx';
import TermsConditions from './pages/Static/TermsConditions.jsx';
import ShippingPolicy from './pages/Static/ShippingPolicy.jsx';
import ReturnPolicy from './pages/Static/ReturnPolicy.jsx';

import AdminDashboard from './pages/Admin/Dashboard.jsx';
import AdminProducts from './pages/Admin/Products.jsx';
import AdminCategories from './pages/Admin/Categories.jsx';
import AdminOrders from './pages/Admin/Orders.jsx';
import AdminCustomers from './pages/Admin/Customers.jsx';
import AdminReviews from './pages/Admin/Reviews.jsx';
import AdminSettings from './pages/Admin/Settings.jsx';

import NotFound from './pages/NotFound/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />

        <Route path="/categories/:categoryId" element={<CategoryProducts />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/shipping" element={<Shipping />} />
        <Route path="/checkout/payment" element={<Payment />} />
        <Route path="/checkout/success" element={<OrderSuccess />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/account/profile" element={<Profile />} />
        <Route path="/account/orders" element={<Orders />} />
        <Route path="/account/orders/:orderId" element={<OrderDetails />} />
        <Route path="/account/addresses" element={<Addresses />} />
        <Route path="/account/wishlist" element={<UserWishlist />} />

        <Route path="/search" element={<SearchResults />} />

        <Route path="/collections/brass" element={<BrassCollection />} />
        <Route path="/collections/chandeliers" element={<Chandeliers />} />
        <Route path="/collections/pendant-lights" element={<PendantLights />} />
        <Route path="/collections/wall-lights" element={<WallLights />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:blogId" element={<BlogDetails />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}





