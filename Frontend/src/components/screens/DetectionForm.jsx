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

    connectedLoad: Yup.number()
      .typeError("Must be a number")
      .min(0, "Connected load cannot be negative")
      .required("Connected Load is required"),

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
    noticeIssueNo: Yup.string().required("Notice Issue No is required"),
    noticeDate: Yup.date().required("Notice Date is required"),
    det_start_dt: Yup.date().required("Start date is required"),
    det_end_dt: Yup.date()
      .required("End date is required")
      .min(Yup.ref("det_start_dt"), "End date must be after start date"),

    unitsChargeable: Yup.number().test(
      "non-negative",
      "Units Chargeable cannot be negative",
      (v) => v >= 0
    ),
  });

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
                units: item.units_charged,
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
                connectedLoad: "",
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
              }}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={async (values, { resetForm }) => {
                const payload = {
                  refno: values.refNo,
                  cons_name: values.consumerName,
                  tariff: values.tariffCode,
                  sanction_load: values.sanctionLoad,
                  connected_load: values.connectedLoad,
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
                  billHistory: billHistory.map((item) => ({
                    month: item.month,
                    units: item.units,
                  })),
                };

                try {
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
                          const detection = res.data.detection;
                          setFieldValue("refNo", detection.refno || "");
                          setFieldValue(
                            "consumerName",
                            detection.cons_name || ""
                          );
                          setFieldValue("tariff", detection.tariff || "");
                          setFieldValue("tariffCode", detection.tariff || "");
                          setFieldValue(
                            "sanctionLoad",
                            detection.sanction_load || ""
                          );
                          setFieldValue(
                            "connectedLoad",
                            detection.connected_load || ""
                          );
                          setFieldValue(
                            "checkedBy",
                            detection.checked_by || ""
                          );
                          setFieldValue(
                            "observation",
                            detection.reason_id || ""
                          );
                          setFieldValue(
                            "basisOfAssessment",
                            detection.remarks || ""
                          );
                          setFieldValue(
                            "det_start_dt",
                            detection.det_start_dt
                              ? new Date(
                                  detection.det_start_dt
                                ).toLocaleDateString("en-CA")
                              : ""
                          );
                          setFieldValue(
                            "det_end_dt",
                            detection.det_end_dt
                              ? new Date(
                                  detection.det_end_dt
                                ).toLocaleDateString("en-CA")
                              : ""
                          );
                          setFieldValue(
                            "charging_prd_days",
                            detection.charging_prd_days || ""
                          );
                          setFieldValue(
                            "totalUnitsChargeable",
                            detection.units_assessed || ""
                          );
                          setFieldValue(
                            "totalUnitsAlreadyCharged",
                            detection.units_already_charged || ""
                          );
                          setFieldValue(
                            "unitsChargeable",
                            detection.units_chargeable || ""
                          );
                          setFieldValue(
                            "noticeIssueNo",
                            detection.det_notice_no || ""
                          );
                          setFieldValue(
                            "noticeDate",
                            detection.det_notice_dt
                              ? new Date(
                                  detection.det_notice_dt
                                ).toLocaleDateString("en-CA")
                              : ""
                          );
                          setFieldValue(
                            "b_month",
                            detection.b_month
                              ? new Date(detection.b_month).toLocaleDateString(
                                  "en-CA"
                                )
                              : ""
                          );
                        }
                      })
                      .catch((err) => {
                        console.error("Error fetching detection data:", err);
                        setRefError("Error fetching detection data.");
                      });
                  }
                }, [id]);

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
                          setFieldValue(
                            "totalUnitsAlreadyCharged",
                            billData.basicInfo.totCurCons?.trim() || ""
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
                            units: item.UNITS || item.UNITS_CHARGED || "0",
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
                    let months =
                      (end.getFullYear() - start.getFullYear()) * 12 +
                      (end.getMonth() - start.getMonth());

                    setFieldValue("charging_prd_days", months);
                  } else {
                    setFieldValue("charging_prd_days", "");
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
                  const connected = parseFloat(values.connectedLoad) || 0;
                  const days = parseFloat(values.charging_prd_days) || 0;

                  if (connected > 0 && loadFactor && days > 0) {
                    const totalUnits = connected * loadFactor * days * 730;
                    setFieldValue(
                      "totalUnitsChargeable",
                      Math.round(totalUnits)
                    );
                  } else {
                    setFieldValue("totalUnitsChargeable", "");
                  }
                }, [
                  values.connectedLoad,
                  loadFactor,
                  values.charging_prd_days,
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
                            Sanction Load (KWh):
                          </label>
                          <Field
                            name="sanctionLoad"
                            className="form-control readonly-field"
                            readOnly
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label fw-bold mb-0">
                              Connected Load (KWh):
                              <span className="text-danger"> *</span>
                            </label>
                            <button
                              type="button"
                              className="btn btn-sm "
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
                        <div className="col-md-4">
                          <label className="form-label fw-bold">
                            Start Date:<span className="text-danger"> *</span>
                          </label>
                          <Field
                            name="det_start_dt"
                            type="date"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="det_start_dt"
                            component="div"
                            className="text-danger small"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-bold">
                            End Date:<span className="text-danger"> *</span>
                          </label>
                          <Field
                            name="det_end_dt"
                            type="date"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="det_end_dt"
                            component="div"
                            className="text-danger small"
                          />
                        </div>

                        <div className="col-md-4">
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
                            className="form-control"
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
                            className="form-control"
                            readOnly
                            style={{ backgroundColor: "#f0f0f0" }}
                          />
                          {/* <ErrorMessage
                            name="totalUnitsChargeable"
                            component="div"
                            className="text-danger small"
                          /> */}

                          {loadFactor &&
                            values.connectedLoad &&
                            values.charging_prd_days && (
                              <div className="mt-2 p-2 bg-light border rounded small">
                                <strong>Formula:</strong>
                                <br />
                                <code>
                                  {values.connectedLoad} ×{" "}
                                  {Number(loadFactor).toFixed(2)} ×{" "}
                                  {values.charging_prd_days} × 730
                                  {" = "}
                                  <span className="text-primary fw-bold">
                                    {Math.round(
                                      values.connectedLoad *
                                        loadFactor *
                                        values.charging_prd_days *
                                        730
                                    )}
                                  </span>
                                </code>
                                <br />
                                <small className="text-muted">
                                  Connected Load (kW) × Load Factor × Months ×
                                  730 hrs/month
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
                            Units Chargeable:
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

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Notice Issue No:
                            <span className="text-danger"> *</span>
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
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Dated:<span className="text-danger"> *</span>
                          </label>
                          <Field
                            name="noticeDate"
                            type="date"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="noticeDate"
                            component="div"
                            className="text-danger small"
                          />
                        </div>
                      </div>

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
                                      Units Charged
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
                                        <td>{item?.month || ""}</td>
                                        <td>{item?.units || ""}</td>
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
