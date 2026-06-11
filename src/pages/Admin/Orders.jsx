import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import AdminNav from './AdminNav';
import auth from '../../firebase/firebaseAuth';
import {
  getOrderByIdForAdmin,
  listOrdersForAdmin,
  updateOrderStatus,
} from '../../firebase/orderService';

import './Orders.css';

const PAGE_SIZE = 12;

const STATUS_OPTIONS = [
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'paid', label: 'Paid' },
  { value: 'payment_failed', label: 'Payment Failed' },
];

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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status) {
  const key = (status || 'placed').toLowerCase();
  return STATUS_OPTIONS.find((item) => item.value === key)?.label || status || 'Placed';
}

function StatusBadge({ status }) {
  const key = (status || 'placed').toLowerCase();
  return (
    <span className={`adminOrdersStatus adminOrdersStatus--${key.replace(/_/g, '-')}`}>
      {getStatusLabel(key)}
    </span>
  );
}

function getCustomerName(order) {
  return (
    order?.shippingAddress?.fullName ||
    order?.customerName ||
    order?.userEmail ||
    order?.userUid ||
    'Customer'
  );
}

export default function AdminOrders() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const canManage = !!user;

  const refresh = useCallback(async () => {
    setFetching(true);
    setError('');
    setSuccess('');
    try {
      const list = await listOrdersForAdmin({ pageSize: 100 });
      setOrders(Array.isArray(list) ? list : []);
      setVisibleCount(PAGE_SIZE);
    } catch (e) {
      setError(e?.message || 'Failed to load orders');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) return;
    queueMicrotask(refresh);
  }, [canManage, refresh]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const status = (order?.status || 'placed').toLowerCase();
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;

      const fields = [
        order?.id,
        order?.userUid,
        order?.userEmail,
        order?.paymentMethod,
        getCustomerName(order),
        order?.shippingAddress?.phone,
        order?.shippingAddress?.city,
        order?.shippingAddress?.state,
      ];

      return fields.some((field) => String(field || '').toLowerCase().includes(q));
    });
  }, [orders, searchQuery, statusFilter]);

  const visibleOrders = useMemo(
    () => filteredOrders.slice(0, visibleCount),
    [filteredOrders, visibleCount],
  );

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order?.totals?.total || 0), 0);
    const openOrders = orders.filter((order) => {
      const status = (order?.status || 'placed').toLowerCase();
      return !['delivered', 'cancelled', 'payment_failed'].includes(status);
    }).length;
    const delivered = orders.filter((order) => (order?.status || '').toLowerCase() === 'delivered').length;

    return { totalRevenue, openOrders, delivered };
  }, [orders]);

  const selectedItems = Array.isArray(selectedOrder?.items) ? selectedOrder.items : [];
  const selectedTotals = selectedOrder?.totals || {};

  const onSelectOrder = async (order) => {
    if (!order?.id) return;
    setSelectedOrderId(order.id);
    setSelectedOrder(order);
    setError('');
    setSuccess('');

    try {
      const fresh = await getOrderByIdForAdmin(order.id);
      if (fresh) setSelectedOrder(fresh);
    } catch (e) {
      setError(e?.message || 'Failed to load order details');
    }
  };

  const onChangeStatus = async (nextStatus) => {
    if (!selectedOrder?.id || !nextStatus) return;
    setSavingStatus(true);
    setError('');
    setSuccess('');
    try {
      await updateOrderStatus(selectedOrder.id, nextStatus);
      setSuccess('Order status updated.');

      const patch = { ...selectedOrder, status: nextStatus };
      setSelectedOrder(patch);
      setOrders((prev) => prev.map((order) => (
        order.id === selectedOrder.id ? { ...order, status: nextStatus } : order
      )));
    } catch (e) {
      setError(e?.message || 'Failed to update order status');
    } finally {
      setSavingStatus(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="adminOrdersCenter">
        Loading...
      </div>
    );
  }

  return (
    <div className="adminShell">
      <AdminNav />

      <main className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Orders</h1>
            <p>
              Manage customer purchases, fulfillment status, and order details.
              <span className="adminProductsTotalBadge">{orders.length} total</span>
            </p>
          </div>

          <div className="adminProductsHeadActions">
            <button
              type="button"
              className="adminSettingsBtnSecondary"
              onClick={refresh}
              disabled={fetching}
            >
              {fetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {!canManage ? (
          <div className="adminSettingsError">Please log in to manage orders.</div>
        ) : (
          <>
            <section className="adminOrdersStats" aria-label="Order stats">
              <div className="adminOrdersStat">
                <span>Total Revenue</span>
                <strong>{formatCurrency(stats.totalRevenue)}</strong>
              </div>
              <div className="adminOrdersStat">
                <span>Open Orders</span>
                <strong>{stats.openOrders}</strong>
              </div>
              <div className="adminOrdersStat">
                <span>Delivered</span>
                <strong>{stats.delivered}</strong>
              </div>
            </section>

            {error && <div className="adminSettingsError adminOrdersNotice">{error}</div>}
            {success && <div className="adminSettingsSuccess adminOrdersNotice">{success}</div>}

            <section className="adminOrdersLayout">
              <div className="adminSettingsCard adminOrdersListCard">
                <div className="adminOrdersToolbar">
                  <div className="adminProductsSearchBox">
                    <svg className="adminProductsSearchIcon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="5.5" stroke="#aaa" strokeWidth="1.6" />
                      <path d="M13.5 13.5L17 17" stroke="#aaa" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <input
                      type="search"
                      className="adminProductsSearchInput"
                      placeholder="Search order, customer, phone, city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="adminProductsSearchClear"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        x
                      </button>
                    )}
                  </div>

                  <select
                    className="adminOrdersFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                {fetching && orders.length === 0 ? (
                  <div className="adminProductsEmpty">Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="adminProductsEmpty">
                    {orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}
                  </div>
                ) : (
                  <>
                    <div className="adminProductsTable adminOrdersTable">
                      <table aria-label="Orders table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleOrders.map((order) => (
                            <tr
                              key={order.id}
                              className={selectedOrderId === order.id ? 'adminProductsRowSelected' : ''}
                            >
                              <td>
                                <div className="adminProductsRowName">#{order.id}</div>
                                <div className="adminProductsRowId">
                                  {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                                </div>
                              </td>
                              <td>
                                <div className="adminProductsRowName">{getCustomerName(order)}</div>
                                <div className="adminProductsRowId">{order?.shippingAddress?.phone || order?.userUid || 'No phone'}</div>
                              </td>
                              <td>{formatDate(order.createdAt)}</td>
                              <td>{formatCurrency(order?.totals?.total ?? order?.totals?.subtotal)}</td>
                              <td><StatusBadge status={order.status} /></td>
                              <td>
                                <button
                                  type="button"
                                  className="adminProductsLinkBtn"
                                  onClick={() => onSelectOrder(order)}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="adminProductsPagination">
                      <span className="adminProductsPaginationInfo">
                        Showing {visibleOrders.length} of {filteredOrders.length}
                      </span>
                      {visibleCount < filteredOrders.length && (
                        <button
                          type="button"
                          className="adminSettingsBtnSecondary"
                          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                        >
                          Load more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <aside className="adminSettingsCard adminOrdersDetail">
                {!selectedOrder ? (
                  <div className="adminOrdersDetailEmpty">
                    <h2>Select an order</h2>
                    <p>Open any order from the list to review shipping, items, payment, and status.</p>
                  </div>
                ) : (
                  <>
                    <div className="adminOrdersDetailHead">
                      <div>
                        <h2>#{selectedOrder.id}</h2>
                        <p>{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                      <StatusBadge status={selectedOrder.status} />
                    </div>

                    <label className="adminOrdersStatusSelect">
                      <span>Status</span>
                      <select
                        value={selectedOrder.status || 'placed'}
                        onChange={(e) => onChangeStatus(e.target.value)}
                        disabled={savingStatus}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </label>

                    <div className="adminOrdersSection">
                      <h3>Customer</h3>
                      <p className="adminOrdersStrong">{getCustomerName(selectedOrder)}</p>
                      <p>{selectedOrder?.shippingAddress?.phone || 'No phone available'}</p>
                      <p className="adminOrdersMuted">User: {selectedOrder.userUid || 'Not available'}</p>
                    </div>

                    <div className="adminOrdersSection">
                      <h3>Shipping Address</h3>
                      {selectedOrder.shippingAddress ? (
                        <address>
                          {selectedOrder.shippingAddress.line1}
                          {selectedOrder.shippingAddress.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ''}
                          <br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                          <br />
                          {selectedOrder.shippingAddress.country}
                        </address>
                      ) : (
                        <p>No shipping address saved.</p>
                      )}
                    </div>

                    <div className="adminOrdersSection">
                      <h3>Items ({selectedItems.length})</h3>
                      <div className="adminOrdersItems">
                        {selectedItems.length === 0 ? (
                          <p>No items found.</p>
                        ) : selectedItems.map((item, index) => (
                          <div className="adminOrdersItem" key={item.id || `${item.name}-${index}`}>
                            {item.image ? (
                              <img src={item.image} alt={item.name || 'Order item'} />
                            ) : (
                              <div className="adminOrdersItemImage" />
                            )}
                            <div>
                              <strong>{item.name || 'Item'}</strong>
                              <span>{item.quantity || 1} x {formatCurrency(item.price)}</span>
                            </div>
                            <b>{formatCurrency(item.subtotal ?? Number(item.price || 0) * Number(item.quantity || 1))}</b>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="adminOrdersSection">
                      <h3>Payment & Totals</h3>
                      <div className="adminOrdersTotals">
                        <span>Payment</span>
                        <strong>{selectedOrder.paymentMethod || 'Not available'}</strong>
                        <span>Subtotal</span>
                        <strong>{formatCurrency(selectedTotals.subtotal)}</strong>
                        <span>Shipping</span>
                        <strong>{formatCurrency(selectedTotals.shipping)}</strong>
                        <span>Tax</span>
                        <strong>{formatCurrency(selectedTotals.tax)}</strong>
                        <span>Total</span>
                        <strong>{formatCurrency(selectedTotals.total)}</strong>
                      </div>
                    </div>
                  </>
                )}
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
