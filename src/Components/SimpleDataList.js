import PropTypes from "prop-types";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Scrollbars } from "rc-scrollbars";

import { useDispatch, useSelector } from "react-redux";
import { disableRecordButton, enableRecordButton, resetNotification, setNotification, toggleBackdrop, shouldCloseBackdrop } from "../redux/reducers/UI";
import { getDataOfType, setData, deleteData } from "../redux/reducers/simpleDataList";

import { confirm } from "./Confirm";
import Tooltip from "./Tooltip";

import { FaEdit, FaTimes } from "react-icons/fa";

import I18N from "../extra/I18N";
import MiniModal from "./MiniModal";

function SimpleDataList({ type, nameKey, items, visibleData, newButtonState, onOpenNewModal, shouldUpdate, onDelete, onUpdate, confirmMessages }) {
  const [modal, setModal] = useState(false);
  const [modalEditID, setModalEditID] = useState(0);
  
  const [buttonsHeightOffset, setButtonsHeightOffset] = useState({});
  const button1 = useRef();
  const button2 = useRef();
  
  const dispatch = useDispatch();
  const data = useSelector(({ simpleDataList }) => simpleDataList[type.toLowerCase()] ? simpleDataList[type.toLowerCase()] : []);
  const appSettings = useSelector(({ electron }) => electron.settings);
  
  useEffect(() => {
    // Runs once OnMount
    
    // Get data
    getData();
  }, []);
  
  useEffect(() => {
    if(newButtonState) {
      setModal(true);
      setModalEditID(0);
      onOpenNewModal();
      dispatch(resetNotification());
    }
  }, [newButtonState]);
  
  useEffect(() => {
    if(!modal && modalEditID !== 0) {
      setModalEditID(0);
    }
    
    if(modal) {
      dispatch(disableRecordButton());
    } else {
      dispatch(enableRecordButton());
    }
  }, [modal]);
  
  useEffect(() => {
    if(shouldUpdate) {
      getData();
      onUpdate();
    }
  }, [shouldUpdate]);
  
  useLayoutEffect(() => {
    setButtonsHeightOffset((prevState) => {
      return {
        ...prevState,
        1: (button1?.current?.offsetHeight - 40) / 2,
        2: (button2?.current?.offsetHeight - 40) / 2
      }
    });
  }, [button1, button2]);
  
  const getData = () => {
    let columns = [];
    for(const item of items) {
      if(item?.notMeta) continue;
      
      columns.push(item.name);
    }
    dispatch(getDataOfType({
      type: type.toLowerCase(),
      cols: columns
    })).then((result) => {
      if (result.type.includes("rejected")) {
        // TODO data get fail error notification
        if(appSettings.appIsDev) {
          console.log(result);
        }
      }
    });
  }
  
  return (
    <div className="flex flex-col">
      <div className="rounded-b-md text-base overflow-auto">
        <Scrollbars
            className="group/list"
            autoHide={false}
            autoHeight
            autoHeightMax={450}
            disableDefaultStyles
            hideTracksWhenNotNeeded
            renderTrackHorizontal={({ style,  ...props }) => <div {...props} className="transition-colorHeightTransform duration-250 translate-y-full group-hover/list:translate-y-0 group-active/list:translate-y-0 !h-[6px] hover:!h-[12px] active:!h-[12px] border-t-2 border-slate-400 dark:border-slate-800 !bg-slate-300 dark:!bg-slate-700" style={{...style, right: '0px', bottom: '0px', left: '0px', borderRadius: '0px', zIndex: 9}} />}
            renderTrackVertical={({ style, ...props }) => <div {...props} className="transition-colorWidthTransform duration-250 translate-x-full group-hover/list:translate-x-0 group-active/list:translate-x-0 !w-[6px] hover:!w-[12px] active:!w-[12px] border-l-2 border-slate-400 dark:border-slate-800 !bg-slate-300 dark:!bg-slate-700" style={{...style, top: '0px', right: '0px', bottom: '0px', borderRadius: '0px', zIndex: 9}} />}
            renderThumbHorizontal={({ style, ...props }) => <div {...props} className="transition-colorWidth duration-250 !bg-slate-500 dark:!bg-slate-900" style={{...style}} />}
            renderThumbVertical={({ style, ...props }) => <div {...props} className="transition-colorHeight duration-250 !bg-slate-500 dark:!bg-slate-900" style={{...style}} />}
        >
          {data.length === 0 || !data ? (
              <div className={`text-center font-bold text-xl`}>
                <I18N index="general_text_list_empty" text="List is empty" />
              </div>
          ) : data.map((item, itemKey) => (
              <div
                  key={item[nameKey] + itemKey}
                  className={`flex relative items-center text-slate-900 p-2 transition-colors duration-250 ${itemKey % 2 ? 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-800' : 'bg-slate-350 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-800'}`}
              >
                <div className="flex flex-row w-full items-center mr-2 dark:text-slate-300">
                  {visibleData.map((vDataEntry, vDataIndex) => {
                    switch (vDataEntry.type) {
                      case 'icon':
                        if(item[vDataEntry.key] == null) return null;
                        if(vDataEntry.key === 'discordIcon' && (item['discordShowPresence'] === null || item['discordShowPresence'] === "0" || item['discordShowPresence'] === false)) return null;

                        return (<div key={`visibleData_${type.toLowerCase()}_${vDataEntry.type}_${item.id}${vDataIndex}`} className="flex w-10 h-10 mr-2">{vDataEntry.icons[item[vDataEntry.key]]}</div>);
                      case 'group':
                        return (
                            <div key={`visibleData_${type.toLowerCase()}_${vDataEntry.type}_${vDataIndex}`} className="flex flex-col w-full">
                              {vDataEntry.group.map((subtitle) => {
                                switch (subtitle.type) {
                                  case 'text':
                                    if (Object.keys(subtitle).includes("getter")) {

                                    } else {
                                      return (
                                          <span
                                              key={`visibleData_${type.toLowerCase()}_${subtitle.type}_${item.id}${vDataIndex}`}
                                              className={`flex w-full text-left font-normal truncate`}
                                          >
                                        {item[subtitle.key]}
                                      </span>
                                      );
                                    }
                                    break;
                                  case 'subtitle':
                                    let visibleText = "";

                                    if (Object.keys(subtitle).includes("getter")) {
                                      visibleText = subtitle.getter.find((element) => element.id === parseInt(item.group_id))?.name;
                                    } else {
                                      if(item[subtitle.key] == null) return null;
                                      if(subtitle.key === 'discordNiceName' && (item['discordShowPresence'] === null || item['discordShowPresence'] === "0" || item['discordShowPresence'] === false)) return null;

                                      visibleText = item[subtitle.key];
                                    }

                                    if (subtitle?.i18n?.index && subtitle?.i18n?.text) {
                                      visibleText = <I18N index={subtitle.i18n.index} text={subtitle.i18n.text} replace={{"%s": (visibleText ? visibleText : <I18N index="general_text_not_available" text="N/A" />)}} />;
                                    }

                                    return (
                                        <span
                                            key={`visibleData_${type.toLowerCase()}_${subtitle.type}${subtitle?.getter ? "G" : ""}_${item.id}${vDataIndex}`}
                                            className={`flex w-full text-xs text-left truncate p-[2px]`}
                                        >
                                      {visibleText}
                                    </span>
                                    );
                                }
                              })}
                            </div>
                        );
                      case 'text':
                        if (Object.keys(vDataEntry).includes("getter")) {

                        } else {
                          if(item[vDataEntry.key] == null) return null;

                          return (
                              <span
                                  key={`visibleData_${type.toLowerCase()}_${vDataEntry.type}_${item.id}${vDataIndex}`}
                                  className={`flex w-full text-left font-normal truncate`}
                              >
                            {item[vDataEntry.key]}
                          </span>
                          );
                        }
                        break;
                      default:
                        return (<div>{`Item Type (${vDataEntry.type}) not supported!`}</div>);
                    }
                  })}
                </div>
                <Tooltip
                    id={`tooltip_${type.toLowerCase()}_${itemKey}_edit`}
                    placement="left"
                    noTextWrap={true}
                    content={(
                        <h2 className="font-bold"><I18N index="general_text_edit" text="Edit" /></h2>
                    )}
                >
                  <button
                      ref={button1}
                      onClick={() => {setModalEditID(item.id); setModal(true); dispatch(resetNotification());}}
                      className="flex items-center mr-2 p-2.5 transition-colors duration-250 bg-slate-500 hover:bg-slate-600 dark:bg-slate-900 dark:hover:bg-slate-500 text-slate-900 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-900"
                      style={buttonsHeightOffset[1] > 0 ? {top: buttonsHeightOffset[1], bottom: buttonsHeightOffset[1]} : {top: 0, bottom: 0}}
                  >
                    <span className="sr-only"><I18N index="general_text_edit" noDev={true} /></span>
                    <FaEdit className="w-5 h-5" aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                    id={`tooltip_${type.toLowerCase()}_ ${itemKey}_delete`}
                    placement="left"
                    noTextWrap={true}
                    content={(
                        <h2 className="font-bold"><I18N index="general_text_delete" text="Delete" /></h2>
                    )}
                >
                  <button
                      ref={button2}
                      onClick={() => {
                        confirm({
                          title: confirmMessages?.title,
                          message: confirmMessages?.message,
                          confirmButton: async () => {
                            let response = await dispatch(deleteData({ type: type.toLowerCase(), itemID: item.id }));

                            if (response.type.includes("rejected")) {
                              dispatch(setNotification({
                                message: `general_message_text_x_remove_fail`,
                                bottomOffset: 0,
                                args: [`general_text_${type.toLowerCase().slice(0, -1)}`]
                              }));
                            } else {
                              if (onDelete) onDelete();
                              dispatch(setNotification({
                                message: `general_message_text_x_remove_success`,
                                bottomOffset: 0,
                                args: [`general_text_${type.toLowerCase().slice(0, -1)}`]
                              }));
                            }
                          },
                          onShow: () => {
                            dispatch(resetNotification());
                          }
                        });
                      }}
                      className="flex items-center p-2.5 transition-colors duration-250 bg-slate-500 hover:bg-red-500 dark:bg-slate-900 dark:hover:bg-red-500 text-slate-900 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-900"
                      style={buttonsHeightOffset[2] > 0 ? {top: buttonsHeightOffset[2], bottom: buttonsHeightOffset[2]} : {top: 0, bottom: 0}}
                  >
                    <span className="sr-only"><I18N index="general_text_delete" noDev={true} /></span>
                    <FaTimes className="w-5 h-5" aria-hidden="true" />
                  </button>
                </Tooltip>
              </div>
          ))}
        </Scrollbars>
      </div>
      <MiniModal
        show={modal}
        onHide={setModal}
        title={modalEditID === 0 ?
          <I18N index="general_text_new_x" text="New %s" replace={{"%s": <I18N index={`general_text_${type.toLowerCase().slice(0, -1)}`} lowerCase={true} />}} /> :
          <I18N index="general_text_edit_x" text="Edit %s" replace={{"%s": <I18N index={`general_text_${type.toLowerCase().slice(0, -1)}`} lowerCase={true} />}} />
        }
        type={type.toLowerCase().slice(0, -1)}
        edit={modalEditID === 0 ? {} : data.find((element) => element.id === modalEditID)}
        items={items}
        onSubmit={(colsData) => dispatch(setData(modalEditID === 0 ? {
          type: type.toLowerCase(), data: colsData
        } : {
          type: type.toLowerCase(), data: {id: modalEditID, ...colsData}
        }))}
      />
    </div>
  );
}

SimpleDataList.propTypes = {
  type: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  newButtonState: PropTypes.bool.isRequired,
  onOpenNewModal: PropTypes.func.isRequired
}

export default SimpleDataList;