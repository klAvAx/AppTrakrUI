import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import I18N from "../extra/I18N";

import { FaAngleDown, FaFileExport, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { TbArrowBarDown, TbArrowBarToDown, TbFilter, TbFilterOff, TbBackspace } from "react-icons/tb";

import { confirm } from "../Components/Confirm";
import Marquee from "../Components/Marquee";
import Tooltip from "../Components/Tooltip";
import Clock from "../Components/Clock";

import { setNotification, toggleCollapsed, deleteGroupData, resetNotification } from "../redux/reducers/UI";
import { updateAppFilters } from "../redux/reducers/electron";
import { requestNewStatisticsList } from "../redux/reducers/processList";

// TODO implement statistics export !!!
function StatisticsPage() {
  const dispatch = useDispatch();
  const statisticsList = useSelector(({ process }) => process.statistics);
  const collapsed = useSelector(({ UI }) => UI.collapsed?.statistics);
  const filters = useSelector(({ electron }) => electron.filters);
  const latestTitleCount = useSelector(({ electron }) => electron.settings?.appStatisticsLatestTitleCount);
  const collapsedGroupsByDefault = useSelector(({ electron }) => electron.settings?.appStatisticsCollapsedGroupsByDefault);
  const showElapsedDays = useSelector(({ electron }) => electron.settings?.appStatisticsShowElapsedDays);
  
  const padNumber = (number, digits = 2) => {
    let _number = number;
    
    if(digits > _number.toString().length) {
      return (("0".repeat(digits))+_number).slice(-digits);
    } else {
      return _number;
    }
  }
  
  const formatTimestampToElapsedTime = (timestamp, showDays = false) => {
    // [2022-01-13] Removed Days and instead shows more than 24 hours
    // [2022-01-27] Added Days back in via app settings
    if(!Number.isInteger(timestamp)) return timestamp;
    
    let Days = 0;
    let Hours;
    
    if(showDays) {
      Days = Math.floor(timestamp / (24 * 60 * 60 * 1000));
      Hours = Math.floor((timestamp / (60 * 60 * 1000)) % 24);
    } else {
      Hours = Math.floor((timestamp / (60 * 60 * 1000)));
    }
    
    let Minutes = Math.floor((timestamp / (60 * 1000)) % 60);
    let Seconds = Math.floor((timestamp / 1000) % 60);
    let Milliseconds = timestamp % 1000;
    
    let str = [];
    
    if(Days > 0) {
      str.push(<I18N index={`general_text_x_day${Days > 1 ? "s" : ""}`} text={`%s Day${Days > 1 ? "s" : ""}`} replace={{"%s": Days}} />);
      str.push(" ");
    }
    
    str.push(`${padNumber(Hours)}:${padNumber(Minutes)}:${padNumber(Seconds)}`);
    
    if(Milliseconds > 0) str.push(`.${padNumber(Milliseconds, 3)}`);
    
    return str;
  }
  const formatTimestampToDate = (timestamp) => {
    let str = "";
    let date = new Date(timestamp);
  
    str += date.getFullYear();
    str += "-"+padNumber(date.getMonth() + 1);
    str += "-"+padNumber(date.getDate());
    str += " "+padNumber(date.getHours());
    str += ":"+padNumber(date.getMinutes());
    str += ":"+padNumber(date.getSeconds());
    
    return str;
  }
  
  const [filterQuery, setFilterQuery] = useState({});
  
  // JS native timer/counter
  const timer = useRef(null);
  const timerFunc = () => {
    let elements = document.getElementsByClassName('jsTimer');
    
    for(const element of elements) {
      const html = element.innerHTML;
      
      let hours = parseInt(html.split(":")[0]);
      let minutes = parseInt(html.split(":")[1]);
      let seconds = parseInt((html.split(":")[2]).includes(".") ? (html.split(":")[2]).split(".")[0] : html.split(":")[2]);
      let millis = (html.split(":")[2]).includes(".") ? parseInt((html.split(":")[2]).split(".")[1]) : 0;
      
      if(isNaN(hours)) hours = 0;
      if(isNaN(minutes)) minutes = 0;
      if(isNaN(seconds)) seconds = 0;
      if(isNaN(millis)) millis = 0;
      
      seconds += 1;
      
      if(seconds === 60) {
        seconds = 0;
        minutes += 1;
      }
      
      if(minutes === 60) {
        minutes = 0;
        hours += 1;
      }
      
      element.innerHTML = `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}${millis > 0 ? `.${padNumber(millis, 3)}` : ''}`;
    }
    
    timer.current = setTimeout(timerFunc, 1000);
  }
  
  // Sticky Headers
  const observerRef = useRef(null);
  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if(entry.intersectionRect.top === entry.rootBounds.top) {
        // Hide collapse button & Square top corners
        entry.target.classList.remove('rounded-t-md');
        entry.target.style.zIndex = '1';
        const collapseBTN = entry.target.getElementsByClassName('collapseBTN')[0];
        collapseBTN.hidden = true;
        collapseBTN.disabled = true;
      } else {
        if(entry.intersectionRatio === 1) {
          // Show collapse button & Round top corners
          entry.target.classList.add('rounded-t-md');
          entry.target.style.zIndex = '';
          const collapseBTN = entry.target.getElementsByClassName('collapseBTN')[0];
          collapseBTN.hidden = false;
          collapseBTN.disabled = false;
        }
      }
    });
  }
  const stickyAddonsAttach = () => {
    observerRef.current = new IntersectionObserver(observerCallback, {
      root: document.querySelector('#mainContainer'),
      rootMargin: '-1px',
      threshold: 1.0
    });
  
    let elements = document.getElementsByClassName('sticky');
    for(const element of elements) {
      observerRef.current.observe(element);
    }
  }
  const stickyAddonsDetach = () => {
    let elements = document.getElementsByClassName('sticky');
    for(const element of elements) {
      if(observerRef.current) observerRef.current.unobserve(element);
    }
    
    if(observerRef.current) observerRef.current.disconnect();
    observerRef.current = null;
  }
  
  useEffect(() => {
    if(statisticsList.length === 0) dispatch(requestNewStatisticsList());
    
    timerFunc();
    
    return () => {
      if(timer.current) clearTimeout(timer.current);
    }
  }, []);
  
  useEffect(() => {
    stickyAddonsAttach();
    return () => {
      stickyAddonsDetach();
    }
  }, [statisticsList]);
  
  const constructTitles = (processID, process, currentTime) => {
    const _latestTitleCount = (!isNaN(parseInt(latestTitleCount)) ? parseInt(latestTitleCount) : 3);
  
    const titleID = `${processID}T`;
    const _expanded = collapsed?.[titleID];
    
    const titles = process.titles;
    const titleCount = Object.keys(titles).length;
    const expandable = titleCount > _latestTitleCount;
    
    let hiddenTitles = [];
    let visibleTitles = [];
    
    Object.keys(titles).forEach((titleTimestamp, titleTimestampIndex) => {
      const lastTimestampIndex = Object.keys(titles).length - 1;
      let runtime;
  
      if(titleTimestampIndex < lastTimestampIndex) {
        runtime = Object.keys(titles)[titleTimestampIndex + 1] - titleTimestamp;
      } else {
        if(process.stoppedAt) {
          runtime = process.stoppedAt - titleTimestamp;
        } else {
          runtime = currentTime - titleTimestamp;
        }
      }
      
      const html = (
        <div key={`title_${titleTimestampIndex}`} className='flex w-full'>
          <div className='w-full transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none cursor-copy' onClick={() => {navigator.clipboard.writeText(process.titles[titleTimestamp])}}><Marquee text={process.titles[titleTimestamp]} /></div>
          <div
            className={`ml-2 text-right whitespace-nowrap transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none cursor-copy ${process.startedAt && process.stoppedAt ? '' : (titleTimestampIndex === lastTimestampIndex ? 'jsTimer' : '')}`}
            onClick={() => {navigator.clipboard.writeText(formatTimestampToElapsedTime(runtime))}}
          >
            {formatTimestampToElapsedTime(runtime)}
          </div>
        </div>
      );
      
      if(expandable) {
        if(titleTimestampIndex < (lastTimestampIndex - (_latestTitleCount - 1))) {
          hiddenTitles.push(html);
        } else {
          visibleTitles.push(html);
        }
      } else {
        visibleTitles.push(html);
      }
    });
    
    return (
      <React.Fragment>
        <Tooltip
          id={`tooltip_${titleID}_title`}
          placement="rightBottom"
          noTextWrap={true}
          content={expandable ? (<h2 className="font-bold">{_expanded ? <I18N index="general_text_collapse" text="Collapse" /> : <I18N index="general_text_expand" text="Expand" /> }</h2>) : null}
        >
          <h3
            className={`w-full mb-2 text-center select-none font-bold relative whitespace-nowrap transition-colors duration-250 dark:text-slate-350 ${expandable ? "cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-800" : ""}`}
            onClick={expandable ? () => dispatch(toggleCollapsed({group: 'statistics', key: titleID})) : null}
          >
            <I18N index='statistics_heading_window_title_changes_and_durations' text='Window Title Changes & Durations' />
            {expandable ? (
              <div className="absolute right-0 top-0 w-6 h-6 transition-colors duration-250 hover:text-slate-50 dark:text-slate-400 dark:hover:text-slate-50">
                <FaAngleDown className={`w-full h-full transition ${_expanded ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true" />
              </div>
            ) : null}
          </h3>
        </Tooltip>
        <div className="w-full mb-2">
          {expandable ? (
            <React.Fragment>
              {_expanded ? <div className='mb-2 pb-2 border-b-2 transition-colors duration-250 border-slate-400 dark:border-slate-800'>{hiddenTitles}</div> : null}
              <div>
                {visibleTitles}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {visibleTitles}
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
  
  const constructList = () => {
    let sorted = {};
    
    // Preprocess List a little
    for(const group of statisticsList) {
      if(sorted[group.id] === undefined) {
        sorted[group.id] = {
          groupId: group.id,
          groupName: group.name,
          groupIsFiltered: group.filtered,
          groupRuntime: 0,
          groupRuntimeCache: [],
          groupActive: false,
          unforeseenConsequences: null,
          items: []
        };
      }
      
      for(const _item of group.items) {
        if(_item.id === null || _item.rule_id === null || _item.rule_group_id === null) continue;
        
        let item = {..._item};
  
        // Expand JSON Object
        try {
          item.titles = JSON.parse(item.titles);
        } catch (err) {
          window.ipc.sendTrayWindow({
            action: "error",
            payload: {
              error: err.error,
              filename: `${err.filename}:${err.lineno}`,
              message: err.message
            }
          });
          console.error(err);
        }
        
        if(item.startedAt && item.stoppedAt) {
          // Potential Time Calculation BugFix
          if(sorted[group.id]['groupRuntime'] === 0) {
            sorted[group.id]['groupRuntime'] += (item.stoppedAt - item.startedAt);
          } else {
            let overlappingAppIndex = sorted[group.id]['groupRuntimeCache'].reverse().findIndex((elem) => {
              return item.startedAt >= elem.startedAt && item.startedAt <= elem.stoppedAt;
            });
      
            if(overlappingAppIndex === -1) {
              // App Overlap not found Add full runtime
              sorted[group.id]['groupRuntime'] += (item.stoppedAt - item.startedAt);
            } else {
              // App Overlap found Add/Subtract remainder
              let overlapStart = sorted[group.id]['groupRuntimeCache'][overlappingAppIndex].startedAt;
              let overlapEnd = sorted[group.id]['groupRuntimeCache'][overlappingAppIndex].stoppedAt;
        
              if(item.startedAt > overlapStart) {
                /*if(rest.stoppedAt > overlapEnd) {*/
                // add remaining time, 2nd app closed later than the first
                sorted[group.id]['groupRuntime'] += (item.stoppedAt - overlapEnd);
                /*} else {
                  // there's nothing to add, 2nd app closed before the first one (maybe a subtraction?)
                  console.log("AAAAAOOOOOOGGAAAAAAHHHH!");
                }*/
              } else if (item.startedAt < overlapStart) {
                // reverse overlap ?? (FYI this should not happen)
                if(item.stoppedAt > overlapEnd) {
                  //
                  if(sorted[group.id]['unforeseenConsequences'] === null) {
                    sorted[group.id]['unforeseenConsequences'] = "typeA";
                  }
                  console.log("reverse overlap 2nd app closed later than the 1st one");
                } else {
                  //
                  if(sorted[group.id]['unforeseenConsequences'] === null || sorted[group.id]['unforeseenConsequences'] === "typeA") {
                    sorted[group.id]['unforeseenConsequences'] = "typeB";
                  }
                  console.log("reverse overlap 2nd app closed before the 1st one");
                }
              } else {
                // equal start time
                /*if(rest.stoppedAt > overlapEnd) {*/
                // add remaining time, 2nd app closed later than the first
                sorted[group.id]['groupRuntime'] += (item.stoppedAt - overlapEnd);
                /*} else {
                  // there's nothing to add, 2nd app closed before the first one (maybe a subtraction?)
                  console.log("AAAAAOOOOOOGGAAAAAAHHHH!");
                }*/
              }
            }
          }
          sorted[group.id]['groupRuntimeCache'].push({ startedAt: item.startedAt, stoppedAt: item.stoppedAt });
        } else {
          sorted[group.id]['groupActive'] = true;
        }
  
        sorted[group.id]['items'].push(item);
      }
    }
    
    return (
      <React.Fragment>
        {Object.keys(sorted).map((group, groupIndex) => {
          const groupID = `G${groupIndex}`;
          const _collapsed = (collapsedGroupsByDefault ? !collapsed?.[groupID] : collapsed?.[groupID]);
          const currentTime = new Date().getTime();
          
          return (
            <div
              key={`group_${groupIndex}`}
              className={`flex flex-col relative mb-4 last:mb-0 border-2 rounded-lg transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-200 dark:bg-slate-600`}
            >
              <div className={`flex sticky top-0 p-2 font-bold ${_collapsed ? 'border-b-0 rounded-md' : 'border-b-2 rounded-t-md'} transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-400 dark:bg-slate-800`}>
                <Tooltip
                  id={`tooltip_${groupIndex}`}
                  showArrow={true}
                  placement="right"
                  noTextWrap={true}
                  content={(
                    <h2 className="font-bold">
                      <I18N index="statistics_text_total_runtime_x" text="Total Runtime: %s" replace={{"%s": formatTimestampToElapsedTime(sorted[group].groupRuntime, showElapsedDays)}} />
                    </h2>
                  )}
                >
                  <div className="w-6 h-6 mr-2 cursor-copy" onClick={() => {navigator.clipboard.writeText(formatTimestampToElapsedTime(sorted[group].groupRuntime, showElapsedDays))}}>
                    <span className='sr-only'><I18N index="statistics_text_total_runtime_x" replace={{"%s": formatTimestampToElapsedTime(sorted[group].groupRuntime, showElapsedDays)}} noDev={true} /></span>
                    <Clock
                      animate={sorted[group].groupActive}
                      circleColor="transition-colors duration-250 text-black dark:text-slate-400"
                      hourHandColor="transition-colors duration-250 text-slate-400 dark:text-slate-600"
                      minuteHandColor="transition-colors duration-250 text-slate-300 dark:text-slate-900"
                    />
                  </div>
                </Tooltip>
                <div className="w-full truncate mr-2 transition-colors duration-250 dark:text-slate-350 select-none">{sorted[group].groupName}</div>
                {
                  sorted[group].unforeseenConsequences === "typeA" || sorted[group].unforeseenConsequences === "typeB" ?
                    <Tooltip
                      id={`tooltip_${groupIndex}_warning`}
                      placement="left"
                      noTextWrap={true}
                      content={(
                        <h2 className="font-bold">
                          <I18N index="general_text_time_calc_may_be_inaccurate" text="Time Calculation for this group may be inaccurate!" />
                        </h2>
                      )}
                    >
                      <div className={`w-6 h-6 transition-colors animate-pulse ${sorted[group].unforeseenConsequences === "typeA" ? "text-yellow-600" : "text-red-600"}`}>
                        <span className="sr-only"><I18N index="general_text_time_calc_may_be_inaccurate" noDev={true} /></span>
                        <FaExclamationTriangle className={`w-full h-full`} aria-hidden="true" />
                      </div>
                    </Tooltip> : null
                }
                {filters?.[group] ?
                  <Tooltip
                      id={`tooltip_${groupIndex}_resetFilter`}
                      placement="left"
                      noTextWrap={true}
                      content={(
                        <h2 className="font-bold">
                          <I18N index="general_text_reset_group_filters" text="Reset Filters" />
                        </h2>
                      )}
                    >
                      <button
                        className='w-6 h-6 ml-2 transition-colors duration-250 text-slate-900 hover:text-slate-50 dark:text-slate-400 dark:hover:text-slate-50'
                        onClick={() => {
                          setFilterQuery((prevState) => {
                            return {
                              ...prevState,
                              [group]: ""
                            };
                          });
                          dispatch(updateAppFilters({groupID: group, filterType: "clear"}))
                        }}
                      >
                        <span className='sr-only'><I18N index="general_text_reset_group_filters" noDev={true} /></span>
                        <TbFilterOff className={`w-full h-full`} aria-hidden="true" />
                      </button>
                    </Tooltip>
                  : null}
                <Tooltip
                  id={`tooltip_${groupIndex}_delete`}
                  placement="left"
                  noTextWrap={true}
                  content={(
                    <h2 className="font-bold">
                      <I18N index="general_text_delete_group_data" text="Delete Collected Group Data" />
                    </h2>
                  )}
                >
                  <button
                    className='w-6 h-6 ml-2 transition-colors duration-250 text-slate-900 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500'
                    onClick={() => {
                      confirm({
                        title: <I18N index="general_message_text_are_you_sure" text="Are You Sure?" />,
                        message: <I18N index="general_message_text_delete_group_data" text="This WILL delete all group Data!" />,
                        confirmButton: async () => {
                          let response = await dispatch(deleteGroupData(group));
          
                          if(typeof response.payload.response === "number" && response.payload.response > 0) {
                            dispatch(requestNewStatisticsList());
                            dispatch(setNotification({
                              message: `general_message_text_data_deleted`,
                              bottomOffset: 0
                            }));
                          } else {
                            dispatch(setNotification({
                              message: `general_message_text_data_delete_fail`,
                              bottomOffset: 0
                            }));
                          }
                        },
                        onShow: () => {
                          dispatch(resetNotification());
                        }
                      });
                    }}
                  >
                    <span className='sr-only'><I18N index="general_text_delete_group_data" noDev={true} /></span>
                    <FaTimes className={`w-full h-full`} aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                  id={`tooltip_${groupIndex}_export`}
                  placement="left"
                  noTextWrap={true}
                  content={(
                    <h2 className="font-bold">
                      <I18N index="general_text_export_csv" text="Export CSV" />
                    </h2>
                  )}
                >
                  <button
                    className='w-6 h-6 ml-2 transition-colors duration-250 text-slate-900 hover:text-slate-50 dark:text-slate-400 dark:hover:text-slate-50'
                    onClick={() => dispatch(setNotification({message: "TODO export group CSV", translatable: false}))}
                  >
                    <span className='sr-only'><I18N index="general_text_export_csv" noDev={true} /></span>
                    <FaFileExport className={`w-full h-full`} aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                  id={`tooltip_${groupIndex}_expand`}
                  placement="left"
                  noTextWrap={true}
                  content={(
                    <h2 className="font-bold">
                      {_collapsed ? <I18N index="general_text_expand" text="Expand" /> : <I18N index="general_text_collapse" text="Collapse" />}
                    </h2>
                  )}
                >
                  <button
                    className={`w-6 h-6 ml-2 transition-colors duration-250 text-slate-900 collapseBTN hover:text-slate-50 dark:text-slate-400 dark:hover:text-slate-50`}
                    onClick={() => dispatch(toggleCollapsed({group: 'statistics', key: groupID}))}
                  >
                    <span className='sr-only'>{ _collapsed ? <I18N index="general_text_expand" noDev={true} /> : <I18N index="general_text_collapse" noDev={true} /> }</span>
                    <FaAngleDown className={`w-full h-full transition ${_collapsed ? 'rotate-0' : 'rotate-180'}`} aria-hidden="true" />
                  </button>
                </Tooltip>
              </div>
              {!_collapsed ? (
                <div className={`flex flex-col`}>
                  <div className={`flex p-2 font-bold border-b-2 transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-400 dark:bg-slate-800`}>
                    <div className="border-1 border-r-0 rounded-l-lg p-2 transition-colors duration-250 text-slate-900 dark:text-slate-400 border-slate-900 dark:border-slate-400 bg-slate-400 dark:bg-slate-800">
                      <TbFilter className="w-6 h-6" />
                    </div>
                    <input
                      type="text" value={filterQuery[group] !== undefined ? filterQuery[group] : (filters?.[group]?.['query'] ? filters[group]['query'] : "")}
                      onChange={(e) => setFilterQuery((prevState) => {
                        return {
                          ...prevState,
                          [group]: e.target.value
                        };
                      })}
                      onBlur={(e) => dispatch(updateAppFilters({groupID: group, filterType: "query", filterData: filterQuery[group]}))}
                      onKeyUp={(e) => { if(e.code === "Enter") dispatch(updateAppFilters({groupID: group, filterType: "query", filterData: filterQuery[group]})) }}
                      className="border-1 pl-2 w-full focus:outline-0 transition-colors duration-250 text-slate-900 dark:text-slate-300 border-slate-900 dark:border-slate-400 bg-slate-300 dark:bg-slate-700"
                    />
                    <button
                      onClick={(e) => {
                        setFilterQuery((prevState) => {
                          return {
                            ...prevState,
                            [group]: ""
                          };
                        });
                        dispatch(updateAppFilters({groupID: group, filterType: "query", filterData: ""}))
                      }}
                      className="border-1 border-l-0 rounded-r-lg p-2 transition-colors duration-250 text-slate-900 dark:text-slate-400 hover:dark:text-slate-300 border-slate-900 dark:border-slate-400 bg-slate-400 hover:bg-slate-300 dark:bg-slate-800 hover:dark:bg-slate-700"
                    >
                      <TbBackspace className="w-6 h-6" />
                    </button>
                  </div>
                  {sorted[group].items.length ? sorted[group].items.map((process, processIndex) => {
                    const processID = `G${groupIndex}P${processIndex}`;
                    const _collapsedProcess = collapsed?.[processID];
                    
                    return (
                      <div
                        key={`process_${processIndex}`}
                        className={`flex p-2 border-b-2 last:border-b-0 transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-200 dark:bg-slate-600`}
                      >
                        <div className="flex flex-col w-full">
                          <div className="relative w-full mb-2 last:mb-0 px-12 text-center text-xl font-bold whitespace-nowrap transition-colors duration-250 hover:bg-slate-300 dark:hover:bg-slate-800">
                            <div className="absolute flex justify-start left-0 top-[2px] w-12 h-6">
                              <Tooltip
                                id={`tooltip_${groupIndex}_${processIndex}_trackFrom`}
                                placement="leftBottom"
                                noTextWrap={true}
                                content={(
                                  <h2 className="font-bold text-base">
                                    <I18N index="general_text_apply_tracking_offset_from" text="Apply Tracking Offset From this Point (INCLUSIVE)" />
                                  </h2>
                                )}
                              >
                                <TbArrowBarDown
                                  className={`w-6 h-full cursor-pointer transition-colors duration-250 hover:text-slate-50 ${filters?.[group]?.from === process.startedAt ? 'text-slate-900 dark:text-slate-400' : 'text-slate-400 dark:text-slate-900'} dark:hover:text-slate-50`}
                                  aria-hidden="true" onClick={() => {dispatch(updateAppFilters({groupID: group, filterType: "from", filterData: filters?.[group]?.from === process.startedAt ? "" : process.startedAt}))}}
                                />
                              </Tooltip>
                              <Tooltip
                                id={`tooltip_${groupIndex}_${processIndex}_trackTo`}
                                placement="leftBottom"
                                noTextWrap={true}
                                content={(
                                  <h2 className="font-bold text-base">
                                    <I18N index="general_text_apply_tracking_offset_to" text="Apply Tracking Offset Up To this Point (INCLUSIVE)" />
                                  </h2>
                                )}
                              >
                                <TbArrowBarToDown
                                  className={`w-6 h-full cursor-pointer transition-colors duration-250 hover:text-slate-50 ${filters?.[group]?.to === process.stoppedAt ? 'text-slate-900 dark:text-slate-400' : 'text-slate-400 dark:text-slate-900'} dark:hover:text-slate-50`}
                                  aria-hidden="true" onClick={() => {dispatch(updateAppFilters({groupID: group, filterType: "to", filterData: filters?.[group]?.to === process.stoppedAt ? "" : process?.stoppedAt}))}}
                                />
                              </Tooltip>
                            </div>
                            <Tooltip
                              id={`tooltip_${groupIndex}_${processIndex}_title`}
                              placement="rightBottom"
                              noTextWrap={true}
                              content={(
                                <h2 className="font-bold text-base">
                                  {_collapsedProcess ? <I18N index="general_text_expand" text="Expand" /> : <I18N index="general_text_collapse" text="Collapse" />}
                                </h2>
                              )}
                            >
                              <div
                                className={`w-full select-none cursor-pointer transition-colors duration-250 dark:text-slate-350`}
                                onClick={() => {dispatch(toggleCollapsed({group: 'statistics', key: processID}))}}
                              >
                                <I18N index='statistics_heading_process_details' text='Process Details' />
                              </div>
                            </Tooltip>
                            <div className="absolute flex justify-end right-0 top-[2px] w-12 h-6">
                              <Tooltip
                                id={`tooltip_${groupIndex}_${processIndex}_expand`}
                                placement="rightBottom"
                                noTextWrap={true}
                                content={(
                                  <h2 className="font-bold text-base">
                                    {_collapsedProcess ? <I18N index="general_text_expand" text="Expand" /> : <I18N index="general_text_collapse" text="Collapse" />}
                                  </h2>
                                )}
                              >
                                <FaAngleDown
                                  className={`w-6 h-full cursor-pointer transition-colors duration-250 hover:text-slate-50 dark:text-slate-400 dark:hover:text-slate-50 ${_collapsedProcess ? 'rotate-0' : 'rotate-180'}`}
                                  aria-hidden="true" onClick={() => {dispatch(toggleCollapsed({group: 'statistics', key: processID}))}}
                                />
                              </Tooltip>
                            </div>
                          </div>
                          {!_collapsedProcess ? (
                            <div className={`flex flex-col`}>
                              {Object.keys(process.titles).length === 1 ? (
                                <React.Fragment>
                                  <h3 className="w-full mb-2 text-center font-bold select-none whitespace-nowrap transition-colors duration-250 text-slate-900 dark:text-slate-350">
                                    <I18N index='statistics_heading_window_title' text='Window Title' />
                                  </h3>
                                  <div
                                    className="w-full mb-2 transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none cursor-copy"
                                    onClick={() => {
                                      navigator.clipboard.writeText(process.titles[Object.keys(process.titles)[0]])
                                    }}
                                  >
                                    <Marquee text={process.titles[Object.keys(process.titles)[0]]} />
                                  </div>
                                </React.Fragment>
                              ) : constructTitles(processID, process, currentTime)}
                              <div className='flex w-full gap-2'>
                                <div className='flex w-full flex-col'>
                                  <h2 className="w-full text-center font-bold whitespace-nowrap transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none">
                                    <I18N index='statistics_heading_started_at' text='Started At' />
                                  </h2>
                                  <div
                                    className='w-full truncate text-center transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none cursor-copy'
                                    onClick={() => {navigator.clipboard.writeText(formatTimestampToDate(process.startedAt))}}
                                  >
                                    {formatTimestampToDate(process.startedAt)}
                                  </div>
                                </div>
                                <div className='flex w-full flex-col'>
                                  <h2 className="w-full text-center font-bold whitespace-nowrap transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none">
                                    <I18N index='statistics_heading_total_runtime' text='Total Runtime' />
                                  </h2>
                                  <div
                                    className={`w-full truncate text-center transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none cursor-copy ${process.startedAt && process.stoppedAt ? '' : 'jsTimer'}`}
                                    onClick={() => {navigator.clipboard.writeText(process.startedAt && process.stoppedAt ?
                                      formatTimestampToElapsedTime(process.stoppedAt - process.startedAt) :
                                      formatTimestampToElapsedTime(currentTime - process.startedAt)
                                    )}}
                                  >
                                    {process.startedAt && process.stoppedAt ?
                                      formatTimestampToElapsedTime(process.stoppedAt - process.startedAt) :
                                      formatTimestampToElapsedTime(currentTime - process.startedAt)
                                    }
                                  </div>
                                </div>
                                <div className='flex w-full flex-col'>
                                  <h2 className="w-full text-center font-bold whitespace-nowrap transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none">
                                    <I18N index='statistics_heading_stopped_at' text='Stopped At' />
                                  </h2>
                                  <div
                                    className='w-full truncate text-center transition-colors duration-250 text-slate-900 dark:text-slate-350 select-none cursor-copy'
                                    onClick={() => {navigator.clipboard.writeText(process.stoppedAt ? formatTimestampToDate(process.stoppedAt) : '-')}}
                                  >
                                    {process.stoppedAt ? formatTimestampToDate(process.stoppedAt) : <I18N index="statistics_text_still_running" text="Still Running" />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  }): (
                    <div className={`flex justify-center p-2 font-bold transition-colors duration-250 text-slate-900 dark:text-slate-350`}>
                      {sorted[group].groupIsFiltered ? <I18N index="statistics_filter_too_strong" text="Specified Filtering is too strict!" /> : <I18N index="statistics_group_has_no_items" text="This Group does not have any Statistics to show." />}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </React.Fragment>
    );
  }
  
  return (
    <div className="flex flex-col p-4">
      {statisticsList?.length > 0 ? constructList() : (
        <div className="text-center text-xl font-bold">
          <div className="block">
            <I18N index="statistics_heading_no_stats_to_show" text="There Are No Statistics that can be shown, Yet..." />
          </div>
        </div>
      )}
    </div>
  );
}

export default StatisticsPage;