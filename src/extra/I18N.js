import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";

import PropTypes from 'prop-types';

const __ = (key, value, callback) => {
  if (window.i18n === undefined) return value;
  
  let _value = window.i18n.__(key, value);
  
  if (callback === undefined) return _value;
  _value.then((val) => callback(val));
};

function I18N({ index, text, replace, lowerCase = false, noDev = false }) {
  const isDev = useSelector(({ electron }) => electron.settings.appIsDev);
  const appShowTranslatable = useSelector(({ electron }) => electron.settings.appShowTranslatable);
  
  const [content, setContent] = useState("");
  
  const updateContent = (val) => {
    if(replace) {
      for(const key in replace) {
        switch (typeof replace[key]) {
          case "number":
          case "string": {
            val = val.replace(key, replace[key]);
            break;
          }
          case "object": {
            let replaceTarget = replace[key];
            if(React.isValidElement(replace[key])) {
              replaceTarget = React.cloneElement(replace[key], {key: `replace_for_${key}`});
            }
            
            val = val.split(key);
            val.splice(val.length - 1, 0, replaceTarget);
            break;
          }
          default: {
            console.log(key, typeof replace[key], replace[key]);
          }
        }
      }
    }
  
    setContent(val);
  }
  
  useEffect(() => {
    __(index, (text ? text : ''), updateContent);
  }, []);
  
  useEffect(() => {
    if(index === "") return;
    __(index, '', updateContent);
  }, [index]);
  
  if(content === "") return "";
  
  return !noDev && (isDev ? !appShowTranslatable : appShowTranslatable) ?
    <span style={{color: "#00C800", outline: "2px dotted #FF0000", backgroundColor: "#000000", padding: "2px"}}>{(lowerCase ? content.toLowerCase() : content)}</span> :
    (lowerCase ? content.toLowerCase() : content);
}

I18N.propTypes = {
  index: PropTypes.string.isRequired,
  text: PropTypes.string,
  lowerCase: PropTypes.bool,
  noDev: PropTypes.bool
}

export default I18N;

export const getLangList = (callback) => {
  let _value = window.i18n.getLangList();
  
  if(callback === undefined) return _value;
  _value.then((val) => callback(val));
}

export const getTranslation = (index, text, callback) => {
  if(callback === undefined) return "";
  __(index, text, callback);
}