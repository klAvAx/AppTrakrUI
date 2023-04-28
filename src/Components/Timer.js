import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import I18N from "../extra/I18N";

const padNumber = (number, digits = 2) => {
    let _number = number;

    if(digits > _number.toString().length) {
        return (("0".repeat(digits))+_number).slice(-digits);
    } else {
        return _number;
    }
}
export const formatTimestampToElapsedTime = (timestamp, showDays = false) => {
    if(!Number.isInteger(timestamp)) return timestamp;

    timestamp = Math.round(timestamp/1000);

    let Days = 0;
    let Hours;

    if(showDays) {
        Days = Math.floor(timestamp / (24 * 60 * 60));
        Hours = Math.floor((timestamp / (60 * 60)) % 24);
    } else {
        Hours = Math.floor((timestamp / (60 * 60)));
    }

    let Minutes = Math.floor((timestamp / 60) % 60);
    let Seconds = Math.floor(timestamp % 60);

    let str = [];

    if(Days > 0) {
        str.push(<I18N index={`general_text_x_day${Days > 1 ? "s" : ""}`} text={`%s Day${Days > 1 ? "s" : ""}`} replace={{"%s": Days}} />);
        str.push(" ");
    }

    str.push(`${padNumber(Hours)}:${padNumber(Minutes)}:${padNumber(Seconds)}`);

    return str;
}
export const formatTimestampToDate = (timestamp) => {
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

const Timer = ({ start, end, mode }) => {
    const [startTimestamp, setStartTimestamp] = useState(0);
    const [endTimestamp, setEndTimestamp] = useState(0);
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const timer = useRef(null);

    useEffect(() => {
        return () => {
            if(timer.current) clearInterval(timer.current);
        }
    }, []);

    useEffect(() => {
        setStartTimestamp(start);
    }, [start]);

    useEffect(() => {
        if(end) {
            if(timer.current) clearInterval(timer.current);

            setEndTimestamp(end);
            setCurrentTimestamp(0);
        } else {
            setEndTimestamp(0);
            setCurrentTimestamp(new Date().getTime());

            timer.current = setInterval(() => {
                setCurrentTimestamp((prevState) => {
                    return new Date().getTime();
                });
            }, 1000);
        }

        return () => {
            if(timer.current) clearInterval(timer.current);
        }
    }, [end]);

    switch (mode) {
        case "start": {
            return startTimestamp ? formatTimestampToDate(startTimestamp) : "-";
        }
        case "calc": {
            if(startTimestamp && currentTimestamp) {
                return formatTimestampToElapsedTime(currentTimestamp - startTimestamp);
            }
            if(startTimestamp && endTimestamp) {
                return formatTimestampToElapsedTime(endTimestamp - startTimestamp);
            }

            return "-";
        }
        case "end": {
            return endTimestamp ? formatTimestampToDate(endTimestamp) : "-";
        }
        default: {
            return "-";
        }
    }
}

Timer.propTypes = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number,
    mode: PropTypes.oneOf(['start', 'end', 'calc']).isRequired
}

export default Timer;