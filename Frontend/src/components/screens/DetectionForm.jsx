import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import axios from "axios";

const DetectionForm = () => {
  const [reasonList, setReasonList] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [refError, setRefError] = useState("");
  const [loading, setLoading] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("userData")) || {};
  const navigate = useNavigate();
  const { id } = useParams();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.clear();
      window.location.href = "/login";
    }
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
      backgroundColor: "#800000",
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
      color: "#800000",
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
    connectedLoad: Yup.string().required("Connected Load is required"),
    checkedBy: Yup.string().required("Checked By is required"),
    observation: Yup.string().required("Observation is required"),
    basisOfAssessment: Yup.string().required("Basis of Assessment is required"),
    totalUnitsChargeable: Yup.number()
      .typeError("Must be a number")
      .required("Total Units Chargeable is required"),
    noticeIssueNo: Yup.string().required("Notice Issue No is required"),
    noticeDate: Yup.date().required("Notice Date is required"),
    det_start_dt: Yup.date().required("Start date is required"),
    det_end_dt: Yup.date()
      .required("End date is required")
      .min(Yup.ref("det_start_dt"), "End date must be after start date"),
    charging_prd_days: Yup.number()
      .typeError("Days must be a number")
      .min(1, "Days cannot be 0 or less")
      .required("Charging Period is required"),
    unitsChargeable: Yup.number().test(
      "non-negative",
      "Units Chargeable cannot be negative",
      function (value) {
        return value >= 0; // error if negative
      }
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
                color: "#800000",
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
                    alert(data.message);
                    if (!id) {
                      resetForm();
                    } else {
                      navigate("/detection-list");
                    }
                  } else {
                    alert("Error storing form data: " + data.message);
                  }
                } catch (err) {
                  console.error("Error submitting form:", err);
                  alert("Form submission failed");
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
                        const res = await fetch(
                          "http://localhost:5000/api/billDetails",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ refNo: ref }),
                          }
                        );
                        const data = await res.json();

                        if (data && data.basicInfo) {
                          setFieldValue(
                            "consumerName",
                            data.basicInfo.consumerName?.trim() || ""
                          );
                          setFieldValue(
                            "tariff",
                            data.basicInfo.tariffDescription?.trim() || ""
                          );
                          setFieldValue(
                            "tariffCode",
                            data.basicInfo.tariffCode?.trim() || ""
                          );
                          setFieldValue(
                            "sanctionLoad",
                            data.basicInfo.sactionLoad?.trim() || ""
                          );
                          setFieldValue(
                            "totalUnitsAlreadyCharged",
                            data.basicInfo.totCurCons?.trim() || ""
                          );

                          if (data.basicInfo.billMonth) {
                            const billDate =
                              data.basicInfo.billMonth?.split("T")[0];
                            setFieldValue("b_month", billDate);
                          }

                          const months = [];
                          if (data.histInfo) {
                            const histKeys = Object.keys(data.histInfo);
                            histKeys.forEach((key) => {
                              const match = key.match(/^gbHistMM(\d+)$/);
                              if (match) {
                                const index = match[1];
                                const month = data.histInfo[`gbHistMM${index}`];
                                const units =
                                  data.histInfo[`gbHistUnits${index}`];
                                const payment =
                                  data.histInfo[`payment${index}`] || 0;
                                if (month && units) {
                                  months.push({ month, units, payment });
                                }
                              }
                            });

                            months.sort(
                              (a, b) => parseInt(a.index) - parseInt(b.index)
                            );
                          }

                          setBillHistory(months);
                          setRefError("");
                        } else {
                          setRefError("Reference number not found");
                          setBillHistory([]);
                        }
                      } catch (err) {
                        console.error("Fetch error:", err);
                        setRefError("Error fetching data. Please try again.");
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
                    const diffDays = Math.ceil(
                      (end - start) / (1000 * 60 * 60 * 24)
                    );
                    setFieldValue("charging_prd_days", diffDays);
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

                return (
                  <Form>
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Reference No:
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
                        <label className="form-label fw-bold">
                          Connected Load(KWh):
                        </label>
                        <Field name="connectedLoad" className="form-control" />
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
                          Start Date:
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
                        <label className="form-label fw-bold">End Date:</label>
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
                          Charging Period (Days):
                        </label>
                        <Field
                          name="charging_prd_days"
                          className="form-control"
                          readOnly
                        />
                        <ErrorMessage
                          name="charging_prd_days"
                          component="div"
                          className="text-danger small"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Total Units Chargeable:
                        </label>
                        <Field
                          name="totalUnitsChargeable"
                          type="number"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="totalUnitsChargeable"
                          component="div"
                          className="text-danger small"
                        />
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
                        </label>
                        <Field name="noticeIssueNo" className="form-control" />
                        <ErrorMessage
                          name="noticeIssueNo"
                          component="div"
                          className="text-danger small"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Dated:</label>
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
                          style={{ color: "#800000", marginTop: "30px" }}
                        >
                          CONSUMPTION DATA
                        </h4>
                        <table className="table table-bordered mt-3 text-center">
                          <thead>
                            <tr>
                              <th>Month/Year</th>
                              <th>Units Charged</th>
                              <th className="bg-light"></th>
                              <th>Month/Year</th>
                              <th>Units Charged</th>
                              <th className="bg-light"></th>
                              <th>Month/Year</th>
                              <th>Units Charged</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({
                              length: Math.ceil(billHistory.length / 3),
                            }).map((_, rowIndex) => (
                              <tr key={rowIndex}>
                                {[0, 1, 2].map((colIndex) => {
                                  const item =
                                    billHistory[
                                      rowIndex +
                                        colIndex *
                                          Math.ceil(billHistory.length / 3)
                                    ];
                                  return item ? (
                                    <>
                                      <td>{item.month}</td>
                                      <td>{item.units}</td>
                                      <td className="bg-light"></td>
                                    </>
                                  ) : (
                                    <>
                                      <td></td>
                                      <td></td>
                                      <td className="bg-light"></td>
                                    </>
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
                          backgroundColor: "#800000",
                          color: "#fff",
                          borderColor: "#800000",
                          width: "250px",
                          borderRadius: "50px",
                          fontWeight: "600",
                        }}
                      >
                        {id ? "Update" : "Submit"}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionForm;
