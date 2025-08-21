import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // ← add this
import App from './App.jsx';

import './styles/base.css';
import './styles/theme.css';
import './styles/layout.css';
import './styles/hero.css';
import './styles/presets.css';
import './styles/session.css';
import './styles/stats.css';
import './styles/badges.css';
import './styles/controls.css';
import './styles/footer.css';
import './styles/modals.css';
import './styles/summary.css';
import './styles/disclaimer.css';
import './styles/achievements.css';
import './styles/settings-modal.css';
import './styles/preset-picker.css';
import './styles/responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
