import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";

// TODO add useEffect on content change and rerender that
// TODO implement missing placements
// NOTE maybe redo this as a singular thing which grabs the title automatically?
const Tooltip = ({ id, showArrow, placement, content, noTextWrap, wrapperClassList, tooltipClassList, ...props }) => {
  const ChildTag = props.children.type;
  const { children: ChildChildren, ...ChildProps } = props.children.props;
  
  const [isVisible, setIsVisible] = useState(false);
  
  const getTooltip = () => {
    let classList = [
      "absolute", "p-2", "select-none",
      "border-2", "border-slate-400", "rounded-lg",
      "bg-slate-350", "bg-opacity-90",
      "shadow-2xl", "shadow-black",
      "transition-tooltip",
      "z-1500"
    ];
    
    if(noTextWrap) classList.push("whitespace-nowrap");
  
    switch (placement) {
      case "left": {
        classList.push("right-[100%]");
        break;
      }
      case "right": {
        classList.push("left-[100%]");
        break;
      }
      case "top": {
        classList.push("bottom-[100%]");
        //_tooltip.style.left = `${_targetPos.left - (_tooltipPos.width / 2) + (_targetPos.width / 2)}px`;
        break;
      }
      case "bottom": {
        classList.push("top-[100%]");
        //_tooltip.style.left = `${_targetPos.left - (_tooltipPos.width / 2) + (_targetPos.width / 2)}px`;
        break;
      }
      case "topLeft": {
        classList.push("bottom-[100%]");
        //_tooltip.style.left = `${_targetPos.left - _tooltipPos.width}px`;
        break;
      }
      case "topRight": {
        classList.push("bottom-[100%]");
        //_tooltip.style.left = `${_targetPos.left + _targetPos.width}px`;
        break;
      }
      case "bottomLeft": {
        classList.push("top-[100%]");
        //_tooltip.style.left = `${_targetPos.left - _tooltipPos.width}px`;
        break;
      }
      case "bottomRight": {
        classList.push("top-[100%]");
        classList.push("left-[100%]");
        break;
      }
      case "rightTop": {
        classList.push("bottom-[100%]");
        classList.push("right-0");
        break;
      }
      case "rightBottom": {
        classList.push("top-[100%]");
        classList.push("right-0");
        break;
      }
      case "leftTop": {
        classList.push("bottom-[100%]");
        classList.push("left-0");
        break;
      }
      case "leftBottom": {
        classList.push("top-[100%]");
        classList.push("left-0");
        break;
      }
    }

    return content ? (
      <div className={classList.concat(tooltipClassList ?? []).join(" ")}>
        {content}
      </div>
    ) : null;
  }
  
  return (typeof ChildTag === "function" ? (
    <div className={`flex relative ${wrapperClassList}`} onMouseEnter={() => {setIsVisible(true)}} onMouseLeave={() => {setIsVisible(false)}}>
      <ChildTag {...ChildProps}>
        {ChildChildren ? (Array.isArray(ChildChildren) ? ChildChildren.map((elem) => elem) : ChildChildren) : null}
      </ChildTag>
      {isVisible ? getTooltip() : null}
    </div>
  ) : (
    <div className={`flex relative ${wrapperClassList}`}>
      <ChildTag {...ChildProps} onMouseEnter={() => {setIsVisible(true)}} onMouseLeave={() => {setIsVisible(false)}}>
        {ChildChildren ? (Array.isArray(ChildChildren) ? ChildChildren.map((elem) => elem) : ChildChildren) : null}
      </ChildTag>
      {isVisible ? getTooltip() : null}
    </div>
  ));
};

Tooltip.propTypes = {
  id: PropTypes.string.isRequired,
  showArrow: PropTypes.bool,
  placement: PropTypes.oneOf(['left', 'right', 'top', 'bottom', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'rightTop', 'rightBottom', 'leftTop', 'leftBottom']),
  content: PropTypes.element,
  noTextWrap: PropTypes.bool,
  wrapperClassList: PropTypes.string,
  tooltipClassList: PropTypes.arrayOf(PropTypes.string)
}

export default Tooltip;