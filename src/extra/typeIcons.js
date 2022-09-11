import React from "react";
import { VscFileBinary, VscRegex } from "react-icons/vsc";
import { FaBriefcase, FaFilm, FaGamepad, FaMicrochip, FaMusic } from "react-icons/fa";

const icons = {
  "rule": <VscRegex className="w-full h-full" aria-hidden="true" />,
  "exec": <VscFileBinary className="w-full h-full" aria-hidden="true" />
};

export const discordIcons = {
  "apptrakr_chip":  <FaMicrochip className="w-full h-full" aria-hidden="true" />,
  "apptrakr_game":  <FaGamepad className="w-full h-full" aria-hidden="true" />,
  "apptrakr_movie": <FaFilm className="w-full h-full" aria-hidden="true" />,
  "apptrakr_music": <FaMusic className="w-full h-full" aria-hidden="true" />,
  "apptrakr_work":  <FaBriefcase className="w-full h-full" aria-hidden="true" />
};

export const getIcon = (type) => {
  return icons[type];
}

export const getDiscordIcon = (type) => {
  return discordIcons[type];
}

export default icons;