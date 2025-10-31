import React, { useState } from "react";
import logo from "../../assets/logo-pitc.png";
import { red } from "@mui/material/colors";

const Navbar = ({ handleLogout }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmLogout = () => setShowConfirm(true);
  const handleConfirm = () => {
    setShowConfirm(false);
    handleLogout();
  };
  const handleCancel = () => setShowConfirm(false);

  return (
    <>
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
            style={{
              width: "250px",
              height: "50px",
              objectFit: "contain",
              borderRadius: "6px",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={confirmLogout}
            style={{
              backgroundColor: "#800000",
              color: "#fff",
              border: "none",
              borderRadius: "25px",
              padding: "0.35rem 0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#a00000")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#800000")
            }
          >
            Logout
          </button>
        </div>
      </nav>

      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "1.5rem 2rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              textAlign: "center",
              width: "320px",
            }}
          >
            <h5 style={{ color: "#800000", fontWeight: 600 }}>
              Confirm Logout
            </h5>
            <p className="mb-4">Are you sure you want to logout?</p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
            >
              <button
                onClick={handleCancel}
                style={{
                  backgroundColor: "#e2e8f0",
                  color: "#475569",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.4rem 1rem",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#cbd5e1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e2e8f0")
                }
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  backgroundColor: "#800000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.4rem 1rem",
                  cursor: "pointer",
                  transition: "0.3s",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#a00000")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#800000")
                }
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
