import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Switch, Transition } from "@headlessui/react";
import { setNotification, toggleBackdrop, setBackdropIndex } from "../redux/reducers/UI";
import I18N, { getTranslation } from "../extra/I18N";
import Tooltip from "./Tooltip";
import { toggleAppSetting } from "../redux/reducers/electron";

function MiniModal({ title, type, show, onHide, onSubmit, items, edit }) {
  const isDev = useSelector(({ electron }) => electron.settings.appIsDev);
  const backdropShouldClose = useSelector(({ UI }) => UI.backdrop.wantsToClose);
  
  const inputField = useRef();
  const modal = useRef();
  
  const [state, setState] = useState({});
  const dispatch = useDispatch();
  
  const [placeholder, setPlaceholder] = useState({});
  
  const onInputSubmit = async (value) => {
    let valid = true;
    
    Object.keys(value).forEach((stateKey) => {
      if(value[stateKey].required) {
        if(value[stateKey].requires.length > 0) {
          let allDepsValid = true;
          for(const depends of value[stateKey].requires) {
            if(value[depends]?.value) {
              allDepsValid = (state[depends]?.value && state[stateKey]?.value !== "" && state[stateKey]?.value !== 0 && state[stateKey]?.value !== false) && allDepsValid;
            }
          }
          valid = allDepsValid && valid;
        } else {
          valid = (value[stateKey]?.value !== "" && value[stateKey]?.value !== 0 && value[stateKey]?.value !== false) && valid;
        }
      }
    });
    
    if(!valid) {
      dispatch(setNotification({
        message: 'text_error_no_empty_values',
        bottomOffset: modal.current.offsetHeight
      }));
      return;
    }
    
    let data = {};
    for(const _data in value) {
      if(value[_data]?.value) {
        data[_data] = value[_data]?.value;
      }
    }
    
    const result = await onSubmit(data);
    
    if(result.type.includes("rejected")) {
      if(result.payload.error.code === "SQLITE_CONSTRAINT") {
        dispatch(setNotification({
          message: "text_error_database_entry_already_exists",
          bottomOffset: modal.current.offsetHeight
        }));
      } else {
        dispatch(setNotification({
          message: `text_error_unknown${isDev ? '_check_logs' : '_contact_developer'}`,
          bottomOffset: modal.current.offsetHeight
        }));
        if(isDev) {
          console.log(result);
        }
      }
    } else {
      onClose();
      
      if(Object.keys(edit).length === 0) {
        setTimeout(() => dispatch(setNotification({
          message: `general_message_text_x_add_success`,
          bottomOffset: 0,
          args: [`general_text_${type}`]
        })), 100);
      } else {
        setTimeout(() => dispatch(setNotification({
          message: `general_message_text_x_update_success`,
          bottomOffset: 0,
          args: [`general_text_${type}`]
        })), 100);
      }
    }
  }
  
  const onClose = () => {
    onHide(false);
    setTimeout(setState, 50, (prevState) => {
      let newState = {...prevState};
      Object.keys(newState).forEach((key) => {
        newState[key] = {
          ...prevState[key],
          value: ""
        };
      });
      return newState;
    });
  }
  
  useEffect(() => {
    let newState = {};
    
    items.forEach((item, itemIndex) => {
      // set State Name
      newState[item.name] = {
        value: Object.keys(edit).length > 0 ? edit[item.name] : "",
        required: item?.required || false,
        requires: item?.requires || []
      };
      
      // Set placeholders
      if(item?.placeholder) {
        if(typeof item.placeholder === "string") {
          setPlaceholder((prevState) => {
            let newState = {...prevState};
            newState[`${item.name}_${itemIndex}`] = item.placeholder
            return newState;
          });
        } else {
          if(item.placeholder.index) {
            getTranslation(item.placeholder.index, item.placeholder.text, (text) => {
              setPlaceholder((prevState) => {
                let newState = {...prevState};
                newState[`${item.name}_${itemIndex}`] = text;
                return newState;
              });
            });
          } else {
            for(const key in item.placeholder) {
              for(const key2 in item.placeholder[key]) {
                getTranslation(item.placeholder[key][key2].index, item.placeholder[key][key2].text, (text) => {
                  setPlaceholder((prevState) => {
                    let newState = {...prevState};
                    if(newState?.[`${item.name}_${itemIndex}`] === undefined) newState[`${item.name}_${itemIndex}`] = {};
                    newState[`${item.name}_${itemIndex}`][key2] = text;
                    return newState;
                  });
                });
              }
            }
          }
        }
      }
    });
    
    setState(newState);
  }, []);
  
  useEffect(() => {
    if(Object.keys(edit).length > 0) {
      let newState = {};
      items.forEach((item) => {
        newState[item.name] = {
          value: Object.keys(edit).length > 0 ? edit[item.name] : "",
          required: item?.required || false,
          requires: item?.requires || []
        };
      });
      setState(newState);
    }
  }, [edit]);
  
  useEffect(() => {
    if(show) dispatch(setBackdropIndex(1501));
    dispatch(toggleBackdrop(show));
  }, [show]);
  useEffect(() => {
    if(backdropShouldClose && show) {
      onClose();
    }
  }, [backdropShouldClose]);
  
  let inputElements = [];
  items.forEach((item, itemIndex) => {
    let requirementsMet = true;
    let label = null;
  
    if(item?.requires?.length > 0) {
      item.requires.forEach((requirement) => {
        requirementsMet = requirementsMet && (state[requirement]?.value !== "" && state[requirement]?.value !== 0 && state[requirement]?.value !== false);
      });
    }
    if(!requirementsMet) return;
    
    if(item?.label) {
      if(React.isValidElement(item.label)) {
        label = item.label;
      } else {
        let stateKey = Object.keys(item.label)[0];
        if(React.isValidElement(item.label[stateKey][state[stateKey]?.value])) {
          label = item.label[stateKey][state[stateKey]?.value];
        }
      }
    }
    
    switch (item.type) {
      case "input": {
        let _placeholder = "";
  
        if(placeholder?.[`${item.name}_${itemIndex}`]) {
          if(typeof item.placeholder === "string") {
            _placeholder = placeholder[`${item.name}_${itemIndex}`];
          } else {
            if(item.placeholder.index) {
              _placeholder = placeholder[`${item.name}_${itemIndex}`];
            } else {
              let stateKey = Object.keys(item.placeholder)[0];
              _placeholder = placeholder[`${item.name}_${itemIndex}`][state[stateKey]?.value];
            }
          }
        }
        
        const html = (
          <input
            value={state[item.name]?.value}
            placeholder={_placeholder}
            onChange={(e) => setState((prevState) => {
              return {
                ...prevState,
                [item.name]: {
                  ...prevState[item.name],
                  value: e.target.value
                }
              }
            })}
            onKeyUp={(e) => e.key === "Enter" ? onInputSubmit(state) : true}
            className={`block border-1 border-slate-500 rounded-lg p-2 text-base w-full text-slate-900 dark:text-slate-900`}
          />
        );
        
        inputElements.push(
          <div key={itemIndex} className={`mb-4 last:mb-0`}>
            {label ? <label className="text-xl dark:text-slate-300">{label}{html}</label> : html}
            {item?.comment ? <div className="text-center text-sm pb-3 text-slate-400 font-bold">{item.comment}</div> : null}
          </div>
        );
        break;
      }
      case "select": {
        let selectOptions = [];
  
        if(item.options) {
          selectOptions.push(<option key={`${item.name}_${itemIndex}_empty`} value="" disabled>{item.emptyTxt}</option>);
          if(Array.isArray(item.options)) {
            item.options.forEach((option) => {
              selectOptions.push(
                <option key={`${item.name}_${option.id}`} value={option.id}>{option.name}</option>
              );
            })
          } else {
            Object.keys(item.options).forEach((optionKey, optionKeyIndex) => {
              selectOptions.push(
                <option key={`${item.name}_${optionKeyIndex}`} value={optionKey}>{item.options[optionKey]}</option>
              );
            });
          }
        }
        
        const html = (
          <select
            value={state[item.name]?.value}
            onChange={(e) => setState((prevState) => {
              return {
                ...prevState,
                [item.name]: {
                  ...prevState[item.name],
                  value: e.target.value
                }
              }
            })}
            className={`block border-1 border-slate-500 rounded-lg p-2 w-full text-slate-900 dark:text-slate-900`}
          >
            {selectOptions}
          </select>
        );
        
        inputElements.push(
          <div key={itemIndex} className={`mb-4 last:mb-0`}>
            {label ? <label className="text-xl dark:text-slate-300">{label}{html}</label> : html}
            {item?.comment ? <div className="text-center text-sm pb-3 text-slate-400 font-bold">{item.comment}</div> : null}
          </div>
        );
        break;
      }
      case "checkbox": {
        const html = (
          <Switch
            checked={state[item.name]?.value}
            onChange={(e) => setState((prevState) => {
              return {
                ...prevState,
                [item.name]: {
                  ...prevState[item.name],
                  value: e
                }
              }
            })}
            className={`${state[item.name]?.value ? 'bg-green-300' : 'bg-red-300'} relative flex items-center h-6 rounded-full w-12`}
          >
            <span className={`${state[item.name]?.value ? 'translate-x-7 bg-green-600' : 'translate-x-1 bg-red-600'} inline-block w-4 h-4 transform transition rounded-full`} aria-hidden="true" />
          </Switch>
        );
        
        inputElements.push(
          <div key={itemIndex} className={`mb-4 last:mb-0`}>
            {label ? <label className="text-xl dark:text-slate-300">{label}{html}</label> : html}
            {item?.comment ? <div className="text-center text-sm pb-3 text-slate-400 font-bold">{item.comment}</div> : null}
          </div>
        );
        break;
      }
      case "selectIcon": {
        let html = [];
        
        if(item.options) {
          for(const key in item.options) {
            const defaultClasses = "bg-slate-300 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-900 text-slate-900 hover:text-slate-300 dark:text-slate-400 dark:hover:text-slate-100";
            const activeClasses = "bg-slate-700 hover:bg-slate-300 dark:bg-slate-400 dark:hover:bg-slate-900 text-slate-300 hover:text-slate-900 dark:text-slate-900 dark:hover:text-slate-100";
            
            html.push(
              <div
                key={`${itemIndex}_${key}`}
                onClick={(e) => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      [item.name]: {
                        ...prevState[item.name],
                        value: key
                      }
                    }
                  });
                }}
                className={`p-2 rounded-lg cursor-pointer transition-colors duration-250 ${key === state[item.name]?.value ? activeClasses : defaultClasses}`}
              >
                <input type="radio" name={item.name} value={key} className="hidden" checked={key === state[item.name]?.value} readOnly />
                <div className="w-[32px] h-[32px]">{item.options[key]}</div>
              </div>
            );
          }
        }
        
        if(html.length === 0) break;
        
        inputElements.push(
          <div key={itemIndex} className={`mb-4 last:mb-0`}>
            {label ? (
              <React.Fragment>
                <label className="text-xl dark:text-slate-300">{label}</label>
                <div className="grid grid-cols-10 gap-4 justify-between place-items-center">{html}</div>
                
              </React.Fragment>
            ) : <div className="grid grid-cols-10 gap-4 justify-between place-items-center">{html}</div>}
            {item?.comment ? <div className="text-center text-sm pb-3 text-slate-400 font-bold">{item.comment}</div> : null}
          </div>
        );
        break;
      }
      default:
        inputElements.push(<div key={itemIndex}>{`Unsupported Item Type (${item.type})`}</div>);
        break;
    }
  });
  
  return (
    <React.Fragment>
      <Transition
        as={React.Fragment}
        show={show}
        enter="transition duration-250 ease-in"
        enterFrom="transform translate-y-full scale-90 opacity-0"
        enterTo="transform translate-y-0 scale-100 opacity-100"
        leave="transition duration-200 ease-out"
        leaveFrom="transform translate-y-0 scale-100 opacity-100"
        leaveTo="transform translate-y-full scale-90 opacity-0"
        afterEnter={() => {
          if(inputField?.current) {
            setTimeout((el) => el.focus(), 150, inputField.current);
          }
        }}
      >
        <div className={`fixed bottom-0 left-0 right-0 z-[1502]`}>
          <div ref={modal} className={`text-base shadow-lg max-h-[75vh] overflow-auto border-2 border-slate-800 transition-colors duration-250 bg-slate-100 dark:bg-slate-600`}>
            <div className="flex flex-col">
              <h2 className="sticky top-0 py-2 text-center text-xl font-bold border-b-2 transition-colors duration-250 border-slate-800 bg-slate-300 dark:bg-slate-800 dark:text-slate-300">{title}</h2>
              {items.length === 1 ? (
                  <div className="flex flex-row p-4">
                    <Tooltip
                      id={`tooltip_submit`}
                      placement="leftTop"
                      noTextWrap={true}
                      content={(
                        <h2 className="font-bold"><I18N index="general_text_submit" text="Submit" /></h2>
                      )}
                    >
                      <button onClick={() => onInputSubmit(state)} className="inline-flex border-1 border-r-0 border-slate-500 rounded-l-lg p-2 bg-green-300 hover:bg-green-500">
                        <span className="sr-only"><I18N index="general_text_submit" noDev={true} /></span>
                        <FaCheck className="w-[24px] h-[24px]" aria-hidden="true" />
                      </button>
                    </Tooltip>
                    <input
                      ref={inputField}
                      value={state[items[0].name]?.value}
                      onChange={(e) => setState((prevState) => {
                        return {
                          ...prevState,
                          [items[0].name]: {
                            ...prevState[items[0].name],
                            value: e.target.value
                          }
                        }
                      })}
                      onKeyUp={(e) => e.key === "Enter" ? onInputSubmit(state) : true}
                      placeholder={placeholder[`${items[0].name}_0`]}
                      className="border-1 border-slate-500 pl-2 w-full"
                    />
                    <Tooltip
                      id={`tooltip_cancel`}
                      placement="rightTop"
                      noTextWrap={true}
                      content={(
                        <h2 className="font-bold"><I18N index="general_text_cancel" text="Cancel" /></h2>
                      )}
                    >
                      <button onClick={onClose} className="border-1 border-l-0 border-slate-500 rounded-r-lg p-2 bg-red-300 hover:bg-red-500">
                        <span className="sr-only"><I18N index="general_text_cancel" noDev={true} /></span>
                        <FaTimes className="w-[24px] h-[24px]" aria-hidden="true" />
                      </button>
                    </Tooltip>
                  </div>
                ) : (
                  <div className="flex flex-col p-4">
                    <div className="columns-1 w-full pb-4">
                      {inputElements}
                    </div>
                    <div className="flex gap-4 w-full">
                      <Tooltip
                        id={`tooltip_submit`}
                        placement="rightTop"
                        noTextWrap={true}
                        content={(
                          <h2 className="font-bold"><I18N index="general_text_submit" text="Submit" /></h2>
                        )}
                        wrapperClassList="w-full"
                      >
                        <button onClick={() => onInputSubmit(state)} className="flex justify-center w-full border-1 border-slate-500 rounded-lg p-2 bg-green-300 hover:bg-green-500">
                          <span className="sr-only"><I18N index="general_text_submit" noDev={true} /></span>
                          <FaCheck className="w-[24px] h-[24px]" aria-hidden="true" />
                        </button>
                      </Tooltip>
                      <Tooltip
                        id={`tooltip_cancel`}
                        placement="rightTop"
                        noTextWrap={true}
                        content={(
                          <h2 className="font-bold"><I18N index="general_text_cancel" text="Cancel" /></h2>
                        )}
                        wrapperClassList="w-full"
                      >
                        <button onClick={onClose} className="flex justify-center w-full border-1 border-slate-500 rounded-lg p-2 bg-red-300 hover:bg-red-500">
                          <span className="sr-only"><I18N index="general_text_cancel" noDev={true} /></span>
                          <FaTimes className="w-[24px] h-[24px]" aria-hidden="true" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </Transition>
    </React.Fragment>
  );
}

export default MiniModal;