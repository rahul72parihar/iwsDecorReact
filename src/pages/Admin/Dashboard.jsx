import AdminNav from './AdminNav';

import './Dashboard.css';

export default function AdminDashboard() {
  return (
    <div className="adminShell">
      <AdminNav />

      <div className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Dashboard</h1>
            <p>Quick overview and shortcuts (static for now).</p>
          </div>
        </header>

        <section className="adminDashGrid" aria-label="Admin dashboard">
          <div className="adminStat">
            <div className="adminStatTop">
              <div>
                <div className="adminStatLabel">Products</div>
                <div className="adminStatValue">—</div>
              </div>
              <div className="adminStatIcon" aria-hidden="true">
                ⬚
              </div>
            </div>
            <div className="adminStatHint">Manage product catalog</div>
          </div>

          <div className="adminStat">
            <div className="adminStatTop">
              <div>
                <div className="adminStatLabel">Orders</div>
                <div className="adminStatValue">—</div>
              </div>
              <div className="adminStatIcon" aria-hidden="true">
                ✓
              </div>
            </div>
            <div className="adminStatHint">Track recent purchases</div>
          </div>

          <div className="adminStat">
            <div className="adminStatTop">
              <div>
                <div className="adminStatLabel">Customers</div>
                <div className="adminStatValue">—</div>
              </div>
              <div className="adminStatIcon" aria-hidden="true">
                ◈
              </div>
            </div>
            <div className="adminStatHint">View user information</div>
          </div>

          <div className="adminStat">
            <div className="adminStatTop">
              <div>
                <div className="adminStatLabel">Reviews</div>
                <div className="adminStatValue">—</div>
              </div>
              <div className="adminStatIcon" aria-hidden="true">
                ★
              </div>
            </div>
            <div className="adminStatHint">Moderate & respond</div>
          </div>

          <div className="adminQuick">
            <h2>Quick links</h2>
            <div className="adminQuickList">
              <a className="adminQuickItem" href="/admin/products">
                <div className="adminQuickName">Products</div>
                <div className="adminQuickDesc">Create, edit, delete, upload images</div>
              </a>
              <a className="adminQuickItem" href="/admin/categories">
                <div className="adminQuickName">Categories</div>
                <div className="adminQuickDesc">Organize storefront taxonomy</div>
              </a>
              <a className="adminQuickItem" href="/admin/orders">
                <div className="adminQuickName">Orders</div>
                <div className="adminQuickDesc">View order details & status</div>
              </a>
              <a className="adminQuickItem" href="/admin/customers">
                <div className="adminQuickName">Customers</div>
                <div className="adminQuickDesc">Manage customer accounts</div>
              </a>
              <a className="adminQuickItem" href="/admin/reviews">
                <div className="adminQuickName">Reviews</div>
                <div className="adminQuickDesc">Moderation and visibility</div>
              </a>
              <a className="adminQuickItem" href="/admin/settings">
                <div className="adminQuickName">Settings</div>
                <div className="adminQuickDesc">Admin preferences & configuration</div>
              </a>
            </div>
          </div>

          <div className="adminActivity">
            <h2>Recent activity</h2>
            <div className="adminActivityRow">
              <div className="adminActivityLeft">
                <div className="adminDot" aria-hidden="true" />
                <div>
                  <div className="adminActivityTitle">Products updated</div>
                  <div className="adminActivityMeta">Catalog changes saved</div>
                </div>
              </div>
              <div className="adminActivityTime">Just now</div>
            </div>
            <div className="adminActivityRow">
              <div className="adminActivityLeft">
                <div className="adminDot" aria-hidden="true" />
                <div>
                  <div className="adminActivityTitle">New order received</div>
                  <div className="adminActivityMeta">Payment confirmed</div>
                </div>
              </div>
              <div className="adminActivityTime">Today</div>
            </div>
            <div className="adminActivityRow">
              <div className="adminActivityLeft">
                <div className="adminDot" aria-hidden="true" />
                <div>
                  <div className="adminActivityTitle">Review pending</div>
                  <div className="adminActivityMeta">Awaiting moderation</div>
                </div>
              </div>
              <div className="adminActivityTime">Yesterday</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


