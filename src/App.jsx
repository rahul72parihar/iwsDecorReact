import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home/Home.jsx";

import Products from "./pages/Products/Products.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";






import Cart from "./pages/Cart/Cart.jsx";
import Wishlist from "./pages/Wishlist/Wishlist.jsx";

import Checkout from "./pages/Checkout/Checkout.jsx";
import Shipping from "./pages/Checkout/Shipping.jsx";
import Payment from "./pages/Checkout/Payment.jsx";
import OrderSuccess from "./pages/Checkout/OrderSuccess.jsx";

import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";

import Profile from "./pages/User/Profile.jsx";
import Orders from "./pages/User/Orders.jsx";
import OrderDetails from "./pages/User/OrderDetails.jsx";
import Addresses from "./pages/User/Addresses.jsx";
import UserWishlist from "./pages/User/Wishlist.jsx";
import Settings from "./pages/User/Settings.jsx";


import SearchResults from "./pages/Search/SearchResults.jsx";

import CategoryPage from "./pages/CategoryPage/CategoryPage.jsx";
import SubcategoryPage from "./pages/SubcategoryPage/SubcategoryPage.jsx";

import BrassCollection from "./pages/Collections/BrassCollection.jsx";

import Chandeliers from "./pages/Collections/Chandeliers.jsx";
import PendantLights from "./pages/Collections/PendantLights.jsx";
import WallLights from "./pages/Collections/WallLights.jsx";

import About from "./pages/Static/About.jsx";
import Contact from "./pages/Static/Contact.jsx";
import FAQ from "./pages/Static/FAQ.jsx";
import Blog from "./pages/Static/Blog.jsx";
import BlogDetails from "./pages/Static/BlogDetails.jsx";
import PrivacyPolicy from "./pages/Static/PrivacyPolicy.jsx";
import TermsConditions from "./pages/Static/TermsConditions.jsx";
import ShippingPolicy from "./pages/Static/ShippingPolicy.jsx";
import ReturnPolicy from "./pages/Static/ReturnPolicy.jsx";

import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import AdminProducts from "./pages/Admin/Products.jsx";
import AdminCategories from "./pages/Admin/Categories.jsx";
import AdminOrders from "./pages/Admin/Orders.jsx";
import AdminCustomers from "./pages/Admin/Customers.jsx";
import AdminReviews from "./pages/Admin/Reviews.jsx";
import AdminVideoReviews from "./pages/Admin/VideoReviews.jsx";
import AdminSettings from "./pages/Admin/Settings.jsx";

import NotFound from "./pages/NotFound/NotFound.jsx";
import Unauthorized from "./pages/Unauthorized/Unauthorized.jsx";

import Toasts from "./components/Toasts/Toasts.jsx";
import AuthProvider from "./auth/AuthProvider.jsx";
import ProtectedAdminRoute from "./auth/ProtectedAdminRoute.jsx";
import ProtectedUserRoute from "./auth/ProtectedUserRoute.jsx";

import CartWishlistSyncMount from "./features/cart/cartWishlistSyncMount.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <CartWishlistSyncMount />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedUserRoute>
                <Home />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedUserRoute>
                <Products />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/products/:productId"
            element={
              <ProtectedUserRoute>
                <ProductDetails />
              </ProtectedUserRoute>
            }
          />





          <Route
            path="/cart"
            element={
              <ProtectedUserRoute>
                <Cart />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedUserRoute>
                <Wishlist />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedUserRoute>
                <Checkout />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/checkout/shipping"
            element={
              <ProtectedUserRoute>
                <Shipping />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/checkout/payment"
            element={
              <ProtectedUserRoute>
                <Payment />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <ProtectedUserRoute>
                <OrderSuccess />
              </ProtectedUserRoute>
            }
          />


          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/account/profile"
            element={
              <ProtectedUserRoute>
                <Profile />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/account/orders"
            element={
              <ProtectedUserRoute>
                <Orders />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/account/orders/:orderId"
            element={
              <ProtectedUserRoute>
                <OrderDetails />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/account/addresses"
            element={
              <ProtectedUserRoute>
                <Addresses />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/account/settings"
            element={
              <ProtectedUserRoute>
                <Settings />
              </ProtectedUserRoute>
            }
          />


          <Route
            path="/account/wishlist"
            element={
              <ProtectedUserRoute>
                <UserWishlist />
              </ProtectedUserRoute>
            }
          />

          <Route path="/search" element={<SearchResults />} />

          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route
            path="/category/:categorySlug/:subcategorySlug"
            element={<SubcategoryPage />}
          />

          <Route path="/collections/brass" element={<BrassCollection />} />

          <Route path="/collections/chandeliers" element={<Chandeliers />} />
          <Route
            path="/collections/pendant-lights"
            element={<PendantLights />}
          />
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

          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedAdminRoute>
                <AdminProducts />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedAdminRoute>
                <AdminCategories />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminOrders />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedAdminRoute>
                <AdminCustomers />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedAdminRoute>
                <AdminReviews />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/video-reviews"
            element={
              <ProtectedAdminRoute>
                <AdminVideoReviews />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettings />
              </ProtectedAdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toasts />
      </BrowserRouter>
    </AuthProvider>
  );
}
