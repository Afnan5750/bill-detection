import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import pitcLogo from "../../assets/pitc_logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bgImage from "../../assets/signin-bg1.jpg";

const Signin = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    userId: Yup.string().required("User ID is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        user_id: values.userId,
        pwd: values.password,
      });

      if (response.data && response.data.data) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userData", JSON.stringify(response.data.data));

        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 1000,
        });

        setTimeout(() => navigate("/detection"), 1000);
      } else {
        toast.error("Invalid credentials!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed! Please check your User ID and password.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="card shadow p-4 position-relative"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "white",
          backdropFilter: "blur(5px)",
          borderRadius: "15px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid white",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            backgroundColor: "#fff",
          }}
        >
          <img
            src={pitcLogo}
            alt="Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ marginTop: "40px" }}>
          <h3 className="text-center mb-4 fw-bold" style={{ color: "#800000" }}>
            Sign In
          </h3>

          <Formik
            initialValues={{ userId: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label className="form-label">User ID</label>
                  <Field
                    type="text"
                    name="userId"
                    className="form-control"
                    placeholder="Enter your User ID"
                  />
                  <ErrorMessage
                    name="userId"
                    component="div"
                    className="text-danger small"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <Field
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-danger small"
                  />
                </div>

                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    className="btn"
                    style={{ backgroundColor: "#800000", color: "#fff" }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Signin;
