import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StudentRegistration.css";

const StudentRegistration = () => {
  const { examId } = useParams(); // ✅ Get exam ID from URL
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Added loading state

  const [studentData, setStudentData] = useState({
    name: "",
    roll_no: "",
    contact: "",
    email: "",
  });

  // ✅ Fetch Exam Details
  useEffect(() => {
    if (!examId) return; // ✅ Prevent fetching if no exam ID

    const fetchExam = async () => {
      try {
        console.log("Fetching exam data for:", examId);

        const res = await fetch(`http://localhost:5000/api/exam/${examId}`);
        const contentType = res.headers.get("content-type");

        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format (Expected JSON)");
        }

        const data = await res.json();
        setExam(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // ✅ Redirect if exam is invalid
  useEffect(() => {
    if (error) {
      alert(error);
      navigate("/"); // Redirect to home
    }
  }, [error, navigate]);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating field: ${name}, Value: ${value}`);
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };
  

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch("http://localhost:5000/api/register-student", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...studentData,
                college: exam?.college,  // ✅ FIXED: Use `college`
                branch: exam?.branch,
                testId: examId,
                url: window.location.href,
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to register");

        alert("Registration successful!");
        navigate(`/quiz/${data.studentId}`);
    } catch (error) {
        console.error("Error registering:", error);
        alert(error.message);
    }
};

  
  

  // ✅ Handle Loading & Errors
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!exam) return <p>Exam not found.</p>;

  return (
    <div className="student-registration-container">
      <h2 className="student-registration-title">Student Registration</h2>
      <p className="student-registration-test-id">Exam ID: {examId}</p>

      <form className="student-registration-form" onSubmit={handleSubmit}>
        <label className="student-registration-label">Name:</label>
        <input
          className="student-registration-input"
          type="text"
          name="name"
          value={studentData.name}
          onChange={handleChange}
          required
        />

        <label className="student-registration-label">Roll No:</label>
        <input
          className="student-registration-input"
          type="text"
          name="roll_no"
          value={studentData.roll_no}
          onChange={handleChange}
          required
        />

        <label className="student-registration-label">Contact:</label>
        <input
          className="student-registration-input"
          type="text"
          name="contact"
          value={studentData.contact}
          onChange={handleChange}
          required
        />

        <label className="student-registration-label">Email:</label>
        <input
          className="student-registration-input"
          type="email"
          name="email"
          value={studentData.email}
          onChange={handleChange}
          required
        />

        <button className="student-registration-button" type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default StudentRegistration;
