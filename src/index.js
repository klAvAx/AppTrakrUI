import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from "react-router-dom";
import './index.css';
import App from './App';

import { store } from './redux/store';
import { Provider } from "react-redux";
import { setKeyboardState } from './redux/reducers/UI';

window.addEventListener('error', (err) => {
    window.ipc.sendTrayWindow({
        action: "error",
        payload: {
            error: err.error,
            filename: `${err.filename}:${err.lineno}`,
            message: err.message
        }
    });
});

// Window Controls
window.addEventListener('keyup', (e) => {
    const isAppDev = store.getState()?.electron?.settings?.appIsDev ?? false;

    if (e.key === 'Control' || e.keyCode === 17) {
        store.dispatch(setKeyboardState({'key': 'ctrl', 'value': e.type === 'keydown'}));
    } else if (e.key === 'F5' || e.keyCode === 116) {
        window.app.reload();
    } else if (e.key === 'F12' || e.keyCode === 123) {
        window.app.openDevTools();
    } else {
        if(isAppDev) {
            console.log('[preload.js]', '[KeyUp Event]', 'Key: ' + e.key, 'KeyCode: ' + e.keyCode);
        }
    }
});
window.addEventListener('keydown', (e) => {
    const isAppDev = store.getState()?.electron?.settings?.appIsDev ?? false;
    const keyboardState = store.getState()?.UI?.keyboardState;

    if ((e.key === 'Control' || e.keyCode === 17) && !keyboardState?.ctrl) {
        store.dispatch(setKeyboardState({'key': 'ctrl', 'value': e.type === 'keydown'}));
    } else if (e.key === '0' || e.keyCode === 96) {
        if (keyboardState?.ctrl) {
            window.app.zoomReset();
        }
    } else if (e.key === '+' || e.keyCode === 107) {
        if (keyboardState?.ctrl) {
            window.app.zoomIn();
        }
    } else if (e.key === '-' || e.keyCode === 109) {
        if (keyboardState?.ctrl) {
            window.app.zoomOut();
        }
    } else {
        if(isAppDev) {
            console.log('[preload.js]', '[KeyDown Event]', 'Key: ' + e.key, 'KeyCode: ' + e.keyCode);
        }
    }
});

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