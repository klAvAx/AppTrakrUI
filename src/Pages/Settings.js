import React, { useEffect, useRef, useState } from "react";
import { Switch, Transition } from "@headlessui/react";

import I18N, { getLangList } from "../extra/I18N";
import icons, { discordIcons } from "../extra/typeIcons";

import { useDispatch, useSelector } from "react-redux";
import { toggleAppSetting, setAppSetting } from "../redux/reducers/electron";

import { FaPlus } from "react-icons/fa";
import SelectList from "../Components/SelectList";
import SimpleDataList from "../Components/SimpleDataList";
import Tooltip from "../Components/Tooltip";
import Button from "../Components/Button";
import { requestNewStatisticsList } from "../redux/reducers/processList";

const groupClass = " transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-200 dark:bg-slate-600";
const groupItemHeaderClass = " transition-colors duration-250 border-slate-400 dark:border-slate-800 bg-slate-400 dark:bg-slate-800 text-slate-900 dark:text-slate-350";
const groupItemClass = " transition-colors duration-250 border-slate-400 dark:border-slate-800";
const groupItemDescClass = " transition-colors duration-250 text-slate-900 dark:text-slate-300";

function SettingsPage() {
  const dispatch = useDispatch();
  const appSettings = useSelector(({ electron }) => electron.settings);
  const groups = useSelector(({ simpleDataList }) => simpleDataList?.groups);
  
  const isRecording = useSelector(({ electron }) => electron.settings.appRecordingProcesses);
  
  const group1 = useRef();
  const group2 = useRef();
  
  const [languages, setLanguages] = useState([]);
  
  const [newGroupButtonState, setNewGroupButtonState] = useState(false);
  const [newRuleButtonState, setNewRuleButtonState] = useState(false);
  
  const [rulesShouldUpdate, setRulesShouldUpdate] = useState(false);
  
  useEffect(() => {
    getLangList((langList) => {
      let _languages = [];
      
      for (const language of langList) {
        _languages.push({ name: <I18N index={`general_lang_text_${language.value.toLowerCase()}`} text={language.value} />, value: language.index });
      }
      _languages.splice(1, 0, { name: ">--------------------<", disabled: true });
      
      setLanguages(_languages);
    });
  }, []);
  
  const discordGroupItems = [
    {
      name: "discordShowPresence",
      type: "checkbox",
      label: <I18N index="general_text_discord_show_presence" text="Show Discord Presence" />
    },
    {
      name: "discordIcon",
      type: "selectIcon",
      label: <I18N index="general_text_discord_icon" text="Discord Presence Icon" />,
      options: discordIcons,
      required: true,
      requires: ['discordShowPresence']
    },
    {
      name: "discordNiceName",
      type: "input",
      label: <I18N index="general_text_discord_nice_name" text="Discord Presence Title" />,
      required: true,
      requires: ['discordShowPresence']
    }
  ];
  const discordRuleItems = [
    {
      name: "discordShowPresence",
      type: "checkbox",
      label: <I18N index="general_text_discord_show_presence" text="Show Discord Presence" />,
      requires: ['group_id', 'type', 'rule']
    },
    {
      name: "discordNiceName",
      type: "input",
      label: <I18N index="general_text_discord_nice_name" text="Discord Presence Title" />,
      required: true,
      requires: ['discordShowPresence']
    }
  ];
  
  return (
    <div className="flex flex-col p-4">
      <div className={`flex flex-col mb-4 border-2 rounded-lg${groupClass}`}>
        <h2 className={`px-2 py-1 mb-2 text-center text-2xl font-bold border-b-2${groupItemHeaderClass}`}>
          <I18N index="settings_heading_general_group" text="General" />
        </h2>
        {appSettings.appAutoStart !== null ? (
          <div className={`flex px-2 mb-2 pb-2 gap-4 items-center border-b-2${groupItemClass}`}>
            <div className={`text-right w-full${groupItemDescClass}`}>
              <I18N index="settings_label_auto_start" text="App Start On Boot" />
            </div>
            <div className="text-left w-full">
              <Switch checked={appSettings.appAutoStart} onChange={() => dispatch(toggleAppSetting("appAutoStart"))} className={`${appSettings.appAutoStart ? 'bg-green-300' : 'bg-red-300'} relative inline-flex items-center h-6 rounded-full w-12`}>
                <span className="sr-only">{appSettings.appAutoStart ? <I18N index="settings_disable_auto_start" text="Disable auto start" noDev={true} /> : <I18N index="settings_enable_auto_start" text="Enable auto start" noDev={true} />}</span>
                <span className={`${appSettings.appAutoStart ? 'translate-x-7 bg-green-600' : 'translate-x-1 bg-red-600'} inline-block w-4 h-4 transform transition rounded-full`} aria-hidden="true" />
              </Switch>
            </div>
          </div>
        ) : null}
        <div className={`flex px-2 mb-2 pb-2 gap-4 items-center border-b-2${groupItemClass}`}>
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_language" text="Language" />
          </div>
          <div className="text-left w-full">
            <SelectList items={languages} selected={appSettings.appLang} onChoose={(choice) => dispatch(setAppSetting({setting: "appLang", value: choice}))} />
          </div>
        </div>
        <div className={`flex px-2 mb-2 pb-2 gap-4 items-center border-b-2${groupItemClass}`}>
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_theme" text="Theme" />
          </div>
          <div className="text-left w-full">
            <SelectList items={[
              { name: <I18N index="general_theme_text_system" text="System" />, value: 'sys' },
              { name: <I18N index="general_theme_text_light" text="Light" />, value: 'light' },
              { name: <I18N index="general_theme_text_dark" text="Dark" />, value: 'dark' }
            ]} selected={appSettings.appTheme} onChoose={(choice) => dispatch(setAppSetting({setting: "appTheme", value: choice}))} />
          </div>
        </div>
        <div className="flex px-2 mb-2 gap-4 items-center">
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_allow_internet" text="Allow Internet connectivity" />
          </div>
          <div className="text-left w-full">
            <Switch checked={appSettings.appAllowInternetConnectivity} onChange={() => dispatch(toggleAppSetting("appAllowInternetConnectivity"))} className={`${appSettings.appAllowInternetConnectivity ? 'bg-green-300' : 'bg-red-300'} relative inline-flex items-center h-6 rounded-full w-12`}>
              <span className="sr-only">{appSettings.appAllowInternetConnectivity ? <I18N index="settings_disable_internet_modules" text="Disable internet modules" noDev={true} /> : <I18N index="settings_enable_internet_modules" text="Enable internet modules" noDev={true} />}</span>
              <span className={`${appSettings.appAllowInternetConnectivity ? 'translate-x-7 bg-green-600' : 'translate-x-1 bg-red-600'} inline-block w-4 h-4 transform transition rounded-full`} aria-hidden="true" />
            </Switch>
          </div>
        </div>
      </div>
      <div className={`flex flex-col mb-4 border-2 rounded-lg${groupClass}`}>
        <h2 className={`px-2 py-1 mb-2 text-center text-2xl font-bold border-b-2${groupItemHeaderClass}`}>
          <I18N index="settings_heading_process_list_group" text="Process List" />
        </h2>
        <div className={`flex px-2 mb-2 pb-2 gap-4 items-center border-b-2${groupItemClass}`}>
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_initial_read_delay" text="Initial Read Delay" />
          </div>
          <div className="text-left w-full">
            <div className="inline-flex">
              <input
                type="number" min={0} max={60} step={0.001} value={appSettings.appProcessListInitial}
                onChange={(e) => dispatch(setAppSetting({setting: "appProcessListInitial", value: e.target.value}))}
                className="border-1 border-slate-500 rounded-l-lg pl-2 w-21"
              />
              <div className="border-1 border-l-0 border-slate-500 rounded-r-lg px-2 bg-slate-300 w-6">
                <I18N index="general_time_unit_seconds" text="s" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex px-2 mb-2 gap-4 items-center">
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_recurring_read_delay" text="Recurring Read Delay" />
          </div>
          <div className="text-left w-full">
            <div className="inline-flex">
              <input
                type="number" min={0} max={60} step={0.001} value={appSettings.appProcessListRecurring}
                onChange={(e) => dispatch(setAppSetting({setting: "appProcessListRecurring", value: e.target.value}))}
                className="border-1 border-slate-500 rounded-l-lg pl-2 w-21"
              />
              <div className="border-1 border-l-0 border-slate-500 rounded-r-lg px-2 bg-slate-300 w-6">
                <I18N index="general_time_unit_seconds" text="s" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex flex-col mb-4 border-2 rounded-lg${groupClass}`}>
        <h2 className={`px-2 py-1 mb-2 text-center text-2xl font-bold border-b-2${groupItemHeaderClass}`}>
          <I18N index="settings_heading_statistics_group" text="Statistics" />
        </h2>
        <div className={`flex px-2 mb-2 pb-2 gap-4 items-center border-b-2${groupItemClass}`}>
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_latest_title_count" text="Latest Title Count" />
          </div>
          <div className="text-left w-full">
            <div className="inline-flex">
              <input
                type="number" min={0} max={100} step={1} value={appSettings.appStatisticsLatestTitleCount}
                onChange={(e) => dispatch(setAppSetting({setting: "appStatisticsLatestTitleCount", value: e.target.value}))}
                className="border-1 border-slate-500 rounded-lg pl-2 w-27"
              />
            </div>
          </div>
        </div>
        <div className={`flex px-2 mb-2 pb-2 gap-4 items-center border-b-2${groupItemClass}`}>
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_show_elapsed_days" text="Show elapsed time days" />
          </div>
          <div className="text-left w-full">
            <Switch checked={appSettings.appStatisticsShowElapsedDays} onChange={() => dispatch(toggleAppSetting("appStatisticsShowElapsedDays"))} className={`${appSettings.appStatisticsShowElapsedDays ? 'bg-green-300' : 'bg-red-300'} relative inline-flex items-center h-6 rounded-full w-12`}>
              <span className="sr-only">{appSettings.appStatisticsShowElapsedDays ? <I18N index="settings_disable" text="Disable" noDev={true} /> : <I18N index="settings_enable" text="Enable" noDev={true} />}</span>
              <span className={`${appSettings.appStatisticsShowElapsedDays ? 'translate-x-7 bg-green-600' : 'translate-x-1 bg-red-600'} inline-block w-4 h-4 transform transition rounded-full`} aria-hidden="true" />
            </Switch>
          </div>
        </div>
        <div className="flex px-2 mb-2 gap-4 items-center">
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_collapsed_group_by_default" text="Groups are collapsed by default" />
          </div>
          <div className="text-left w-full">
            <Switch checked={appSettings.appStatisticsCollapsedGroupsByDefault} onChange={() => dispatch(toggleAppSetting("appStatisticsCollapsedGroupsByDefault"))} className={`${appSettings.appStatisticsCollapsedGroupsByDefault ? 'bg-green-300' : 'bg-red-300'} relative inline-flex items-center h-6 rounded-full w-12`}>
              <span className="sr-only">{appSettings.appStatisticsCollapsedGroupsByDefault ? <I18N index="settings_disable" text="Disable" noDev={true} /> : <I18N index="settings_enable" text="Enable" noDev={true} />}</span>
              <span className={`${appSettings.appStatisticsCollapsedGroupsByDefault ? 'translate-x-7 bg-green-600' : 'translate-x-1 bg-red-600'} inline-block w-4 h-4 transform transition rounded-full`} aria-hidden="true" />
            </Switch>
          </div>
        </div>
      </div>
      <div className={`flex flex-col mb-4 border-2 rounded-lg${groupClass}`}>
        <h2 className={`px-2 py-1 mb-2 text-center text-2xl font-bold border-b-2${groupItemHeaderClass}`}>
          <I18N index="settings_heading_log_group" text="Logs" />
        </h2>
        <div className="flex px-2 mb-2 gap-4 items-center">
          <div className={`text-right w-full${groupItemDescClass}`}>
            <I18N index="settings_label_log_retention" text="Log Retention Period" />
          </div>
          <div className="text-left w-full">
            <div className="inline-flex">
              <input
                type="number" min={1} max={365} step={1} value={appSettings.appLogRetentionDays}
                onChange={(e) => dispatch(setAppSetting({setting: "appLogRetentionDays", value: e.target.value}))}
                className="border-1 border-slate-500 rounded-l-lg pl-2 w-21"
              />
              <div className="border-1 border-l-0 border-slate-500 rounded-r-lg px-2 bg-slate-300 w-6">
                <I18N index="general_time_unit_days" text="days" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {appSettings.appAllowInternetConnectivity && appSettings.appDiscordPossible ? (
        <div className={`flex flex-col mb-4 border-2 rounded-lg${groupClass}`}>
          <h2 className={`px-2 py-1 mb-2 text-center text-2xl font-bold border-b-2${groupItemHeaderClass}`}>
            <I18N index="settings_heading_discord" text="Discord" />
          </h2>
          <div className={`flex px-2 mb-2 gap-4 items-center${groupItemClass}`}>
            <div className={`text-right w-full${groupItemDescClass}`}>
              <I18N index="settings_label_discord_rich_presence" text="Rich Presence" />
            </div>
            <div className="text-left w-full">
              <Switch checked={appSettings.appDiscordEnabled} onChange={() => dispatch(toggleAppSetting("appDiscordEnabled"))} className={`${appSettings.appDiscordEnabled ? 'bg-green-300' : 'bg-red-300'} relative inline-flex items-center h-6 rounded-full w-12`}>
                <span className="sr-only">{appSettings.appDiscordEnabled ? <I18N index="settings_disable_discord_rich_presence" text="Disable rich presence" noDev={true} /> : <I18N index="settings_enable_discord_rich_presence" text="Enable rich presence" noDev={true} />}</span>
                <span className={`${appSettings.appDiscordEnabled ? 'translate-x-7 bg-green-600' : 'translate-x-1 bg-red-600'} inline-block w-4 h-4 transform transition rounded-full`} aria-hidden="true" />
              </Switch>
            </div>
          </div>
        </div>
      ) : null}
      <div ref={group1} className={`flex flex-col mb-4 border-2 rounded-lg${groupClass}${appSettings.appRecordingProcesses ? ' relative' : ''}`}>
        <div className={`flex px-10 py-1 relative justify-center border-b-2${groupItemHeaderClass}`}>
          <h2 className="justify-middle text-2xl font-bold">
            <I18N index="settings_heading_process_tracking_groups_group" text="Process Tracking Groups" />
          </h2>
          <div className="absolute flex self-center justify-middle right-1">
            <Tooltip
              id={`tooltip_group1`}
              placement="rightTop"
              noTextWrap={true}
              content={(
                <h2 className="font-bold text-slate-900">
                  <I18N index="general_text_new_x" text="New %s" replace={{"%s": <I18N index="general_text_group" text="Group" lowerCase={true} />}} />
                </h2>
              )}
            >
              {/* NOTE im pretty sure this can be done differently with refs, but have no ideas on how to implement that... */}
              <Button onClick={() => setNewGroupButtonState(true)} className="w-[32px] h-[32px] transition-colors duration-250">
                <span className="sr-only"><I18N index="general_text_new_x" replace={{"%s": <I18N index="general_text_group" lowerCase={true} noDev={true} />}} noDev={true} /></span>
                <FaPlus className="block w-[24px] h-[24px]" aria-hidden="true" />
              </Button>
            </Tooltip>
          </div>
        </div>
        <SimpleDataList
          type="Groups"
          items={[
            {
              name: "name",
              type: "input",
              label: <I18N index="general_text_group_name" text="Group name" />,
              required: true
            }
          ].concat(appSettings.appAllowInternetConnectivity && appSettings.appDiscordEnabled ? discordGroupItems : [])}
          nameKey="name"
          visibleData={appSettings.appAllowInternetConnectivity && appSettings.appDiscordEnabled ? [
            { key: "discordIcon", type: "icon", icons: discordIcons },
            { type: "group", group: [ { key: "name", type: "text" }, { key: "discordNiceName", type: "subtitle", i18n: {index: "general_text_discord_appears_as_x", text: "Appears on Discord as: %s"} } ] }
          ] : [
            { key: "name", type: "text" }
          ]}
          newButtonState={newGroupButtonState}
          onOpenNewModal={() => setNewGroupButtonState(false)}
          onDelete={() => {
            setRulesShouldUpdate(true);
            dispatch(requestNewStatisticsList());
          }}
          confirmMessages={{
            title: <I18N index="general_text_are_you_sure_you_want_to_remove_this_x" text="Are you sure you want to remove this %s?" replace={{"%s": <I18N index="general_text_group" lowerCase={true} />}} />,
            message: <I18N index="general_text_this_will_also_remove_associated_data" text="This action will also remove associated data!" />
          }}
        />
        <Transition
          as={React.Fragment}
          show={appSettings.appRecordingProcesses}
          enter="transition duration-250 ease-in"
          enterFrom="transform scale-90 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-200 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-90 opacity-0"
          beforeEnter={() => {
            group1.current.classList.add("relative");
          }}
          afterLeave={() => {
            group1.current.classList.remove("relative");
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-md rounded-lg">
            <h2 className="text-center text-2xl font-bold">
              <I18N index="general_text_setting_not_editable_while_recording" text="This Setting is not editable during process recording" />
            </h2>
          </div>
        </Transition>
      </div>
      <div ref={group2} className={`flex flex-col border-2 rounded-lg${groupClass}${appSettings.appRecordingProcesses ? ' relative' : ''}`}>
        <div className={`flex px-10 py-1 relative justify-center border-b-2${groupItemHeaderClass}`}>
          <h2 className="justify-middle text-2xl font-bold">
            <I18N index="settings_heading_process_tracking_rules_group" text="Process Tracking Rules" />
          </h2>
          <div className="absolute flex self-center justify-middle right-1">
            <Tooltip
              id={`tooltip_group2`}
              placement="rightTop"
              noTextWrap={true}
              content={(
                <h2 className="font-bold text-slate-900">
                  <I18N index="general_text_new_x" replace={{"%s": <I18N index="general_text_rule" text="Rule" lowerCase={true} />}} />
                </h2>
              )}
            >
              {/* NOTE im pretty sure this can be done differently with refs, but have no ideas on how to implement that... */}
              <Button onClick={() => setNewRuleButtonState(true)} className="w-[32px] h-[32px]">
                <span className="sr-only"><I18N index="general_text_new_x" replace={{"%s": <I18N index="general_text_rule" lowerCase={true} noDev={true} />}} noDev={true} /></span>
                <FaPlus className="block w-[24px] h-[24px]" aria-hidden="true" />
              </Button>
            </Tooltip>
          </div>
        </div>
        <SimpleDataList
          type="Rules"
          items={[
            {
              name: "group_id",
              type: "select",
              label: <I18N index="general_text_rule_group" text="Group" />,
              emptyTxt: <I18N index="general_text_select_x" text="Please select %s" replace={{"%s": <I18N index="general_text_group" text="Group" lowerCase={true} noDev={true} />}} noDev={true} />,
              options: groups,
              required: true,
              notMeta: true
            },
            {
              name: "type",
              type: "select",
              label: <I18N index="general_text_rule_type" text="Type" />,
              emptyTxt: <I18N index="general_text_select_x" replace={{"%s": <I18N index="general_text_rule_type" text="Rule Type" lowerCase={true} noDev={true} />}} noDev={true} />,
              options: {
                "exec": <I18N index="general_text_exec_rule_type" text="Executable" noDev={true} />,
                "rule": <I18N index="general_text_rule_rule_type" text="Regular expression" noDev={true} />
              },
              required: true,
              requires: ['group_id']
            },
            {
              name: "rule",
              type: "input",
              label: {
                "type": {
                  "exec": <I18N index="general_text_exec_exact_name" text="Exact Executable Name" />,
                  "rule": <I18N index="general_text_rule_regexp" text="Rule Regex" />
                }
              },
              required: true,
              requires: ['group_id', 'type']
            }
          ].concat(appSettings.appAllowInternetConnectivity && appSettings.appDiscordEnabled ? discordRuleItems : [])}
          nameKey="rule"
          visibleData={[
            { key: "type", type: "icon", icons: icons },
            { type: "group", group: [
              { key: "rule", type: "text" }, { key: "group_id", type: "subtitle", getter: groups, i18n: {index: "general_text_group_x", text: "Group: %s"} }
              ].concat(appSettings.appAllowInternetConnectivity && appSettings.appDiscordEnabled ? [{ key: "discordNiceName", type: "subtitle", i18n: {index: "general_text_discord_appears_as_x", text: "Appears on Discord as: %s"} }] : [])
            }
          ]}
          newButtonState={newRuleButtonState}
          onOpenNewModal={() => setNewRuleButtonState(false)}
          shouldUpdate={rulesShouldUpdate}
          onUpdate={() => setRulesShouldUpdate(false)}
          onDelete={() => dispatch(requestNewStatisticsList())}
          confirmMessages={{
            title: <I18N index="general_text_are_you_sure_you_want_to_remove_this_x" text="Are you sure you want to remove this %s?" replace={{"%s": <I18N index="general_text_rule" lowerCase={true} />}} />,
            message: <I18N index="general_text_this_will_also_remove_associated_data" text="This action will also remove associated data!" />
          }}
        />
        <Transition
          as={React.Fragment}
          show={appSettings.appRecordingProcesses}
          enter="transition duration-250 ease-in"
          enterFrom="transform scale-90 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-200 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-90 opacity-0"
          beforeEnter={() => {
            group2.current.classList.add("relative");
          }}
          afterLeave={() => {
            group2.current.classList.remove("relative");
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center backdrop-blur-md rounded-lg">
            <h2 className="text-center text-2xl font-bold">
              <I18N index="general_text_setting_not_editable_while_recording" text="This Setting is not editable during process recording" />
            </h2>
          </div>
        </Transition>
      </div>
    </div>
  );
}

export default SettingsPage;