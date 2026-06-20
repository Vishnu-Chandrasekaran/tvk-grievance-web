import React from "react";
import logo from "../assets/TNLogo.png";
import { GoGlobe } from "react-icons/go";

const Header = () => {
  return (
    <div className="h-lg flex items-center justify-between  p-4 shadow-md">
      <img src={logo} alt="Logo" className="w-10 h-10" />
      <div className="flex items-center justify-center bg-[#F8ECEC] border-[#C89292] text-[#674242] border-2 rounded-lg px-4 py-1 gap-2">
        <GoGlobe />
        <p className="text-sm">English</p>
      </div>
    </div>
  );
};

export default Header;
