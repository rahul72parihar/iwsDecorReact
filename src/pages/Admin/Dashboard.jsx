import { useCallback, useEffect, useMemo, useState } from 'react';

import AdminNav from './AdminNav';
import { getCategoryCount } from '../../firebase/categoryService';
import { listOrdersForAdmin } from '../../firebase/orderService';
import { getProductCount } from '../../firebase/productService';
import { listReviewsForAdmin } from '../../firebase/reviewService';
import { listUserProfiles } from '../../firebase/userProfileService';

import './Dashboard.css';

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.toMillis === 'function') return new Date(value.toMillis());
  if (value.seconds) return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  const date = timestampToDate(value);
  if (!date) return 'Not available';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function safeValue(result, fallback) {
  return result.status === 'fulfilled' ? result.value : fallback;
}

function getCustomerName(order) {
  return order?.shippingAddress?.fullName || order?.userEmail || order?.userUid || 'Customer';
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    products: 0,
    categories: 0,
    orders: [],
    customers: [],
    reviews: [],
  });
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError('');

    try {
      const [productsResult, categoriesResult, ordersResult, customersResult, reviewsResult] = await Promise.allSettled([
        getProductCount(),
        getCategoryCount(),
        listOrdersForAdmin({ pageSize: 100 }),
        listUserProfiles(),
        listReviewsForAdmin({ pageSize: 100 }),
      ]);

      setSummary({
        products: safeValue(productsResult, 0),
        categories: safeValue(categoriesResult, 0),
        orders: safeValue(ordersResult, []),
        customers: safeValue(customersResult, []),
        reviews: safeValue(reviewsResult, []),
      });

      const failed = [productsResult, categoriesResult, ordersResult, customersResult, reviewsResult]
        .filter((result) => result.status === 'rejected');
      if (failed.length > 0) {
        setError('Some dashboard data could not be loaded. Check Firestore permissions or indexes.');
      }
    } catch (e) {
      setError(e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(refresh);
  }, [refresh]);

  const metrics = useMemo(() => {
    const orders = Array.isArray(summary.orders) ? summary.orders : [];
    const reviews = Array.isArray(summary.reviews) ? summary.reviews : [];
    const customers = Array.isArray(summary.customers) ? summary.customers : [];

    const revenue = orders.reduce((sum, order) => sum + Number(order?.totals?.total || 0), 0);
    const openOrders = orders.filter((order) => {
      const status = (order?.status || 'placed').toLowerCase();
      return !['delivered', 'cancelled', 'payment_failed'].includes(status);
    }).length;
    const pendingReviews = reviews.filter((review) => !review.status || review.status === 'pending').length;
    const approvedReviews = reviews.filter((review) => review.status === 'approved').length;
    const activeCustomers = customers.filter((customer) => (customer.status || 'active') === 'active').length;

    return {
      revenue,
      openOrders,
      pendingReviews,
      approvedReviews,
      activeCustomers,
    };
  }, [summary]);

  const recentActivity = useMemo(() => {
    const orderActivities = (summary.orders || []).slice(0, 5).map((order) => ({
      id: `order-${order.id}`,
      title: `Order #${order.id}`,
      meta: `${getCustomerName(order)} · ${formatCurrency(order?.totals?.total)}`,
      time: formatDate(order.createdAt),
      date: timestampToDate(order.createdAt),
    }));

    const reviewActivities = (summary.reviews || []).slice(0, 5).map((review) => ({
      id: `review-${review.id}`,
      title: `${review.status || 'Pending'} review`,
      meta: `${review.customerName || 'Customer'} · ${review.productName || review.productId || 'General'}`,
      time: formatDate(review.createdAt),
      date: timestampToDate(review.createdAt),
    }));

    const customerActivities = (summary.customers || []).slice(0, 5).map((customer) => ({
      id: `customer-${customer.uid || customer.id}`,
      title: 'Customer profile updated',
      meta: customer.displayName || customer.email || customer.uid || customer.id || 'Customer',
      time: formatDate(customer.updatedAt || customer.createdAt),
      date: timestampToDate(customer.updatedAt || customer.createdAt),
    }));

    return [...orderActivities, ...reviewActivities, ...customerActivities]
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
      .slice(0, 6);
  }, [summary]);

  const stats = [
    {
      label: 'Products',
      value: Number(summary.products || 0).toLocaleString('en-IN'),
      hint: `${Number(summary.categories || 0).toLocaleString('en-IN')} categories`,
      icon: '⬚',
    },
    {
      label: 'Orders',
      value: Number(summary.orders.length || 0).toLocaleString('en-IN'),
      hint: `${metrics.openOrders} open`,
      icon: '✓',
    },
    {
      label: 'Customers',
      value: Number(summary.customers.length || 0).toLocaleString('en-IN'),
      hint: `${metrics.activeCustomers} active profiles`,
      icon: '◈',
    },
    {
      label: 'Reviews',
      value: Number(summary.reviews.length || 0).toLocaleString('en-IN'),
      hint: `${metrics.pendingReviews} pending · ${metrics.approvedReviews} approved`,
      icon: '★',
    },
  ];

  return (
    <div className="adminShell">
      <AdminNav />

      <div className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Dashboard</h1>
            <p>Live overview of store activity and admin priorities.</p>
          </div>

          <button
            type="button"
            className="adminDashRefresh"
            onClick={refresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {error && <div className="adminDashError">{error}</div>}

        <section className="adminDashGrid" aria-label="Admin dashboard">
          {stats.map((stat) => (
            <div className="adminStat" key={stat.label}>
              <div className="adminStatTop">
                <div>
                  <div className="adminStatLabel">{stat.label}</div>
                  <div className="adminStatValue">{loading ? '...' : stat.value}</div>
                </div>
                <div className="adminStatIcon" aria-hidden="true">
                  {stat.icon}
                </div>
              </div>
              <div className="adminStatHint">{loading ? 'Loading' : stat.hint}</div>
            </div>
          ))}

          <div className="adminRevenue">
            <div>
              <h2>Revenue</h2>
              <p>From the latest {summary.orders.length} loaded orders.</p>
            </div>
            <strong>{loading ? '...' : formatCurrency(metrics.revenue)}</strong>
          </div>

          <div className="adminQuick">
            <h2>Quick links</h2>
            <div className="adminQuickList">
              <a className="adminQuickItem" href="/admin/products">
                <div className="adminQuickName">Products</div>
                <div className="adminQuickDesc">Manage {summary.products || 0} catalogue items</div>
              </a>
              <a className="adminQuickItem" href="/admin/categories">
                <div className="adminQuickName">Categories</div>
                <div className="adminQuickDesc">Organize {summary.categories || 0} storefront groups</div>
              </a>
              <a className="adminQuickItem" href="/admin/orders">
                <div className="adminQuickName">Orders</div>
                <div className="adminQuickDesc">{metrics.openOrders} open orders need attention</div>
              </a>
              <a className="adminQuickItem" href="/admin/customers">
                <div className="adminQuickName">Customers</div>
                <div className="adminQuickDesc">{metrics.activeCustomers} active customer profiles</div>
              </a>
              <a className="adminQuickItem" href="/admin/reviews">
                <div className="adminQuickName">Reviews</div>
                <div className="adminQuickDesc">{metrics.pendingReviews} pending moderation</div>
              </a>
              <a className="adminQuickItem" href="/admin/settings">
                <div className="adminQuickName">Settings</div>
                <div className="adminQuickDesc">Admin preferences and configuration</div>
              </a>
            </div>
          </div>

          <div className="adminActivity">
            <h2>Recent activity</h2>
            {loading ? (
              <div className="adminActivityEmpty">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="adminActivityEmpty">No recent activity yet.</div>
            ) : (
              recentActivity.map((activity) => (
                <div className="adminActivityRow" key={activity.id}>
                  <div className="adminActivityLeft">
                    <div className="adminDot" aria-hidden="true" />
                    <div>
                      <div className="adminActivityTitle">{activity.title}</div>
                      <div className="adminActivityMeta">{activity.meta}</div>
                    </div>
                  </div>
                  <div className="adminActivityTime">{activity.time}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
