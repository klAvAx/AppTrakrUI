import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIcon, getDiscordIcon } from "../extra/typeIcons";
import { FaAngleDown, FaDiscord } from "react-icons/fa";
import I18N from "../extra/I18N";
import Marquee from "../Components/Marquee";
import { getDataOfType } from "../redux/reducers/simpleDataList";
import { toggleCollapsed } from "../redux/reducers/UI";
import Tooltip from "../Components/Tooltip";

function IndexPage() {
  const appSettings = useSelector(({ electron }) => electron.settings);
  const dataConfiguredGroups = useSelector(({ simpleDataList }) => simpleDataList?.groups);
  const dataConfiguredRules = useSelector(({ simpleDataList }) => simpleDataList?.rules);
  const collapsed = useSelector(({ UI }) => UI.collapsed?.index);
  
  const dispatch = useDispatch();
  
  const observerRef = useRef(null);
  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if(entry.intersectionRect.top === entry.rootBounds.top) {
        // Hide collapse button & Square top corners
        entry.target.classList.remove('rounded-t-md');
        entry.target.style.zIndex = '1';
        const collapseBTN = entry.target.getElementsByClassName('collapseBTN')[0];
        collapseBTN.hidden = true;
        collapseBTN.disabled = true;
      } else {
        if(entry.intersectionRatio === 1) {
          // Show collapse button & Round top corners
          entry.target.classList.add('rounded-t-md');
          entry.target.style.zIndex = '';
          const collapseBTN = entry.target.getElementsByClassName('collapseBTN')[0];
          collapseBTN.hidden = false;
          collapseBTN.disabled = false;
        }
      }
    });
  }
  const stickyAddonsAttach = () => {
    observerRef.current = new IntersectionObserver(observerCallback, {
      root: document.querySelector('#mainContainer'),
      rootMargin: '-1px',
      threshold: 1.0
    });
  
    let elements = document.getElementsByClassName('sticky');
    for(const element of elements) {
      observerRef.current.observe(element);
    }
  }
  const stickyAddonsDetach = () => {
    let elements = document.getElementsByClassName('sticky');
    for(const element of elements) {
      if(observerRef.current) observerRef.current.unobserve(element);
    }
  
    if(observerRef.current) observerRef.current.disconnect();
    observerRef.current = null;
  }
  
  useEffect(() => {
    stickyAddonsAttach();
    
    return () => {
      stickyAddonsDetach();
    };
  }, [dataConfiguredGroups]);
  
  useEffect(() => {
    // Get Data
    dispatch(getDataOfType({ type: 'groups', cols: (appSettings.appAllowInternetConnectivity && appSettings.appDiscordEnabled ? ['name', 'discordIcon', 'discordNiceName', 'discordShowPresence'] : ['name']) }));
    dispatch(getDataOfType({ type: 'rules', cols: (appSettings.appAllowInternetConnectivity && appSettings.appDiscordEnabled ? ['rule', 'type', 'discordNiceName', 'discordShowPresence'] : ['rule', 'type']) }));
  }, [appSettings]);
  
  return (
    <div className="flex flex-col p-4">
      {dataConfiguredGroups && dataConfiguredRules?.length > 0 ? dataConfiguredGroups.map((group, groupIndex) => {
        const rules = dataConfiguredRules.filter((rule) => rule.group_id === group.id);
        const _collapsed = collapsed?.[groupIndex];
        
        return (
          <div
            key={`${group.name}_${groupIndex}`}
            className={`flex flex-col relative mb-4 last:mb-0 border-2 rounded-lg transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-200 dark:bg-slate-600`}
          >
            <div className={`flex sticky top-0 p-2 font-bold ${_collapsed ? 'border-b-0 rounded-md' : 'border-b-2 rounded-t-md'} transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-400 dark:bg-slate-800`}>
              {group?.discordShowPresence && (group?.discordIcon || group?.discordNiceName) ? (
                <Tooltip
                  id={`tooltip_discord_${groupIndex}`}
                  placement="leftBottom"
                  noTextWrap={true}
                  content={(
                    <div>
                      {group?.discordIcon ? <div className="flex gap-2 items-center"><div><I18N index="general_text_icon" text="Icon:" /></div><div className="w-8 h-8">{getDiscordIcon(group.discordIcon)}</div></div> : null}
                      {group?.discordNiceName ? <div className="flex items-center"><I18N index="general_text_discord_appear_as_x_activity" text="Appears as %s activity" replace={{"%s": <code className="p-1 border-1 rounded-xl bg-slate-100">{group.discordNiceName}</code>}} /></div> : null}
                    </div>
                  )}
                >
                  <div className="w-6 h-6 mr-2 transition-colors duration-250 dark:text-slate-350">
                    <FaDiscord className={`w-full h-full`} />
                  </div>
                </Tooltip>
              ) : null}
              <div className="w-full truncate transition-colors duration-250 dark:text-slate-350 select-none">{group.name}</div>
              <Tooltip
                id={`tooltip_${groupIndex}`}
                placement="left"
                noTextWrap={true}
                content={(
                  <h2 className="font-bold">
                    {_collapsed ? <I18N index="general_text_expand" text="Expand" /> : <I18N index="general_text_collapse" text="Collapse" />}
                  </h2>
                )}
              >
                <button
                  className="w-6 h-6 transition-colors duration-250 text-slate-700 collapseBTN hover:text-slate-50 dark:text-slate-500 dark:hover:text-slate-50"
                  onClick={() => dispatch(toggleCollapsed({group: "index", key: groupIndex}))}
                >
                  <span className='sr-only'>{ _collapsed ? <I18N index="general_text_expand" noDev={true} /> : <I18N index="general_text_collapse" noDev={true} /> }</span>
                  <FaAngleDown className={`w-full h-full transition ${_collapsed ? "rotate-0" : "rotate-180"}`} />
                </button>
              </Tooltip>
            </div>
            {!_collapsed ? (
              <div className={`flex flex-col`}>
                {group && rules.length > 0 ? rules.map((rule, ruleIndex) => {
                  return (
                    <div
                      key={`${group.name}_${rule.rule}_${ruleIndex}`}
                      className={`flex p-2 border-b-2 last:border-b-0 transition-colors duration-250 border-slate-400 dark:border-slate-800`}
                    >
                      {rule?.discordShowPresence && rule?.discordNiceName ? (
                        <Tooltip
                          id={`tooltip_discord_${groupIndex}_${ruleIndex}`}
                          placement="leftBottom"
                          noTextWrap={true}
                          content={(
                            <div className="font-bold">
                              <div className="flex items-center">
                                <I18N index="general_text_discord_appear_as_x_comment" text="Appears as activity's %s state" replace={{"%s": <code className="p-1 border-1 rounded-xl bg-slate-100">{rule.discordNiceName}</code>}} />
                              </div>
                            </div>
                          )}
                        >
                          <div className="w-6 h-6 mr-2 transition-colors duration-250 text-slate-900 dark:text-slate-300">
                            <FaDiscord className={`w-full h-full`} />
                          </div>
                        </Tooltip>
                      ) : null}
                      <Tooltip
                        id={`tooltip_${groupIndex}_${ruleIndex}`}
                        placement="leftBottom"
                        noTextWrap={true}
                        content={(
                          <h2 className="font-bold">
                            <I18N index={`general_text_${rule.type}_rule_type`} text="" />
                          </h2>
                        )}
                      >
                        <div className="text-left text-xs h-6 w-6 content-center text-slate-900 dark:text-slate-300">
                          <span className='sr-only'><I18N index={`general_text_${rule.type}_rule_type`} noDev={true} /></span>
                          {getIcon(rule.type)}
                        </div>
                      </Tooltip>
                      <div
                        className="w-full ml-2 truncate text-left text-slate-900 dark:text-slate-300 select-none cursor-copy"
                        onClick={() => {
                          navigator.clipboard.writeText((rule.type === "exec" ? rule.rule : `/${rule.rule}/`));
                        }}
                      >
                        <Marquee text={rule.type === "exec" ? rule.rule : `/${rule.rule}/`} />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex justify-center p-2 font-bold transition-colors duration-250 text-slate-900 dark:text-slate-300">
                    <I18N index="index_group_has_no_rules" text="This group does not have any rules defined." />
                  </div>
                )}
              </div>
              ) : null}
          </div>
        );
      }) : (
        <div className="text-center text-xl font-bold">
          <div className="block">
            <I18N index="index_heading_no_rules_configured" text="There Are No Rules Configured, Yet..." />
          </div>
          <div className="block">
            <I18N index="index_heading_consider_adding_some_rules" text="Consider Adding some Rules in Settings Page" />
          </div>
        </div>
      )}
    </div>
  );
}

export default IndexPage;