import { NavLink } from 'react-router-dom';

import './AdminNav.css';

export default function AdminNav({ onNavigate }) {
  const handleClick = () => {
    if (typeof onNavigate === 'function') onNavigate();
  };

  const linkClass = ({ isActive }) => (isActive ? 'adminNav-link active' : 'adminNav-link');

  return (
    <aside className="adminNav" aria-label="Admin navigation">
      <div className="adminNav-brand">
        <div className="adminNav-logo" aria-hidden="true">◆</div>
        <div>
          <div className="adminNav-title">Admin</div>
          <div className="adminNav-sub">IWS Decor</div>
        </div>
      </div>

      <nav className="adminNav-links">
        <NavLink to="/admin" className={linkClass} onClick={handleClick} end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/products" className={linkClass} onClick={handleClick}>
          Products
        </NavLink>
        <NavLink to="/admin/categories" className={linkClass} onClick={handleClick}>
          Categories
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass} onClick={handleClick}>
          Orders
        </NavLink>
        <NavLink to="/admin/customers" className={linkClass} onClick={handleClick}>
          Customers
        </NavLink>
        <NavLink to="/admin/reviews" className={linkClass} onClick={handleClick}>
          Reviews
        </NavLink>
        <NavLink to="/admin/video-reviews" className={linkClass} onClick={handleClick}>
          Video Reviews
        </NavLink>
        <NavLink to="/admin/settings" className={linkClass} onClick={handleClick}>
          Settings
        </NavLink>
      </nav>

      <div className="adminNav-footer">Use the left menu to manage the store</div>
    </aside>
  );
}

