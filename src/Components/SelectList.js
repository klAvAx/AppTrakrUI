import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Transition } from "@headlessui/react";
import { FaAngleDown, FaCheck } from "react-icons/fa";
import { toggleBackdrop, setBackdropIndex } from "../redux/reducers/UI";

function SelectList(props) {
  const [expanded, setExpanded] = useState(false);
  const backdropShouldClose = useSelector(({ UI }) => UI.backdrop.wantsToClose);
  
  const dispatch = useDispatch();
  
  useEffect(() => {
    if(expanded) dispatch(setBackdropIndex(1501));
    dispatch(toggleBackdrop(expanded));
  }, [expanded]);
  
  useEffect(() => {
    if(backdropShouldClose && expanded) {
      setExpanded(false);
    }
  }, [backdropShouldClose]);
  
  return (
    <React.Fragment>
      <div className="flex">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center w-[10rem] bg-white border-1 rounded-lg text-left cursor-pointer transition-colors duration-250 border-slate-500 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-300 dark:hover:bg-slate-100"
          aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label"
        >
          <span className="pl-[2px] ml-2 block w-full truncate">
            {props.items ? props.items.find((item) => item.value === props.selected)?.name : ""}
          </span>
          <span className="ml-3 pr-2">
            <FaAngleDown className={`${expanded ? 'rotate-180' : 'rotate-0'} transition w-5 h-5 text-slate-400 dark:text-slate-800`} aria-hidden="true" />
          </span>
        </button>
        
        <Transition
          as={React.Fragment}
          show={expanded}
          enter="transition duration-250 ease-in"
          enterFrom="transform -translate-y-5 scale-90 opacity-0"
          enterTo="transform translate-y-[-50%] scale-100 opacity-100"
          leave="transition duration-200 ease-out"
          leaveFrom="transform translate-y-[-50%] scale-100 opacity-100"
          leaveTo="transform -translate-y-5 scale-90 opacity-0"
        >
          <div className={`absolute top-[50%] left-0 right-0 mx-[15px] z-[1502]`}>
            <div
              className="z-10 shadow-lg max-h-56 rounded-md text-base overflow-auto border-2 rounded-lg transition-colors duration-250 bg-white dark:bg-slate-600 border-slate-400 dark:border-slate-800"
              tabIndex="-1"
              role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3"
            >
              {props.items ? props.items.map((item, itemKey) => (
                <button
                  key={item.name+itemKey}
                  disabled={item?.disabled}
                  onClick={() => {setExpanded(false); props.onChoose(item.value);}}
                  className={`block w-full text-slate-900 select-none relative py-2 pr-3 pl-9 transition-colors duration-250 ${item?.disabled ? 'text-slate-900 dark:text-slate-450' : 'text-slate-900 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <span className="absolute left-0 inset-y-0 inline-flex items-center ml-4 transition-colors duration-250 text-slate-800 dark:text-slate-300">
                    {props.selected === item.value ? <FaCheck className="w-5 h-5" aria-hidden="true" /> : null}
                  </span>
                  <div className="block">
                    <span className={`block pl-[2px] text-left font-normal ml-3 truncate`}>
                      {item.name}
                    </span>
                  </div>
                </button>
              )) : null}
            </div>
          </div>
        </Transition>
      </div>
    </React.Fragment>
  );
}

export default SelectList;