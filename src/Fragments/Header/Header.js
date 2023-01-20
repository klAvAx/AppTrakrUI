import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";

import { toggleBackdrop } from "../../redux/reducers/UI";
import { setAppSetting, setTempAppSetting, toggleAppSetting } from "../../redux/reducers/electron";

import { Transition } from "@headlessui/react";

import { HiMenu, HiX } from 'react-icons/hi';
import { FaCircle, FaPaintRoller } from 'react-icons/fa';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { TbBraces, TbBracesOff, TbBug, TbBugOff } from 'react-icons/tb';

import routes from "../../extra/routes";
import I18N from "../../extra/I18N";
import Tooltip from "../../Components/Tooltip";

export default function Header() {
  const [show, setShow] = useState(false);
  const [eEgg, setEEGG] = useState(0);
  const dispatch = useDispatch();
  
  const backdropShouldClose = useSelector(({ UI }) => UI.backdrop.wantsToClose);
  
  const appVersion = useSelector(({ electron }) => electron.settings.appVersion);
  const isPinned = useSelector(({ electron }) => electron.settings.appIsPinned);
  const isRecording = useSelector(({ electron }) => electron.settings.appRecordingProcesses);
  const isRecordButtonDisabled = useSelector(({ UI }) => UI.header.recordButtonDisabled);
  
  const appTheme = useSelector(({ electron }) => electron.settings.appTheme);
  const appShowTranslatable = useSelector(({ electron }) => electron.settings.appShowTranslatable);
  const appShowExtraInfo = useSelector(({ electron }) => electron.settings.appShowExtraInfo) ?? false;

  const location = useLocation();
  
  const updateTitle = (newTitle) => {
    let title = document.getElementsByTagName('title')[0];
    title.innerText = newTitle;
  }
  
  useEffect(() => {
    dispatch(toggleBackdrop(show));
  }, [show]);
  
  useEffect(() => {
    if (backdropShouldClose && show) {
      setShow(false);
    }
  }, [backdropShouldClose]);
  
  useEffect(() => {
    const appName = "App Trakr";
    if(location.pathname === "/") {
      updateTitle(appName);
    } else {
      updateTitle(`${appName} - ${routes.find((route) => route.href === location.pathname)?.title}`);
    }
  }, [location.pathname]);
  
  return (
    <nav className="flex absolute top-0 left-0 w-full z-1500">
      <div className="flex relative w-full">
        <div className="flex relative flex-row w-full h-16 items-center mx-auto px-4 bg-slate-800 z-1500 appDragRegion">
          <div className="flex absolute left-4 appNoDragRegion">
            <Tooltip
              id={`tooltip_header_menu`}
              placement="right"
              noTextWrap={true}
              content={(
                <h2 className="font-bold">{show ? <I18N index="header_menu_hide" text="Hide main menu" /> : <I18N index="header_menu_show" text="Show main menu" />}</h2>
              )}
            >
              <button
                onClick={() => setShow(!show)}
                className="flex items-center justify-center p-2 rounded-md text-slate-400 transition-colors duration-250 hover:text-white hover:bg-slate-700"
              >
                <span className="sr-only">{show ? <I18N index="header_menu_hide" noDev={true} /> : <I18N index="header_menu_show" noDev={true} />}</span>
                {show ? <HiX className="block h-6 w-6" aria-hidden="true" /> : <HiMenu className="block h-6 w-6" aria-hidden="true" />}
              </button>
            </Tooltip>
          </div>
          {eEgg === 20 ? (
            <div className="flex absolute left-16 appNoDragRegion">
              <button
                onClick={() => {
                  switch (appTheme) {
                    case "sys": {
                      dispatch(setAppSetting({setting: "appTheme", value: "light"}));
                      break;
                    }
                    case "light": {
                      dispatch(setAppSetting({setting: "appTheme", value: "dark"}));
                      break;
                    }
                    case "dark": {
                      dispatch(setAppSetting({setting: "appTheme", value: "sys"}));
                      break;
                    }
                  }
                }}
                className="flex items-center justify-center p-3 rounded-md text-slate-400 transition-colors duration-250 hover:text-white hover:bg-slate-700"
              >
                <FaPaintRoller className="block h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
          <div className="flex flex-grow px-22 items-center justify-center">
            <div className="flex items-center text-white text-xl font-black">
              {location.pathname !== "/" ? routes.find((route) => route.href === location.pathname)?.name : "App Trakr"}
            </div>
          </div>
          <div className="flex absolute right-16 appNoDragRegion">
            <Tooltip
              id={`tooltip_header_pin`}
              placement="rightBottom"
              noTextWrap={true}
              content={(
                <h2 className="font-bold">{isPinned ? <I18N index="header_button_title_unpin_app" text="Unpin App" /> : <I18N index="header_button_title_pin_app" text="Pin App" />}</h2>
              )}
            >
              <button
                onClick={() => dispatch(toggleAppSetting("appIsPinned"))}
                className={`inline-flex items-center justify-center p-2 rounded-md transition duration-250 transform ${isPinned ? '-rotate-45 text-white hover:text-slate-400' : 'text-slate-400 hover:text-white'}`}
              >
                <span className="sr-only">{isPinned ? <I18N index="header_button_title_unpin_app" noDev={true} /> : <I18N index="header_button_title_pin_app" noDev={true} />}</span>
                {isPinned ? <BsPinAngleFill className="block h-6 w-6" aria-hidden="true" /> : <BsPinAngle className="block h-6 w-6" aria-hidden="true" />}
              </button>
            </Tooltip>
          </div>
          <div className="flex absolute right-4 appNoDragRegion">
            <Tooltip
              id={`tooltip_header_rec`}
              placement="rightBottom"
              noTextWrap={true}
              content={(
                <h2 className="font-bold">{isRecording ? <I18N index="header_button_title_stop_recording" text="Stop Recording" /> : <I18N index="header_button_title_start_recording" text="Start Recording" /> }</h2>
              )}
            >
              <button
                disabled={isRecordButtonDisabled}
                onClick={() => dispatch(toggleAppSetting("appRecordingProcesses"))}
                className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-250 ${isRecording ? 'animate-pulse text-red-600 hover:text-red-400' : `text-slate-400 ${!isRecordButtonDisabled ? 'hover:text-white' : ''}`}`}
              >
                <span className="sr-only">{isRecording ? <I18N index="header_button_title_stop_recording" noDev={true} /> : <I18N index="header_button_title_start_recording" noDev={true} /> }</span>
                <FaCircle className="block h-6 w-6" aria-hidden="true" />
              </button>
            </Tooltip>
          </div>
        </div>
        <Transition
          as={React.Fragment}
          show={show}
          enter="transition duration-250 ease-out"
          enterFrom="transform -translate-y-full scale-90 opacity-0"
          enterTo="transform translate-y-0 scale-100 opacity-100"
          leave="transition duration-250 ease-in"
          leaveFrom="transform translate-y-0 scale-100 opacity-100"
          leaveTo="transform -translate-y-full scale-90 opacity-0"
        >
          <div className={`flex flex-col absolute top-16 left-0 w-full bg-slate-800 shadow-md shadow-slate-800 z-1499`}>
            <div className="flex flex-col px-4">
              {routes.map((item, index) => (
                  <NavLink
                      key={index}
                      to={item.href}
                      className={`flex px-3 py-2 mb-2 last:mb-0 rounded-md text-base font-medium transition-colors duration-250 ${item.href === location.pathname ? "bg-slate-900 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
                      aria-current={item.href === location.pathname ? "true" : "page"}
                      onClick={() => setShow(false)}
                  >
                    {item.name}
                  </NavLink>
              ))}
            </div>
            {eEgg === 20 ? (
                <div className="flex flex-row px-4">
                  <div className="flex flex-col p-2">
                    <Tooltip
                        id={`tooltip_header_eegg_translatable`}
                        placement="leftBottom"
                        noTextWrap={true}
                        content={(
                            <h2 className="font-bold">{appShowTranslatable ? <I18N index="header_button_title_hide_translatable" text="Hide Translatable text outlines" /> : <I18N index="header_button_title_show_translatable" text="Show Translatable text outlines" /> }</h2>
                        )}
                    >
                      <button
                          onClick={() => {dispatch(setTempAppSetting({setting: "appShowTranslatable", value: !appShowTranslatable}))}}
                          className={`flex items-center justify-center p-2 rounded-md text-slate-400 transition-colors duration-250 hover:text-white hover:bg-slate-700`}
                      >
                        {appShowTranslatable ? <TbBraces className="block h-6 w-6" aria-hidden="true" /> : <TbBracesOff className="block h-6 w-6" aria-hidden="true" />}
                      </button>
                    </Tooltip>
                  </div>
                  <div className="flex flex-col p-2">
                    <Tooltip
                        id={`tooltip_header_eegg_extrainfo`}
                        placement="leftBottom"
                        noTextWrap={true}
                        content={(
                            <h2 className="font-bold">{appShowExtraInfo ? <I18N index="header_button_title_hide_extra_info" text="Hide Extra Info Icon" /> : <I18N index="header_button_title_show_extra_info" text="Show Extra Info Icon" /> }</h2>
                        )}
                    >
                      <button
                          onClick={() => {dispatch(setTempAppSetting({setting: "appShowExtraInfo", value: !appShowExtraInfo}))}}
                          className={`flex items-center justify-center p-2 rounded-md text-slate-400 transition-colors duration-250 hover:text-white hover:bg-slate-700`}
                      >
                        {appShowExtraInfo ? <TbBug className="block h-6 w-6" aria-hidden="true" /> : <TbBugOff className="block h-6 w-6" aria-hidden="true" />}
                      </button>
                    </Tooltip>
                  </div>
                </div>
            ) : null}
            <div className='flex w-full px-2 py-1 justify-end text-slate-400 select-none' onClick={() => {
              setEEGG((prevState) => {
                return (prevState < 20 ? prevState + 1 : prevState);
              });
            }}>
              v{appVersion}
            </div>
          </div>
        </Transition>
      </div>
    </nav>
  )
}