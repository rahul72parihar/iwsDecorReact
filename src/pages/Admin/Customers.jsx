import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import AdminNav from './AdminNav';
import auth from '../../firebase/firebaseAuth';
import {
  deleteUserProfile,
  listUserProfiles,
  updateUserProfileByAdmin,
} from '../../firebase/userProfileService';
import { listOrdersForAdmin } from '../../firebase/orderService';

import './Customers.css';

const PAGE_SIZE = 12;

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.toMillis === 'function') return new Date(value.toMillis());
  if (value.seconds) return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = timestampToDate(value);
  if (!date) return 'Not available';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getDisplayName(customer) {
  return customer?.displayName || customer?.fullName || customer?.name || customer?.email || customer?.uid || 'Customer';
}

function makeOrderCustomer(order) {
  return {
    uid: order.userUid,
    id: order.userUid,
    displayName: order?.shippingAddress?.fullName || order.userEmail || order.userUid,
    email: order.userEmail || '',
    phone: order?.shippingAddress?.phone || '',
    status: 'active',
    role: 'customer',
    source: 'orders',
  };
}

export default function AdminCustomers() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedUid, setSelectedUid] = useState('');
  const [form, setForm] = useState({ displayName: '', email: '', phone: '', role: 'customer', status: 'active', notes: '' });
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
      const [profiles, orderList] = await Promise.all([
        listUserProfiles(),
        listOrdersForAdmin({ pageSize: 200 }),
      ]);
      setCustomers(Array.isArray(profiles) ? profiles : []);
      setOrders(Array.isArray(orderList) ? orderList : []);
      setVisibleCount(PAGE_SIZE);
    } catch (e) {
      setError(e?.message || 'Failed to load customers');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) return;
    queueMicrotask(refresh);
  }, [canManage, refresh]);

  const customerRows = useMemo(() => {
    const byUid = new Map();
    customers.forEach((customer) => {
      const uid = customer.uid || customer.id;
      if (uid) byUid.set(uid, { ...customer, uid, id: uid, source: customer.source || 'profile' });
    });

    orders.forEach((order) => {
      if (!order.userUid) return;
      if (!byUid.has(order.userUid)) byUid.set(order.userUid, makeOrderCustomer(order));
    });

    const orderStats = orders.reduce((acc, order) => {
      const uid = order.userUid;
      if (!uid) return acc;
      const current = acc.get(uid) || { orderCount: 0, totalSpend: 0, lastOrderAt: null };
      const orderDate = timestampToDate(order.createdAt);
      current.orderCount += 1;
      current.totalSpend += Number(order?.totals?.total || 0);
      if (orderDate && (!current.lastOrderAt || orderDate > current.lastOrderAt)) {
        current.lastOrderAt = orderDate;
      }
      acc.set(uid, current);
      return acc;
    }, new Map());

    return Array.from(byUid.values()).map((customer) => ({
      ...customer,
      status: customer.status || 'active',
      role: customer.role || 'customer',
      ...(orderStats.get(customer.uid) || { orderCount: 0, totalSpend: 0, lastOrderAt: null }),
    }));
  }, [customers, orders]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customerRows.filter((customer) => {
      const status = (customer.status || 'active').toLowerCase();
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!q) return true;

      return [
        customer.uid,
        getDisplayName(customer),
        customer.email,
        customer.phone,
        customer.role,
        customer.status,
      ].some((field) => String(field || '').toLowerCase().includes(q));
    });
  }, [customerRows, searchQuery, statusFilter]);

  const visibleRows = useMemo(() => filteredRows.slice(0, visibleCount), [filteredRows, visibleCount]);
  const selectedCustomer = useMemo(
    () => customerRows.find((customer) => customer.uid === selectedUid) || null,
    [customerRows, selectedUid],
  );

  const stats = useMemo(() => ({
    customers: customerRows.length,
    active: customerRows.filter((customer) => (customer.status || 'active') === 'active').length,
    revenue: customerRows.reduce((sum, customer) => sum + Number(customer.totalSpend || 0), 0),
  }), [customerRows]);

  const selectCustomer = (customer) => {
    setSelectedUid(customer.uid);
    setForm({
      displayName: getDisplayName(customer),
      email: customer.email || '',
      phone: customer.phone || '',
      role: customer.role || 'customer',
      status: customer.status || 'active',
      notes: customer.notes || '',
    });
    setError('');
    setSuccess('');
  };

  const saveCustomer = async (e) => {
    e.preventDefault();
    if (!selectedUid) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUserProfileByAdmin(selectedUid, {
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        status: form.status,
        notes: form.notes.trim(),
      });
      setSuccess('Customer profile updated.');
      await refresh();
    } catch (e2) {
      setError(e2?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const removeCustomerProfile = async () => {
    if (!selectedUid) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await deleteUserProfile(selectedUid);
      setSuccess('Customer profile deleted. Authentication account was not deleted.');
      setSelectedUid('');
      await refresh();
    } catch (e) {
      setError(e?.message || 'Failed to delete customer profile');
    } finally {
      setSaving(false);
    }
  };

  if (loadingAuth) return <div className="adminCustomersCenter">Loading...</div>;

  return (
    <div className="adminShell">
      <AdminNav />

      <main className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Customers</h1>
            <p>
              View customers, order history, spend, and profile status.
              <span className="adminProductsTotalBadge">{customerRows.length} total</span>
            </p>
          </div>
          <div className="adminProductsHeadActions">
            <button type="button" className="adminSettingsBtnSecondary" onClick={refresh} disabled={fetching}>
              {fetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {!canManage ? (
          <div className="adminSettingsError">Please log in to manage customers.</div>
        ) : (
          <>
            <section className="adminCustomersStats" aria-label="Customer stats">
              <div className="adminCustomersStat"><span>Customers</span><strong>{stats.customers}</strong></div>
              <div className="adminCustomersStat"><span>Active</span><strong>{stats.active}</strong></div>
              <div className="adminCustomersStat"><span>Total Spend</span><strong>{formatCurrency(stats.revenue)}</strong></div>
            </section>

            {error && <div className="adminSettingsError adminCustomersNotice">{error}</div>}
            {success && <div className="adminSettingsSuccess adminCustomersNotice">{success}</div>}

            <section className="adminCustomersLayout">
              <div className="adminSettingsCard adminCustomersListCard">
                <div className="adminCustomersToolbar">
                  <div className="adminProductsSearchBox">
                    <svg className="adminProductsSearchIcon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="5.5" stroke="#aaa" strokeWidth="1.6" />
                      <path d="M13.5 13.5L17 17" stroke="#aaa" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <input
                      type="search"
                      className="adminProductsSearchInput"
                      placeholder="Search customers, email, phone, UID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button type="button" className="adminProductsSearchClear" onClick={() => setSearchQuery('')} aria-label="Clear search">x</button>
                    )}
                  </div>

                  <select className="adminCustomersFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {fetching && customerRows.length === 0 ? (
                  <div className="adminProductsEmpty">Loading customers...</div>
                ) : filteredRows.length === 0 ? (
                  <div className="adminProductsEmpty">No customers match your filters.</div>
                ) : (
                  <>
                    <div className="adminProductsTable adminCustomersTable">
                      <table aria-label="Customers table">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Orders</th>
                            <th>Spend</th>
                            <th>Last Order</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map((customer) => (
                            <tr key={customer.uid} className={selectedUid === customer.uid ? 'adminProductsRowSelected' : ''}>
                              <td>
                                <div className="adminProductsRowName">{getDisplayName(customer)}</div>
                                <div className="adminProductsRowId">uid: {customer.uid}</div>
                              </td>
                              <td>
                                <div>{customer.email || 'No email'}</div>
                                <div className="adminProductsRowId">{customer.phone || 'No phone'}</div>
                              </td>
                              <td>{customer.orderCount}</td>
                              <td>{formatCurrency(customer.totalSpend)}</td>
                              <td>{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : 'No orders'}</td>
                              <td><span className={`adminCustomersBadge adminCustomersBadge--${customer.status}`}>{customer.status}</span></td>
                              <td>
                                <button type="button" className="adminProductsLinkBtn" onClick={() => selectCustomer(customer)}>
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="adminProductsPagination">
                      <span className="adminProductsPaginationInfo">Showing {visibleRows.length} of {filteredRows.length}</span>
                      {visibleCount < filteredRows.length && (
                        <button type="button" className="adminSettingsBtnSecondary" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                          Load more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <aside className="adminSettingsCard adminCustomersDetail">
                {!selectedCustomer ? (
                  <div className="adminCustomersDetailEmpty">
                    <h2>Select a customer</h2>
                    <p>Open a customer to update profile metadata, role, status, and notes.</p>
                  </div>
                ) : (
                  <form className="adminCustomersForm" onSubmit={saveCustomer}>
                    <div className="adminCustomersDetailHead">
                      <div>
                        <h2>{getDisplayName(selectedCustomer)}</h2>
                        <p>{selectedCustomer.uid}</p>
                      </div>
                      <span className={`adminCustomersBadge adminCustomersBadge--${form.status}`}>{form.status}</span>
                    </div>

                    <label>
                      <span>Name</span>
                      <input value={form.displayName} onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))} />
                    </label>
                    <label>
                      <span>Email</span>
                      <input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                    </label>
                    <label>
                      <span>Phone</span>
                      <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                    </label>
                    <div className="adminCustomersFormRow">
                      <label>
                        <span>Role</span>
                        <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
                          <option value="customer">Customer</option>
                          <option value="vip">VIP</option>
                          <option value="staff">Staff</option>
                        </select>
                      </label>
                      <label>
                        <span>Status</span>
                        <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </label>
                    </div>
                    <label>
                      <span>Admin Notes</span>
                      <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={4} />
                    </label>

                    <div className="adminCustomersMetrics">
                      <div><span>Orders</span><strong>{selectedCustomer.orderCount}</strong></div>
                      <div><span>Total Spend</span><strong>{formatCurrency(selectedCustomer.totalSpend)}</strong></div>
                    </div>

                    <div className="adminSettingsActions">
                      <button type="submit" className="adminSettingsBtn" disabled={saving}>{saving ? 'Saving...' : 'Save Customer'}</button>
                      <button type="button" className="adminSettingsBtnSecondary" onClick={removeCustomerProfile} disabled={saving}>
                        Delete Profile
                      </button>
                    </div>
                  </form>
                )}
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
