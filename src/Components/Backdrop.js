import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { shouldCloseBackdrop, toggleBackdrop } from "../redux/reducers/UI";

function Backdrop() {
  const dispatch = useDispatch();
  const backdrop = useSelector((state) => state.UI.backdrop.visible);
  const zIndex = useSelector((state) => state.UI.backdrop.zIndex);
  
  return (
    <div onClick={() => dispatch(shouldCloseBackdrop())} className={`${backdrop ? 'block' : 'hidden'} absolute top-0 left-[2px] right-[2px] bottom-[2px] backdrop-blur-sm`} style={{zIndex: zIndex}} />
  );
}

export default Backdrop;