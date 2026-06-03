import { useMemo } from 'react';

import './ProductDescription.css';

export default function ProductDescription({
  activeTab,
  setActiveTab,
  tabs,
}) {
  return (
    <div className="product-description-wrapper" aria-label="Product information">
      <div className="pi-description">

        <div className="pi-tabs" aria-label="Product details tabs">
          <div className="pi-tabList">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`pi-tabBtn ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.title}
              </button>
            ))}
          </div>

          <div className="pi-tabContent">
            {tabs
              .filter((t) => t.key === activeTab)
              .map((t) => (
                <div key={t.key}>
                  {Array.isArray(t.content) ? (
                    <ul className="pi-list">
                      {t.content.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="pi-text">{t.content}</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

