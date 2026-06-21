import React, { useContext, useState } from "react";
import logo from "../assets/TNLogo.png";
import { GoGlobe } from "react-icons/go";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const Header = () => {
  // Guarded with `|| {}` so Header never crashes even if it's ever
  // rendered outside an AuthProvider — it just hides the account menu.
  const { user, logout } = useContext(AuthContext) || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMenuOpen(false);
    if (logout) await logout();
    navigate("/");
  };

  return (
    <div className="h-lg flex items-center justify-between p-4 shadow-md relative">
      <img src={logo} alt="Logo" className="w-10 h-10" />

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center bg-[#F8ECEC] border-[#C89292] text-[#674242] border-2 rounded-lg px-4 py-1 gap-2">
          <GoGlobe />
          <p className="text-sm">English</p>
        </div>

        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F8ECEC] border-2 border-[#C89292] text-[#674242]"
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              <FiUser />
            </button>

            {menuOpen && (
              <>
                {/* click-away catcher */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <p className="px-4 pt-1 text-xs text-gray-500">Logged in as</p>
                  <p className="px-4 pb-2 text-sm font-medium text-[#425867] truncate">
                    {user.phoneNumber || "Unknown number"}
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#7B0200] hover:bg-gray-50"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
