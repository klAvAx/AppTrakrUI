import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetNotification } from "../redux/reducers/UI";
import { FaTimes } from "react-icons/fa";
import I18N from "../extra/I18N";

function Notification() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const timer1 = useRef(null);
  const timer2 = useRef(null);
  
  const dispatch = useDispatch();
  const notification = useSelector(({ UI }) => UI.notification);
  
  useEffect(() => {
    if(notification.message) {
      console.log(notification);
      
      setVisible(true);
      
      setTimeout(() => {
        setShow(true);
  
        if(timer1.current) clearTimeout(timer1.current);
        if(timer2.current) clearTimeout(timer2.current);
        timer1.current = setTimeout(() => {
          setShow(false);
          
          timer2.current = setTimeout(() => {
            dispatch(resetNotification());
            setTimeout(setVisible, 200, false);
          }, 200);
        }, 5000);
      }, 50);
    } else {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setShow(false);
      setTimeout(setVisible, 200, false);
    }
  }, [notification]);
  
  return visible ? (
      <React.Fragment>
        <div
          className={`flex absolute bottom-0 left-0 right-0 px-2 py-3 items-center bg-slate-800 transform transition text-white z-9999`}
          style={show ? {transform: `translateY(-${notification.bottomOffset}px)`} : {transform: `translateY(100%)`}}
        >
          {/* TODO multiple replace */}
          {/* TODO detect %s position and capitalize accordingly */}
          <div className="w-full pr-2">
            {notification.translatable ? (
              notification.message.includes("_x_") && notification.args.length > 0 ? (
                notification.args.length === 1 ? (
                  <I18N index={notification.message} replace={{"%s": (notification.args[0].includes("_") ? <I18N index={notification.args[0]} /> : notification.args[0])}} />
                ) : "TODO multiple replace"
              ) : <I18N index={notification.message} />
            ) : notification.message}
          </div>
          <div className="cursor-pointer duration-250 transition-colors hover:text-red-400" onClick={() => {
            clearTimeout(timer1.current);
            setShow(false);
          
            clearTimeout(timer2.current);
            timer2.current = setTimeout(() => {
              dispatch(resetNotification());
              clearTimeout(timer2.current);
            }, 250);
          }}>
            <FaTimes className="w-[24px] h-[24px]" />
          </div>
        </div>
      </React.Fragment>
    ) : null;
}

export default Notification;