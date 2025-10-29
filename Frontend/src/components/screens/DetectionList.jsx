import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaEdit, FaSearch } from "react-icons/fa";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DetectionList = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/signin";
    }
  };

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/detectionList");
        setDetections(res.data.data);
      } catch (err) {
        console.error("Error fetching detection data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetections();
  }, []);

  const columns = [
    {
      name: "Ref No",
      selector: (row) => row.refno,
      sortable: true,
      width: "12vw",
    },
    {
      name: "Consumer Name",
      selector: (row) => row.cons_name,
      sortable: true,
      width: "14vw",
    },
    {
      name: "Sanction Load",
      selector: (row) => row.sanction_load,
      width: "8vw",
    },
    {
      name: "Connected Load",
      selector: (row) => row.connected_load,
      width: "8vw",
    },
    {
      name: "Charging Period Days",
      selector: (row) => row.charging_prd_days,
      width: "9vw",
    },
    {
      name: "Units Assessed",
      selector: (row) => row.units_assessed,
      width: "8vw",
    },
    {
      name: "Units Already Charged",
      selector: (row) => row.units_already_charged,
      width: "9vw",
    },
    {
      name: "Units Chargeable",
      selector: (row) => row.units_chargeable,
      width: "8vw",
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className="btn btn-sm btn-outline-primary"
          title="Edit"
          onClick={() => navigate(`/detection/${row.id}`)}
        >
          <FaEdit />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "6vw",
    },
  ];

  const filteredDetections = detections.filter(
    (item) =>
      (item.cons_name &&
        item.cons_name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.refno &&
        item.refno.toString().toLowerCase().includes(filterText.toLowerCase()))
  );

  const customStyles = {
    table: { style: { borderRadius: "10px", overflow: "hidden" } },
    headCells: {
      style: {
        backgroundColor: "#800000",
        color: "#fff",
        fontWeight: "600",
        fontSize: "14px",
        textTransform: "uppercase",
        padding: "8px",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        "&:nth-of-type(odd)": { backgroundColor: "#f8f9fa" },
        "&:hover": { backgroundColor: "#e3f2fd" },
        whiteSpace: "normal",
        wordBreak: "break-word",
        paddingTop: "6px",
        paddingBottom: "6px",
      },
    },
    cells: {
      style: { whiteSpace: "normal", wordBreak: "break-word", padding: "8px" },
    },
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "225px", width: "100%" }}>
        <Navbar handleLogout={handleLogout} />

        <div style={{ marginTop: "75px" }}>
          {loading && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 2000,
              }}
            >
              <div
                className="spinner-border text-primary mb-3"
                style={{ width: "4rem", height: "4rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "1.2rem",
                  textAlign: "center",
                }}
              >
                Fetching Detection Records...
              </div>
            </div>
          )}

          <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: "1.5rem",
                  color: "#800000",
                }}
              >
                Detection List
              </div>

              <div style={{ maxWidth: "300px", marginRight: "20px" }}>
                <div className="input-group" style={{ maxWidth: "300px" }}>
                  <span
                    className="input-group-text bg-white"
                    style={{
                      borderTopLeftRadius: "50px",
                      borderBottomLeftRadius: "50px",
                      borderRight: "none",
                    }}
                  >
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Consumer Name or Ref No"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                      borderLeft: "none",
                      borderTopRightRadius: "50px",
                      borderBottomRightRadius: "50px",
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="card-body"
              style={{ height: "600px", overflowY: "auto" }}
            >
              <DataTable
                columns={columns}
                data={filteredDetections}
                progressPending={loading}
                pagination
                highlightOnHover
                pointerOnHover
                responsive
                fixedHeader
                fixedHeaderScrollHeight="500px"
                customStyles={customStyles}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionList;
