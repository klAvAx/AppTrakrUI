import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { Provider } from "react-redux";
import { store } from '../redux/store';

import { FaCheck, FaTimes } from 'react-icons/fa';

function Confirm(props) {
  const [visible, setVisible] = useState(false);
  
  const overlay = useRef();
  
  const close = () => {
    setVisible(false);
    setTimeout(removeConfirmElement, 150);
  }
  const submit = () => {
    if(props.confirmButton) {
      setTimeout(props.confirmButton, 150);
    }
    close();
  }
  const keyboardCTL = (event) => {
    if (event.keyCode === 27) {
      // ESC
      close();
    } else if (event.keyCode === 13) {
      // Enter
      submit();
    } else {
      document.addEventListener('keyup', keyboardCTL, { capture: true, once: true });
    }
  }
  
  useEffect(() => {
    document.addEventListener('keyup', keyboardCTL, { capture: true, once: true });
    
    setVisible(true);
    
    if(props.onShow) props.onShow();
    return () => {
      document.removeEventListener('keyup', keyboardCTL,{ capture: true, once: true });
    }
  }, []);
  // border-2 border-slate-800
  return (
    <div
      className={`absolute top-0 left-[2px] right-[2px] h-full flex backdrop-blur-sm z-[999999]`}
      ref={overlay}
      onClick={(event) => {
        if (event.target === overlay.current) {
          close();
        }
      }}
    >
      <div
        className={`absolute bottom-0 left-0 w-full flex bg-slate-800 transform transition text-white p-[10px]`}
        style={visible ? {transform: `translateY(0%)`} : {transform: `translateY(100%)`}}
      >
        <div className='w-full'>
          {props.title ? <h1 className='text-center font-bold text-2xl'>{props.title}</h1> : null}
          {props.message ? <div className='text-xl text-center'>{props.message}</div> : null}
          <div className='flex columns-2 gap-4 w-full mt-3'>
            <button
              onClick={() => { if(props.confirmButton) { setTimeout(props.confirmButton, 150); } close(); }}
              className='flex justify-center w-full border-1 border-slate-500 rounded-lg p-2 text-green-900 bg-green-300 hover:bg-green-500'
            >
              <FaCheck className='w-[24px] h-[24px]' />
            </button>
            <button
              onClick={() => { if(props.cancelButton) { setTimeout(props.cancelButton, 150); } close(); }}
              className='flex justify-center w-full border-1 border-slate-500 rounded-lg p-2 text-red-900 bg-red-300 hover:bg-red-500'
            >
              <FaTimes className='w-[24px] h-[24px]' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Confirm.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  confirmButton: PropTypes.func.isRequired,
  cancelButton: PropTypes.func,
  onShow: PropTypes.func
}

export default Confirm;

let root = null;

function removeConfirmElement() {
  const target = document.getElementById('confirm-alert');
  if (target) {
    if(root) root.unmount();
    target.parentNode.removeChild(target);
    root = null;
  }
}

export function confirm(properties) {
  let divTarget = document.getElementById('confirm-alert');
  
  if (divTarget) {
    // Rerender - the mounted ReactConfirmAlert
    if(root === null) root = ReactDOM.createRoot(divTarget);
    root.render(<Provider store={store}><Confirm {...properties} /></Provider>);
  } else {
    // Mount the ReactConfirmAlert component
    divTarget = document.createElement('div');
    divTarget.id = 'confirm-alert';
    document.body.appendChild(divTarget);
    
    root = ReactDOM.createRoot(divTarget);
    root.render(<Provider store={store}><Confirm {...properties} /></Provider>);
  }
}