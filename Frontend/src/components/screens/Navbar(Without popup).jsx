import React, { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo-pitc.png";
import { MdAccountCircle } from "react-icons/md";

const Navbar = ({ handleLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Get user from localStorage
  const loggedInUser = JSON.parse(localStorage.getItem("userData")) || {};

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout directly
  const handleLogoutClick = () => {
    localStorage.removeItem("userData");
    handleLogout();
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "65px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1.5rem",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e6e8ec",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: "250px", height: "50px", objectFit: "contain" }}
        />
      </div>

      {/* Profile Dropdown */}
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <MdAccountCircle
          size={32}
          style={{ cursor: "pointer", color: "#212529" }}
          onClick={() => setShowDropdown(!showDropdown)}
        />

        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: 0,
              width: "220px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              padding: "1rem",
              zIndex: 2000,
            }}
          >
            <div style={{ marginBottom: "1rem", textAlign: "center" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>
                {loggedInUser.user_name || "Unknown Name"}
              </p>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
                User ID: {loggedInUser.user_id || "-"}
              </p>
            </div>
            <button
              onClick={handleLogoutClick}
              style={{
                width: "100%",
                backgroundColor: "#212529",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.4rem 0",
                cursor: "pointer",
                fontWeight: 600,
                transition: "0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#343a40")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#212529")
              }
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
