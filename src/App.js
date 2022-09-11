import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { getAppSettings } from "./redux/reducers/electron";
import { updateRunningList, updateStatisticsList } from "./redux/reducers/processList";

import routes from "./extra/routes";

import Header from "./Fragments/Header/Header";
import Notification from "./Components/Notification";
import Backdrop from "./Components/Backdrop";
import Tooltip from "./Components/Tooltip";

// TODO implement Rich Discord Presence WITH:
//  *** requires debug testing!!!

// Leave for some next version
// TODO change how statistics are being recorded (instead of saving it as JSON, make a table to be used as a meta key => value relational thing)
//   this would allow for better filtering and possibly decent-ish CSV export structure
// TODO implement basic update checker (github based, does have to go live before this can be done?)
// TODO some language lines require inflections
function App() {
  const isDev = useSelector(({ electron }) => electron.settings.appIsDev);
  const theme = useSelector(({ electron }) => electron.settings.appTheme);
  const dispatch = useDispatch();
  
  const [kbdState, setKbdState] = useState({});
  
  useEffect(() => {
    // Runs once On Mount
    dispatch(getAppSettings());
    
    // Electron to React Listener
    window.ipc.onElectron((data) => {
      switch(data.type) {
        case "runningListUpdate":
          dispatch(updateRunningList(data.payload));
          break;
        case 'statisticsListUpdate':
          dispatch(updateStatisticsList(data.payload));
          break;
        default:
          if (isDev) {
            console.log("ipc", "onElectron", data);
          }
          break;
      }
    });
    
    // On Tray Window
    window.ipc.onTrayWindow((data) => {
      console.log("ipc", "onTrayWindow", data);
    });
    
    // Window Controls
    /*window.addEventListener('keyup', (e) => {
      if (e.key === 'Control' || e.keyCode === 17) {
        setKbdState((prevState) => {return {...prevState, ctrl: e.type === 'keydown'}});
      } else if (e.key === 'F5' || e.keyCode === 116) {
        window.app.reload();
      } else if (e.key === 'F12' || e.keyCode === 123) {
        window.app.openDevTools();
      } else {
        console.log('[preload.js]', '[KeyUp Event]', 'Key: ' + e.key, 'KeyCode: ' + e.keyCode);
      }
    });*/
    /*window.addEventListener('keydown', (e) => {
      if (e.key === 'Control' || e.keyCode === 17) {
        setKbdState((prevState) => {return {...prevState, ctrl: e.type === 'keydown'}});
      } else if (e.key === '0' || e.keyCode === 96) {
        if (kbdState?.ctrl) {
          window.app.zoomReset();
        }
      } else if (e.key === '+' || e.keyCode === 107) {
        if (kbdState?.ctrl) {
          window.app.zoomIn();
        }
      } else if (e.key === '-' || e.keyCode === 109) {
        if (kbdState?.ctrl) {
          window.app.zoomOut();
        }
      } else {
        console.log('[preload.js]', '[KeyDown Event]', 'Key: ' + e.key, 'KeyCode: ' + e.keyCode);
      }
    });*/
    
    return () => {
      // Runs once on Destroy
    }
  }, []);
  
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    
    switch (theme) {
      case "sys": {
        window.ipc.invokeGeneralInvoke({action: 'getSystemTheme'}).then((result) => {
          if(result?.response) {
            if(result.response !== 'dark') return;
            
            document.documentElement.classList.add("dark");
          }
        });
        break;
      }
      case "dark": {
        document.documentElement.classList.add("dark");
        break;
      }
    }
  }, [theme]);
  
  return (
    <React.Fragment>
      <Header />
      <div id="mainContainer" className="transition-colors duration-250 bg-slate-100 dark:bg-slate-600">
        <Routes>
          {routes.map((item, index) => (
            <Route key={index} exact={item.href === "/" ? true : null} path={item.href} element={item.component} />
          ))}
        </Routes>
      </div>
      <Backdrop />
      <Notification />
    </React.Fragment>
  );
}

export default App;