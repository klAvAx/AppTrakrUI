import React from 'react';
import { useSelector } from "react-redux";
import I18N from "../extra/I18N";

import Marquee from "../Components/Marquee";
import Tooltip from "../Components/Tooltip";

const formatDate = (date) => {
  let formatted = "";
  
  formatted += date.getFullYear();
  formatted += "-"+("00"+(date.getMonth()+1)).slice(-2);
  formatted += "-"+("00"+(date.getDate())).slice(-2);
  formatted += " "+("00"+(date.getHours())).slice(-2);
  formatted += ":"+("00"+(date.getMinutes())).slice(-2);
  formatted += ":"+("00"+(date.getSeconds())).slice(-2);
  
  return formatted;
}

// TODO some titles are too long define a max width for the popup?
function ProcessListPage() {
  const runningList = useSelector(({ process }) => process.running);
  
  return (
    <div className="flex flex-col p-4">
      {runningList.length === 0 ? (
        <div className="text-center text-xl font-bold">
          <I18N index="processlist_heading_no_processes_yet" text="No Processes detected, Yet..." />
        </div>
      ) : runningList.map((process, procIndex) => {
        return (
          <div
            key={`processList_${procIndex}`}
            className={`flex flex-col p-2 mb-4 last:mb-0 border-2 rounded-lg transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-400 dark:bg-slate-800`}
          >
            <Tooltip
              id={`tooltip_${procIndex}_title`}
              placement="leftBottom"
              content={(
                <h2 className="font-bold">{process.WindowTitle}</h2>
              )}
            >
              <div
                className="w-full truncate transition-colors duration-250 dark:text-slate-350 select-none cursor-copy"
                onClick={() => {
                  navigator.clipboard.writeText(process.WindowTitle)
                }}
              >
                <Marquee text={process.WindowTitle} />
              </div>
            </Tooltip>
            <div className="flex justify-between text-xs">
              <Tooltip
                id={`tooltip_${procIndex}_exec`}
                placement="leftBottom"
                noTextWrap={true}
                wrapperClassList={"w-9/12"}
                content={(
                  <h2 className="font-bold text-base">
                    <I18N index="processlist_text_process_executable" text="Process Executable" />
                  </h2>
                )}
              >
                <div
                  className="w-full truncate mr-2 transition-colors duration-250 dark:text-slate-350 select-none cursor-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(process.Executable)
                  }}
                >
                  {process.Executable}
                </div>
              </Tooltip>
              <Tooltip
                id={`tooltip_${procIndex}_time`}
                placement="rightBottom"
                noTextWrap={true}
                wrapperClassList={""}
                content={(
                  <h2 className="font-bold text-base">
                    <I18N index="processlist_text_time_process_started" text="Time Process Started" />
                  </h2>
                )}
              >
                <div className="text-right whitespace-nowrap transition-colors duration-250 dark:text-slate-350 select-none">
                  {formatDate(new Date(process.StartTime*1000))}
                </div>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProcessListPage;