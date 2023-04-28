import React, { useEffect, useState } from "react";
import { Scrollbars } from "rc-scrollbars";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation } from "react-router-dom";
import { getAppSettings, setTempAppSetting } from "./redux/reducers/electron";
import { updateRunningList, updateStatisticsList } from "./redux/reducers/processList";

import routes from "./extra/routes";

import Header from "./Fragments/Header/Header";
import Notification from "./Components/Notification";
import Backdrop from "./Components/Backdrop";
import Tooltip from "./Components/Tooltip";
import {resetStatisticGroups} from "./redux/reducers/UI";

function App() {
  const isDev = useSelector(({ electron }) => electron.settings.appIsDev);
  const theme = useSelector(({ electron }) => electron.settings.appTheme);
  const dispatch = useDispatch();
  const location = useLocation();

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
        case 'settingUpdate':
          dispatch(setTempAppSetting(data.payload));
          break;
        case 'resetStatisticGroups':
          dispatch(resetStatisticGroups());
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

  useEffect(() => {
    document.getElementById('mainContainer')?.scrollTo(0, 0);
  }, [location]);

  return (
    <React.Fragment>
      <Header />
      <div id="mainContainer" className="transition-colors duration-250 bg-slate-100 dark:bg-slate-600">
        <Scrollbars
            className="group"
            autoHide={false}
            disableDefaultStyles
            hideTracksWhenNotNeeded
            renderTrackHorizontal={({ style,  ...props }) => <div {...props} className="transition-colorHeightTransform duration-250 translate-y-full group-hover:translate-y-0 group-active:translate-y-0 !h-[8px] hover:!h-[14px] active:!h-[14px] border-t-2 border-slate-800 !bg-slate-300 dark:!bg-slate-700" style={{...style, right: '0px', bottom: '0px', left: '0px', borderRadius: '0px'}} />}
            renderTrackVertical={({ style, ...props }) => <div {...props} className="transition-colorWidthTransform duration-250 translate-x-full group-hover:translate-x-0 group-active:translate-x-0 !w-[8px] hover:!w-[14px] active:!w-[14px] border-l-2 border-slate-800 !bg-slate-300 dark:!bg-slate-700" style={{...style, top: '0px', right: '0px', bottom: '0px', borderRadius: '0px'}} />}
            renderThumbHorizontal={({ style, ...props }) => <div {...props} className="transition-colorWidth duration-250 !bg-slate-500 dark:!bg-slate-900" style={{...style}} />}
            renderThumbVertical={({ style, ...props }) => <div {...props} className="transition-colorHeight duration-250 !bg-slate-500 dark:!bg-slate-900" style={{...style}} />}
        >
          <Routes>
            {routes.map((item, index) => (
                <Route key={index} exact={item.href === "/" ? true : null} path={item.href} element={item.component} />
            ))}
          </Routes>
        </Scrollbars>
      </div>
      <Backdrop />
      <Notification />
    </React.Fragment>
  );
}

export default App;
