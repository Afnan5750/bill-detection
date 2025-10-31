import React from "react";
import { NavLink } from "react-router-dom";
import { MdAssignment, MdList, MdLogout } from "react-icons/md";

const Sidebar = () => {
  const style = {
    sidebar: {
      width: "220px",
      height: "100vh",
      position: "fixed",
      top: "65px",
      left: 0,
      backgroundColor: "#ffffff",
      padding: "1.5rem 1rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderRight: "1px solid #e5e7eb",
      zIndex: 999,
    },
    list: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      flexGrow: 1,
    },
    listItem: {
      marginBottom: "0.3rem",
    },
    link: (isActive) => ({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "0.6rem 0.9rem",
      borderRadius: "10px",
      textDecoration: "none",
      fontSize: "0.95rem",
      color: isActive ? "#212529" : "#6b7280",
      backgroundColor: isActive ? "#f3f4f6" : "transparent",
      fontWeight: isActive ? 600 : 500,
      transition: "all 0.25s ease",
    }),
    bottom: {
      marginTop: "auto",
    },
    bottomLink: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "0.6rem 0.9rem",
      color: "#6b7280",
      cursor: "pointer",
      borderRadius: "10px",
      fontWeight: 500,
      transition: "all 0.3s ease",
    },
  };

  return (
    <div style={style.sidebar}>
      <ul style={style.list}>
        <li style={style.listItem}>
          <NavLink
            to="/detection"
            style={({ isActive }) => style.link(isActive)}
          >
            <MdAssignment style={{ fontSize: "1.3rem" }} />
            Detection Form
          </NavLink>
        </li>
        <li style={style.listItem}>
          <NavLink
            to="/detection-list"
            style={({ isActive }) => style.link(isActive)}
          >
            <MdList style={{ fontSize: "1.3rem" }} />
            Detection List
          </NavLink>
        </li>
      </ul>

      <div style={style.bottom}>
        <div
          style={style.bottomLink}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(128,0,0,0.08)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <MdLogout style={{ fontSize: "1.3rem" }} /> Log Out
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
