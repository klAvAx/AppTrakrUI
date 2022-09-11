import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from "react-router-dom";
import './index.css';
import App from './App';

import { store } from './redux/store';
import { Provider } from "react-redux";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </Provider>
  </React.StrictMode>
);