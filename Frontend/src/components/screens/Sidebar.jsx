import React from "react";
import { NavLink } from "react-router-dom";
import { MdAssignment, MdList } from "react-icons/md";

const Sidebar = () => {
  const style = {
    sidebar: {
      width: "220px",
      height: "100vh",
      position: "fixed",
      top: "65px",
      left: 0,
      backgroundColor: "#800000",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      color: "#fff",
      zIndex: 999,
    },
    heading: {
      marginBottom: "1.5rem",
      fontWeight: 700,
    },
    list: {
      listStyle: "none",
      padding: 0,
    },
    listItem: {
      marginBottom: "1rem",
    },
    link: (isActive) => ({
      display: "block",
      padding: "0.5rem 1rem",
      borderRadius: "50px",
      textDecoration: "none",
      color: "#fff",
      fontWeight: isActive ? 700 : 500,
      backgroundColor: isActive ? "#a00000" : "transparent",
      transition: "0.3s",
    }),
  };

  return (
    <div style={style.sidebar}>
      {/* <h4 style={style.heading}>Dashboard</h4> */}
      <ul style={style.list}>
        <li style={style.listItem}>
          <NavLink
            to="/detection"
            style={({ isActive }) => style.link(isActive)}
          >
            <MdAssignment style={{ marginRight: "8px", fontSize: "1.2rem" }} />
            Detection Form
          </NavLink>
        </li>
        <li style={style.listItem}>
          <NavLink
            to="/detection-list"
            style={({ isActive }) => style.link(isActive)}
          >
            <MdList style={{ marginRight: "8px", fontSize: "1.2rem" }} />
            Detection List
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
