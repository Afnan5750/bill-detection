import React from "react";

const Navbar = ({ handleLogout }) => {
  return (
    <nav
      className="navbar"
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
        background: "linear-gradient(90deg, #800000, #a00000)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      <div style={{ color: "#fff", fontWeight: "700", fontSize: "1.2rem" }}>
        Power Information Technology Company
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "white",
            color: "#800000",
            border: "none",
            borderRadius: "25px",
            padding: "0.35rem 0.9rem",
            fontWeight: "600",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#800000";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "#800000";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
