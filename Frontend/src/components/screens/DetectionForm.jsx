import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Modal, Button } from "react-bootstrap";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DetectionForm = () => {
  const [reasonList, setReasonList] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [refError, setRefError] = useState("");
  const [loading, setLoading] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("userData")) || {};
  const navigate = useNavigate();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [appliances, setAppliances] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loadFactor, setLoadFactor] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [previewImage, setPreviewImage] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/sigin";
  };
  const style = {
    container: {
      marginLeft: "225px",
      marginTop: "75px",
    },
    card: {
      padding: "2rem",
      borderRadius: "10px",
      backgroundColor: "#f8f9fa",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      position: "relative",
    },
    btnPrimary: {
      backgroundColor: "#212529",
      color: "#fff",
      fontWeight: "bold",
      border: "none",
      borderRadius: "50px",
      padding: "0.5rem 1.5rem",
      cursor: "pointer",
      transition: "0.3s",
    },
    heading: {
      textAlign: "center",
      fontWeight: "700",
      color: "#212529",
      marginBottom: "1.5rem",
    },
    spinnerOverlay: {
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
      backdropFilter: "blur(6px)",
      zIndex: 1050,
    },
  };

  const validationSchema = Yup.object({
    refNo: Yup.string()
      .length(14, "Reference No must be 14 digits")
      .required("Reference No is required"),

    loadType: Yup.string().required("Please select a load type"),

    connectedLoad: Yup.number()
      .typeError("Must be a number")
      .min(0, "Connected load cannot be negative")
      .when("loadType", {
        is: "Connected Load",
        then: (schema) => schema.required("Connected Load is required"),
        otherwise: (schema) => schema.nullable().optional(),
      }),

    sancLoad: Yup.number()
      .typeError("Must be a number")
      .min(0, "Sanction Load cannot be negative")
      .when("loadType", {
        is: "Sanc Load",
        then: (schema) => schema.required("Sanc. Load is required"),
        otherwise: (schema) => schema.nullable().optional(),
      }),

    runningLoad: Yup.number()
      .typeError("Must be a number")
      .min(0, "Running Load cannot be negative")
      .when("loadType", {
        is: "Running Load",
        then: (schema) => schema.required("Running Load is required"),
        otherwise: (schema) => schema.nullable().optional(),
      }),

    previousHistory: Yup.number()
      .typeError("Must be a number")
      .min(0, "Previous History cannot be negative")
      .when("loadType", {
        is: "Previous Histoy",
        then: (schema) => schema.required("Previous History is required"),
        otherwise: (schema) => schema.nullable().optional(),
      }),

    lumpSump: Yup.number()
      .typeError("Must be a number")
      .min(0, "Lump Sump cannot be negative")
      .when("loadType", {
        is: "Lump Sump",
        then: (schema) => schema.required("Lump Sump is required"),
        otherwise: (schema) => schema.nullable().optional(),
      }),

    mdi: Yup.number()
      .typeError("Must be a number")
      .min(0, "MDI cannot be negative")
      .when("loadType", {
        is: "MDI",
        then: (schema) => schema.required("MDI is required"),
        otherwise: (schema) => schema.nullable().optional(),
      }),

    charging_prd_days: Yup.number()
      .typeError("Must be a number")
      .min(1, "Charging period must be at least 1 month")
      .required("Charging Period is required"),

    totalUnitsChargeable: Yup.number()
      .typeError("Must be a number")
      .min(0, "Units cannot be negative")
      .required("Total Units Chargeable is required"),

    checkedBy: Yup.string().required("Checked By is required"),
    observation: Yup.string().required("Observation is required"),
    basisOfAssessment: Yup.string().required("Basis of Assessment is required"),
    noticeIssueNo: Yup.string().nullable().optional(),
    noticeDate: Yup.date().nullable().optional(),
    det_start_dt: Yup.date().required("Start date is required"),
    det_end_dt: Yup.date()
      .required("End date is required")
      .min(
        Yup.ref("det_start_dt"),
        "Select Observation Made before Detection Month"
      ),
  });

  const defectDurations = {
    Slowness: 2,
    "Defective Meter": 2,
    "Display Washed": 2,
    "Meter Fault": 2,
    "Holes in meter body": 3,
    "Meter glass broken": 3,
    "Meter sticking": 2,
    "Meter digits upset": 2,
    "Meter running reverse": 2,
    "CT / PT damaged": 2,
    "EPROM damaged": 2,
    "Neutral broken": 2,
    "Glass smoky/unable to read": 2,
    "Polarity changed": 2,
    "Shunt in meter": 2,
    "Chemical in meter": 2,
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/getReasonList")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "200") setReasonList(data.data);
      })
      .catch((err) => console.error("Error fetching reasons:", err));

    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/detection/${id}`)
        .then((res) => {
          if (res.data.detection) {
            const detection = res.data.detection;
            setBillHistory(
              res.data.billHistory.map((item) => ({
                month: item.b_month,
                reading: item.reading,
                units: item.units_charged,
                mdi: item.mdi,
              }))
            );
          }
        })
        .catch((err) => {
          console.error("Error fetching detection data:", err);
          setRefError("Error fetching detection data. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Navbar handleLogout={handleLogout} />
        <div style={style.container}>
          {loading && (
            <div style={style.spinnerOverlay}>
              <div
                className="spinner-border text-light mb-3"
                style={{ width: "5rem", height: "5rem" }}
              ></div>
              <div className="text-white fs-5 fw-semibold">
                {id ? "Fetching Detection Data..." : "Fetching Bill Info..."}
              </div>
            </div>
          )}

          <div style={style.card}>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                fontWeight: "700",
                fontSize: "1.5rem",
                color: "#212529",
              }}
            >
              {id ? "Edit Detection Bill" : "Proforma Detection Bill"}
            </div>

            <Formik
              initialValues={{
                refNo: "",
                consumerName: "",
                tariff: "",
                tariffCode: "",
                sanctionLoad: "",
                loadType: "Connected Load",
                connectedLoad: "",
                sancLoad: "",
                runningLoad: "",
                lumpSump: "",
                mdi: "",
                previousHistory: "",
                checkedBy: loggedInUser.user_id || "",
                observation: "",
                basisOfAssessment: "",
                det_start_dt: "",
                det_end_dt: "",
                charging_prd_days: "",
                b_month: "",
                totalUnitsChargeable: "",
                totalUnitsAlreadyCharged: "",
                unitsChargeable: "",
                noticeIssueNo: "",
                noticeDate: "",
                tempAppliance: "",
                tempQuantity: "",
                tempWatts: "",
                notice_checkbox: false,
              }}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={async (values, { resetForm }) => {
                let finalConnectedLoad = "";

                if (values.loadType === "Connected Load") {
                  finalConnectedLoad = values.connectedLoad;
                } else if (values.loadType === "Sanc Load") {
                  finalConnectedLoad = values.sancLoad;
                } else if (values.loadType === "Running Load") {
                  finalConnectedLoad = values.runningLoad;
                } else if (values.loadType === "Lump Sump") {
                  finalConnectedLoad = values.lumpSump;
                } else if (values.loadType === "Previous Histoy") {
                  finalConnectedLoad = values.previousHistory;
                } else if (values.loadType === "MDI") {
                  finalConnectedLoad = values.mdi;
                }

                const payload = {
                  refno: values.refNo,
                  cons_name: values.consumerName,
                  tariff: values.tariffCode,
                  sanction_load: values.sanctionLoad,
                  connected_load: finalConnectedLoad,
                  checked_by: values.checkedBy,
                  remarks: values.basisOfAssessment,
                  reason_id: values.observation,
                  charging_prd_days: values.charging_prd_days,
                  units_assessed: values.totalUnitsChargeable,
                  units_already_charged: values.totalUnitsAlreadyCharged,
                  units_chargeable: values.unitsChargeable,
                  det_notice_no: values.noticeIssueNo,
                  det_notice_dt: values.noticeDate,
                  b_month: values.b_month,
                  created_by: values.checkedBy,
                  approved_by: "admin",
                  modified_by: "admin",
                  det_start_dt: values.det_start_dt,
                  det_end_dt: values.det_end_dt,
                  notice_checkbox: values.notice_checkbox ? 1 : 0,
                  billHistory: billHistory.map((item) => ({
                    month: item.month,
                    reading: item.reading,
                    units: item.units,
                    mdi: item.mdi,
                  })),
                };

                try {
                  if (payload.det_start_dt) {
                    payload.det_start_dt = `${payload.det_start_dt}-01`;
                  }
                  if (payload.det_end_dt) {
                    payload.det_end_dt = `${payload.det_end_dt}-01`;
                  }
                  const url = id
                    ? `http://localhost:5000/api/update/${id}`
                    : "http://localhost:5000/api/submit";
                  const method = id ? "PUT" : "POST";

                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  const data = await res.json();

                  if (res.ok) {
                    toast.success(data.message, { autoClose: 2000 });

                    if (!id) {
                      resetForm();
                      setAppliances([]);
                    } else {
                      setTimeout(() => {
                        navigate("/detection-list");
                      }, 1000);
                    }
                  } else {
                    toast.error("Error storing form data: " + data.message, {
                      autoClose: 3000,
                    });
                  }
                } catch (err) {
                  console.error("Error submitting form:", err);
                  toast.error("Form submission failed", { autoClose: 3000 });
                }
              }}
            >
              {({ values, setFieldValue }) => {
                useEffect(() => {
                  if (id) {
                    axios
                      .get(`http://localhost:5000/api/detection/${id}`)
                      .then((res) => {
                        if (res.data.detection) {
                          const d = res.data.detection;

                          const toMonth = (date) =>
                            date ? date.slice(0, 7) : "";

                          const addOneDay = (dateStr) => {
                            if (!dateStr) return "";
                            const date = new Date(dateStr);
                            date.setDate(date.getDate() + 1);
                            return date.toISOString().slice(0, 10);
                          };

                          setFieldValue("refNo", d.refno || "");
                          setFieldValue("consumerName", d.cons_name || "");
                          setFieldValue("tariff", d.tariff || "");
                          setFieldValue("tariffCode", d.tariff || "");
                          setFieldValue("sanctionLoad", d.sanction_load || "");
                          setFieldValue(
                            "connectedLoad",
                            d.connected_load || ""
                          );
                          setFieldValue("checkedBy", d.checked_by || "");
                          setFieldValue("observation", d.reason_id || "");
                          setFieldValue("basisOfAssessment", d.remarks || "");

                          setFieldValue(
                            "det_start_dt",
                            toMonth(d.det_start_dt)
                          );
                          setFieldValue("det_end_dt", toMonth(d.det_end_dt));
                          setFieldValue(
                            "noticeDate",
                            addOneDay(d.det_notice_dt)
                          );
                          setFieldValue("b_month", addOneDay(d.b_month));

                          setFieldValue(
                            "charging_prd_days",
                            d.charging_prd_days || ""
                          );
                          setFieldValue(
                            "totalUnitsChargeable",
                            d.units_assessed || ""
                          );
                          setFieldValue(
                            "totalUnitsAlreadyCharged",
                            d.units_already_charged || ""
                          );
                          setFieldValue(
                            "unitsChargeable",
                            d.units_chargeable || ""
                          );
                          setFieldValue("noticeIssueNo", d.det_notice_no || "");
                          setFieldValue(
                            "notice_checkbox",
                            d.notice_checkbox == 1
                          );
                        }
                      })
                      .catch((err) => {
                        console.error("Error:", err);
                        setRefError("Failed to load data");
                      });
                  }
                }, [id, setFieldValue]);

                useEffect(() => {
                  if (!values.notice_checkbox) {
                    setFieldValue("noticeIssueNo", "");
                    setFieldValue("noticeImage", null);
                    setFieldValue("noticeDate", "");
                    setPreviewImage(null);
                  }
                }, [values.notice_checkbox, setFieldValue]);

                useEffect(() => {
                  setFieldValue("connectedLoad", "");
                  setFieldValue("lumpSump", "");
                  setFieldValue("mdi", "");
                  setAppliances([]);
                }, [values.loadType, setFieldValue]);

                useEffect(() => {
                  const ref = values.refNo.trim();

                  if (ref === "" || ref.length < 14) {
                    setFieldValue("consumerName", "");
                    setFieldValue("tariff", "");
                    setFieldValue("sanctionLoad", "");
                    setFieldValue("billMonth", "");
                    setBillHistory([]);
                    setRefError("");
                    return;
                  }

                  if (ref.length === 14 && !id) {
                    const fetchOnlineData = async () => {
                      setLoading(true);
                      try {
                        const billRes = await fetch(
                          "http://localhost:5000/api/billDetails",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ refNo: ref }),
                          }
                        );
                        const billData = await billRes.json();

                        if (billData && billData.basicInfo) {
                          setFieldValue(
                            "consumerName",
                            billData.basicInfo.consumerName?.trim() || ""
                          );
                          setFieldValue(
                            "tariff",
                            billData.basicInfo.tariffDescription?.trim() || ""
                          );
                          setFieldValue(
                            "tariffCode",
                            billData.basicInfo.tariffCode?.trim() || ""
                          );
                          setFieldValue(
                            "sanctionLoad",
                            billData.basicInfo.sactionLoad?.trim() || ""
                          );

                          if (billData.basicInfo.billMonth) {
                            const billDate =
                              billData.basicInfo.billMonth?.split("T")[0];
                            setFieldValue("b_month", billDate);
                          }

                          setRefError("");
                        } else {
                          setRefError("Reference number not found");
                        }

                        const histRes = await fetch(
                          "http://localhost:5000/api/billHistory",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ refNo: ref }),
                          }
                        );

                        const histData = await histRes.json();

                        if (
                          histRes.ok &&
                          Array.isArray(histData) &&
                          histData.length > 0
                        ) {
                          const formattedHistory = histData.map((item) => ({
                            month: item.BILL_MONTH || item.MONTH || "N/A",
                            reading: item.READING || item.READING || "0",
                            units: item.UNITS || item.UNITS_CHARGED || "0",
                            mdi: item.MDI || item.MDI || "0",
                          }));
                          setBillHistory(formattedHistory);
                        } else {
                          setBillHistory([]);
                        }
                      } catch (err) {
                        console.error("Fetch error:", err);
                        setRefError("Error fetching data. Please try again.");
                        setBillHistory([]);
                      } finally {
                        setLoading(false);
                      }
                    };

                    fetchOnlineData();
                  }
                }, [values.refNo, id]);

                useEffect(() => {
                  const start = values.det_start_dt
                    ? new Date(values.det_start_dt)
                    : null;
                  const end = values.det_end_dt
                    ? new Date(values.det_end_dt)
                    : null;

                  if (start && end) {
                    const months =
                      (end.getFullYear() - start.getFullYear()) * 12 +
                      (end.getMonth() - start.getMonth()) +
                      1;
                    setFieldValue("charging_prd_days", months);
                  } else {
                    setFieldValue("charging_prd_days", 0);
                  }
                }, [values.det_start_dt, values.det_end_dt, setFieldValue]);

                useEffect(() => {
                  const already =
                    parseFloat(values.totalUnitsAlreadyCharged) || 0;
                  const total = parseFloat(values.totalUnitsChargeable) || 0;
                  setFieldValue("unitsChargeable", total - already);
                }, [
                  values.totalUnitsAlreadyCharged,
                  values.totalUnitsChargeable,
                ]);

                useEffect(() => {
                  const fetchLoadFactor = async () => {
                    if (!values.tariffCode) {
                      setLoadFactor(null);
                      return;
                    }

                    try {
                      const res = await fetch(
                        `http://localhost:5000/api/getLoadFactor/${values.tariffCode}`
                      );
                      const data = await res.json();

                      if (res.ok && data.data?.load_factor) {
                        setLoadFactor(parseFloat(data.data.load_factor));
                      } else {
                        setLoadFactor(null);
                        toast.warn("Load factor not found for this tariff");
                      }
                    } catch (err) {
                      console.error("Error fetching load factor:", err);
                      setLoadFactor(null);
                    }
                  };

                  fetchLoadFactor();
                }, [values.tariffCode]);

                useEffect(() => {
                  let loadValue = 0;

                  if (values.loadType === "Connected Load") {
                    loadValue = parseFloat(values.connectedLoad) || 0;
                  } else if (values.loadType === "Lump Sump") {
                    loadValue = parseFloat(values.lumpSump) || 0;
                  } else if (values.loadType === "MDI") {
                    loadValue = parseFloat(values.mdi) || 0;
                  }

                  const days = parseFloat(values.charging_prd_days) || 0;

                  if (loadValue > 0 && loadFactor && days > 0) {
                    const totalUnits = loadValue * loadFactor * days * 730;
                    setFieldValue(
                      "totalUnitsChargeable",
                      Math.round(totalUnits)
                    );
                  } else {
                    setFieldValue("totalUnitsChargeable", "");
                  }
                }, [
                  values.loadType,
                  values.connectedLoad,
                  values.lumpSump,
                  values.mdi,
                  loadFactor,
                  values.charging_prd_days,
                  setFieldValue,
                ]);

                useEffect(() => {
                  const reasonId = values.observation;
                  const endDate = values.det_end_dt;

                  if (!reasonId || !endDate || !reasonList.length) {
                    return;
                  }

                  const selected = reasonList.find(
                    (r) => r.id === Number(reasonId)
                  );
                  if (!selected) return;

                  const reasonText = selected.det_reason.trim();
                  const apiMonths = selected.allowed_months;
                  const duration =
                    apiMonths && apiMonths > 0
                      ? apiMonths
                      : defectDurations[reasonText] || 0;

                  if (duration === 0) return;

                  const [endYear, endMonth] = endDate.split("-").map(Number);
                  const endMonthIndex = endMonth - 1;

                  let startMonthIndex = endMonthIndex - (duration - 1);
                  let startYear = endYear;

                  if (startMonthIndex < 0) {
                    startMonthIndex += 12;
                    startYear -= 1;
                  }

                  const format = (y, m) =>
                    `${y}-${String(m + 1).padStart(2, "0")}`;
                  const startDate = format(startYear, startMonthIndex);

                  setFieldValue("det_start_dt", startDate);
                }, [
                  values.observation,
                  values.det_end_dt,
                  reasonList,
                  setFieldValue,
                ]);

                useEffect(() => {
                  if (
                    !values.refNo ||
                    !values.det_start_dt ||
                    !values.det_end_dt
                  )
                    return;
                  if (values.det_start_dt === values.det_end_dt) return;

                  const fetchBillHistory = async () => {
                    try {
                      const res = await axios.post(
                        "http://localhost:5000/api/billHistory",
                        { refNo: values.refNo }
                      );
                      const data = res.data;

                      const monthNames = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];

                      const [startYear, startMonth] = values.det_start_dt
                        .split("-")
                        .map(Number);
                      const [endYear, endMonth] = values.det_end_dt
                        .split("-")
                        .map(Number);

                      const selectedBills = data.filter((item) => {
                        const [monthName, yearStr] = item.BILL_MONTH.split("-");
                        const year = parseInt(yearStr, 10);
                        const monthNum = monthNames.indexOf(monthName) + 1;

                        const isAfterStart =
                          year > startYear ||
                          (year === startYear && monthNum >= startMonth);
                        const isBeforeEnd =
                          year < endYear ||
                          (year === endYear && monthNum <= endMonth);

                        return isAfterStart && isBeforeEnd;
                      });

                      const totalUnits = selectedBills.reduce(
                        (sum, item) =>
                          sum + Number(item.UNITS_BILLED || item.UNITS || 0),
                        0
                      );

                      console.log(
                        "🧾 Selected bills:",
                        selectedBills.map((i) => i.BILL_MONTH)
                      );
                      console.log(
                        "⚡ Total Units for selected months:",
                        totalUnits
                      );

                      setFieldValue("totalUnitsAlreadyCharged", totalUnits);
                    } catch (error) {
                      console.error("❌ Error fetching bill history:", error);
                    }
                  };

                  fetchBillHistory();
                }, [
                  values.refNo,
                  values.det_start_dt,
                  values.det_end_dt,
                  setFieldValue,
                ]);

                return (
                  <>
                    <Form>
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Reference No: <span className="text-danger"> *</span>
                        </label>
                        <Field
                          name="refNo"
                          type="text"
                          className="form-control"
                          placeholder="Enter Reference No"
                          maxLength="14"
                        />
                        <ErrorMessage
                          name="refNo"
                          component="div"
                          className="text-danger small"
                        />
                        {refError && (
                          <div className="text-danger small">{refError}</div>
                        )}
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Name of Consumer:
                          </label>
                          <Field
                            name="consumerName"
                            className="form-control readonly-field"
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">Tariff:</label>
                          <Field
                            name="tariff"
                            className="form-control readonly-field"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Sanction Load (KW):
                          </label>
                          <Field
                            name="sanctionLoad"
                            className="form-control readonly-field"
                            readOnly
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold mb-2">
                            Select Load Type:{" "}
                            <span className="text-danger">*</span>
                          </label>

                          <Field
                            as="select"
                            name="loadType"
                            className="form-select mb-3"
                          >
                            <option value="Connected Load">
                              Connected Load
                            </option>
                            <option value="Sanc Load">Sanc. Load</option>
                            <option value="Running Load">Running Load</option>
                            <option value="Lump Sump">
                              Data Retrieval (Lump Sump)
                            </option>
                            <option value="Previous Histoy">
                              Previous Histoy
                            </option>
                            <option value="MDI">MDI Recorded</option>
                          </Field>

                          {/* Connected Load */}
                          {values.loadType === "Connected Load" && (
                            <>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label fw-bold mb-0">
                                  Connected Load (KWh):{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <button
                                  type="button"
                                  className="btn btn-sm"
                                  onClick={() => setShowModal(true)}
                                  style={{
                                    backgroundColor: "#212529",
                                    color: "#fff",
                                    borderColor: "#212529",
                                    width: "100px",
                                    borderRadius: "50px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Add
                                </button>
                              </div>

                              <Field
                                name="connectedLoad"
                                className="form-control readonly-field"
                                readOnly
                              />
                              <ErrorMessage
                                name="connectedLoad"
                                component="div"
                                className="text-danger small"
                              />
                            </>
                          )}

                          {/* Sanc. Load */}
                          {values.loadType === "Sanc Load" && (
                            <>
                              <label className="form-label fw-bold mb-1">
                                Sanc. Load:{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <Field name="sancLoad" className="form-control" />
                              <ErrorMessage
                                name="sancLoad"
                                component="div"
                                className="text-danger small"
                              />
                            </>
                          )}

                          {/* Running Load (NEW) */}
                          {values.loadType === "Running Load" && (
                            <>
                              <label className="form-label fw-bold mb-1">
                                Running Load:{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <Field
                                name="runningLoad"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="runningLoad"
                                component="div"
                                className="text-danger small"
                              />
                            </>
                          )}

                          {/* Lump Sump */}
                          {values.loadType === "Lump Sump" && (
                            <>
                              <label className="form-label fw-bold mb-1">
                                Lump Sump:{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <Field name="lumpSump" className="form-control" />
                              <ErrorMessage
                                name="lumpSump"
                                component="div"
                                className="text-danger small"
                              />
                            </>
                          )}

                          {/* Previous History */}
                          {values.loadType === "Previous Histoy" && (
                            <>
                              <label className="form-label fw-bold mb-1">
                                Previous History Units:{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <Field
                                name="previousHistory"
                                className="form-control"
                              />
                              <ErrorMessage
                                name="previousHistory"
                                component="div"
                                className="text-danger small"
                              />
                            </>
                          )}

                          {/* MDI */}
                          {values.loadType === "MDI" && (
                            <>
                              <label className="form-label fw-bold mb-1">
                                MDI: <span className="text-danger">*</span>
                              </label>
                              <Field name="mdi" className="form-control" />
                              <ErrorMessage
                                name="mdi"
                                component="div"
                                className="text-danger small"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Checked By:
                          </label>
                          <Field
                            name="checkedBy"
                            className="form-control readonly-field"
                            readOnly
                          />
                          <ErrorMessage
                            name="checkedBy"
                            component="div"
                            className="text-danger small"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Observation Made:
                            <span className="text-danger"> *</span>
                          </label>
                          <Field
                            as="select"
                            name="observation"
                            className="form-select"
                          >
                            <option value="">Select Observation</option>
                            {reasonList.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.det_reason} ({r.allowed_months} months)
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="observation"
                            component="div"
                            className="text-danger small"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Basis of Assessment:
                          <span className="text-danger"> *</span>
                        </label>
                        <Field
                          as="textarea"
                          name="basisOfAssessment"
                          rows="3"
                          className="form-control"
                          placeholder="Enter Basis of Assessment"
                        />
                        <ErrorMessage
                          name="basisOfAssessment"
                          component="div"
                          className="text-danger small"
                        />
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4" style={{ display: "none" }}>
                          <label className="form-label fw-bold">
                            Start Detection Month:
                            <span className="text-danger"> *</span>
                          </label>
                          <Field
                            name="det_start_dt"
                            type="month"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="det_start_dt"
                            component="div"
                            className="text-danger small"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            Detection Month:
                            <span className="text-danger"> *</span>
                          </label>
                          <Field
                            name="det_end_dt"
                            type="month"
                            className="form-control"
                            max={(() => {
                              const today = new Date();
                              let year = today.getFullYear();
                              let month = today.getMonth();
                              if (month === 0) {
                                year -= 1;
                                month = 12;
                              }
                              return `${year}-${String(month).padStart(
                                2,
                                "0"
                              )}`;
                            })()}
                          />

                          <ErrorMessage
                            name="det_end_dt"
                            component="div"
                            className="text-danger small"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            Bill Month:
                          </label>
                          <Field
                            name="b_month"
                            type="date"
                            className="form-control readonly-field"
                            readOnly
                          />
                          <ErrorMessage
                            name="b_month"
                            component="div"
                            className="text-danger small"
                          />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            Charging Period (Months):
                          </label>
                          <Field
                            name="charging_prd_days"
                            className="form-control readonly-field"
                            readOnly
                          />
                          {/* <ErrorMessage
                            name="charging_prd_days"
                            component="div"
                            className="text-danger small"
                          /> */}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            Total Units Chargeable:
                          </label>
                          <Field
                            name="totalUnitsChargeable"
                            type="number"
                            className="form-control readonly-field"
                            readOnly
                          />
                          {/* <ErrorMessage
                            name="totalUnitsChargeable"
                            component="div"
                            className="text-danger small"
                          /> */}

                          {loadFactor &&
                            ((values.loadType === "Connected Load" &&
                              values.connectedLoad) ||
                              (values.loadType === "Lump Sump" &&
                                values.lumpSump) ||
                              (values.loadType === "MDI" && values.mdi)) && (
                              <div className="mt-2 p-2 bg-light border rounded small">
                                <strong>Formula:</strong>
                                <br />
                                <code>
                                  {(() => {
                                    let load = 0;
                                    let label = "";
                                    if (values.loadType === "Connected Load") {
                                      load = values.connectedLoad;
                                      label = "Connected Load";
                                    } else if (
                                      values.loadType === "Lump Sump"
                                    ) {
                                      load = values.lumpSump;
                                      label = "Lump Sump";
                                    } else if (values.loadType === "MDI") {
                                      load = values.mdi;
                                      label = "MDI";
                                    }
                                    return (
                                      <>
                                        {load} ({label}) ×{" "}
                                        {Number(loadFactor).toFixed(2)} ×{" "}
                                        {values.charging_prd_days} × 730
                                        {" = "}
                                        <span className="text-primary fw-bold">
                                          {Math.round(
                                            load *
                                              loadFactor *
                                              values.charging_prd_days *
                                              730
                                          )}
                                        </span>
                                      </>
                                    );
                                  })()}
                                </code>
                                <br />
                                <small className="text-muted">
                                  Load (kW) × Load Factor × Months × 730
                                  hrs/month
                                </small>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Total Units Already Charged:
                          </label>
                          <Field
                            name="totalUnitsAlreadyCharged"
                            className="form-control readonly-field"
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Units To be Charged:
                          </label>
                          <Field
                            name="unitsChargeable"
                            className="form-control readonly-field"
                            readOnly
                          />
                          <ErrorMessage
                            name="unitsChargeable"
                            component="div"
                            className="text-danger small"
                          />
                        </div>
                      </div>

                      <div className="row align-items-center mb-3">
                        <div className="col-md-6 d-flex align-items-center gap-2">
                          <Field
                            type="checkbox"
                            name="notice_checkbox"
                            className="form-check-input"
                            id="showNotice"
                          />
                          <label
                            htmlFor="showNotice"
                            className="form-check-label fw-semibold mb-0"
                          >
                            Is Notice Issued?
                          </label>
                        </div>
                      </div>

                      {values.notice_checkbox && (
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label fw-bold mb-0">
                              Notice Date:{" "}
                            </label>
                            <Field
                              name="noticeDate"
                              type="date"
                              className="form-control"
                              max={today}
                            />
                            <ErrorMessage
                              name="noticeDate"
                              component="div"
                              className="text-danger small"
                            />
                          </div>
                          {/* Notice Issue No */}
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">
                              Notice Issue No:{" "}
                            </label>
                            <Field
                              name="noticeIssueNo"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="noticeIssueNo"
                              component="div"
                              className="text-danger small"
                            />
                          </div>

                          {/* Image Upload */}
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">
                              Upload Notice Image:{" "}
                            </label>
                            <input
                              type="file"
                              name="noticeImage"
                              className="form-control"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.currentTarget.files[0];
                                if (file) {
                                  setFieldValue("noticeImage", file);
                                  const reader = new FileReader();
                                  reader.onload = (ev) =>
                                    setPreviewImage(ev.target.result);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <ErrorMessage
                              name="noticeImage"
                              component="div"
                              className="text-danger small"
                            />
                            {previewImage && (
                              <div className="mt-2 text-center">
                                <img
                                  src={previewImage}
                                  alt="Preview"
                                  style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {billHistory.length > 0 && (
                        <>
                          <h4
                            className="text-center fw-bold mb-4"
                            style={{ color: "#212529", marginTop: "30px" }}
                          >
                            CONSUMPTION DATA
                          </h4>

                          <table className="table table-bordered mt-3 text-center">
                            <thead style={{ backgroundColor: "#afb0b3ff" }}>
                              <tr>
                                {Array.from({
                                  length: Math.ceil(billHistory.length / 12),
                                }).map((_, colIndex, arr) => (
                                  <React.Fragment key={`head-${colIndex}`}>
                                    <th
                                      style={{ backgroundColor: "#afb0b3ff" }}
                                    >
                                      Month/Year
                                    </th>
                                    <th
                                      style={{ backgroundColor: "#afb0b3ff" }}
                                    >
                                      Reading
                                    </th>
                                    <th
                                      style={{ backgroundColor: "#afb0b3ff" }}
                                    >
                                      Units Charged
                                    </th>
                                    <th
                                      style={{ backgroundColor: "#afb0b3ff" }}
                                    >
                                      MDI
                                    </th>
                                    {colIndex < arr.length - 1 && (
                                      <th className="bg-light"></th>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tr>
                            </thead>

                            <tbody>
                              {Array.from({ length: 12 }).map((_, rowIndex) => (
                                <tr key={`row-${rowIndex}`}>
                                  {Array.from({
                                    length: Math.ceil(billHistory.length / 12),
                                  }).map((_, colIndex, arr) => {
                                    const itemIndex = rowIndex + colIndex * 12;
                                    const item = billHistory[itemIndex];
                                    return (
                                      <React.Fragment
                                        key={`cell-${rowIndex}-${colIndex}`}
                                      >
                                        <td>{item?.month ?? ""}</td>
                                        <td>{item?.reading ?? ""}</td>
                                        <td>{item?.units ?? ""}</td>
                                        <td>{item?.mdi ?? ""}</td>
                                        {colIndex < arr.length - 1 && (
                                          <td className="bg-light"></td>
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}

                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="submit"
                          className="btn"
                          style={{
                            backgroundColor: "#212529",
                            color: "#fff",
                            borderColor: "#212529",
                            width: "250px",
                            borderRadius: "50px",
                            fontWeight: "600",
                          }}
                        >
                          {id ? "Update" : "Submit"}
                        </button>
                      </div>
                    </Form>

                    <Modal
                      show={showModal}
                      onHide={() => setShowModal(false)}
                      centered
                      size="lg"
                    >
                      <Modal.Header
                        closeButton
                        className="justify-content-center"
                      >
                        <Modal.Title
                          className="text-center w-100 fw-bold"
                          style={{ color: "#212529" }}
                        >
                          Connected Load Appliances
                        </Modal.Title>
                      </Modal.Header>

                      <Modal.Body>
                        <div className="row g-3 align-items-end mb-3">
                          <div className="col-md-4">
                            <label className="form-label fw-bold">
                              Appliance <span className="text-danger"> *</span>
                            </label>
                            <Field
                              as="select"
                              name="tempAppliance"
                              className="form-select"
                            >
                              <option value="">-- Select --</option>
                              <option value="Bulbs">Bulbs</option>
                              <option value="Fans">Fans</option>
                              <option value="AC">Air Conditioners</option>
                              <option value="Heater">Heaters/Irons</option>
                              <option value="WashingMachine">
                                Washing Machines
                              </option>
                              <option value="Refrigerator">
                                Refrigerators
                              </option>
                              <option value="LightPlug">Light Plugs</option>
                              <option value="PowerPlug">Power Plugs</option>
                              <option value="Motor">Motor</option>
                              <option value="Area">Area</option>
                            </Field>
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-bold">
                              Quantity<span className="text-danger"> *</span>
                            </label>
                            <Field
                              name="tempQuantity"
                              type="number"
                              className="form-control"
                              placeholder="0"
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-bold">
                              Watts<span className="text-danger"> *</span>
                            </label>
                            <Field
                              name="tempWatts"
                              type="number"
                              className="form-control"
                              placeholder="0"
                            />
                          </div>

                          <div className="col-md-2">
                            <Button
                              type="button"
                              size="sm"
                              style={{
                                backgroundColor: "#212529",
                                color: "#fff",
                                borderColor: "#212529",
                                width: "100px",
                                height: "40px",
                                borderRadius: "50px",
                                fontWeight: 600,
                              }}
                              onClick={() => {
                                const appliance = values.tempAppliance?.trim();
                                const quantity = Number(values.tempQuantity);
                                const watts = Number(values.tempWatts);

                                if (
                                  !appliance ||
                                  isNaN(quantity) ||
                                  quantity <= 0 ||
                                  isNaN(watts) ||
                                  watts <= 0
                                ) {
                                  toast.error(
                                    "Please fill all fields correctly"
                                  );
                                  return;
                                }

                                const totalWatts = quantity * watts;

                                if (editingIndex === null) {
                                  const newRow = {
                                    sr: appliances.length + 1,
                                    appliance,
                                    quantity,
                                    watts,
                                    totalWatts,
                                  };
                                  const updated = [...appliances, newRow];
                                  setAppliances(updated);

                                  const totalKWh = (
                                    updated.reduce(
                                      (s, r) => s + r.totalWatts,
                                      0
                                    ) / 1000
                                  ).toFixed(3);
                                  setFieldValue("connectedLoad", totalKWh);
                                } else {
                                  const updated = appliances.map((r, i) =>
                                    i === editingIndex
                                      ? {
                                          ...r,
                                          appliance,
                                          quantity,
                                          watts,
                                          totalWatts,
                                        }
                                      : r
                                  );
                                  const renumbered = updated.map((r, i) => ({
                                    ...r,
                                    sr: i + 1,
                                  }));
                                  setAppliances(renumbered);

                                  const totalKWh = (
                                    renumbered.reduce(
                                      (s, r) => s + r.totalWatts,
                                      0
                                    ) / 1000
                                  ).toFixed(3);
                                  setFieldValue("connectedLoad", totalKWh);

                                  setEditingIndex(null);
                                }

                                setFieldValue("tempAppliance", "");
                                setFieldValue("tempQuantity", "");
                                setFieldValue("tempWatts", "");
                              }}
                            >
                              {editingIndex === null ? "Add" : "Update"}
                            </Button>
                          </div>
                        </div>

                        <div className="table-responsive">
                          <table className="table table-sm table-bordered text-center align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>Sr.</th>
                                <th>Appliance</th>
                                <th>Quantity</th>
                                <th>Watts</th>
                                <th>Total Watts</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {appliances.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="text-muted">
                                    No appliances added
                                  </td>
                                </tr>
                              ) : (
                                appliances.map((row, idx) => (
                                  <tr key={idx}>
                                    <td>{row.sr}</td>
                                    <td>{row.appliance}</td>
                                    <td>{row.quantity}</td>
                                    <td>{row.watts}</td>
                                    <td>{row.totalWatts}</td>
                                    <td>
                                      <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-1"
                                        onClick={() => {
                                          setFieldValue(
                                            "tempAppliance",
                                            row.appliance
                                          );
                                          setFieldValue(
                                            "tempQuantity",
                                            row.quantity
                                          );
                                          setFieldValue("tempWatts", row.watts);
                                          setEditingIndex(idx);
                                        }}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                          const filtered = appliances.filter(
                                            (_, i) => i !== idx
                                          );
                                          const renumbered = filtered.map(
                                            (r, i) => ({ ...r, sr: i + 1 })
                                          );
                                          setAppliances(renumbered);

                                          const totalKWh = (
                                            renumbered.reduce(
                                              (s, r) => s + r.totalWatts,
                                              0
                                            ) / 1000
                                          ).toFixed(3);
                                          setFieldValue(
                                            "connectedLoad",
                                            totalKWh
                                          );
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                            {appliances.length > 0 && (
                              <tfoot className="fw-bold bg-light">
                                <tr>
                                  <td colSpan="4" className="text-end">
                                    Total Watts:
                                  </td>
                                  <td>
                                    {appliances.reduce(
                                      (s, r) => s + r.totalWatts,
                                      0
                                    )}{" "}
                                    W
                                  </td>
                                  <td></td>
                                </tr>
                                <tr>
                                  <td colSpan="4" className="text-end">
                                    Total kWh:
                                  </td>
                                  <td>
                                    {(
                                      appliances.reduce(
                                        (s, r) => s + r.totalWatts,
                                        0
                                      ) / 1000
                                    ).toFixed(3)}{" "}
                                    kWh
                                  </td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      </Modal.Body>
                    </Modal>
                  </>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DetectionForm;
