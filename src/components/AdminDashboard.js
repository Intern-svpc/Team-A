import React, { useState, useEffect } from "react";
import { Link, Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard-components/Dashboard";
import PaidCollegeRecord from "./dashboard-components/PaidCollegeRecord";
import StudentRegistration from "./StudentRegistration";
import ExpiredLinksTable from "./ExpiredLinksTable";
import ActiveLinksTable from "./ActiveLinksTable";
import CollegeRegistration from "./CollegeRegistration";
import Logout from "./dashboard-components/Logout";
import AptitudeQuiz from "./AptitudeQuiz";
import "./AdminDashboard.css";
import {
  fetchColleges,
  fetchActiveLinks,
  generateLink,
  fetchStudentsByLink,
} from "../services/api";
import CollegeForm from "./CollegeForm";
import {
  FaHome,
  FaUniversity,
  FaMoneyCheckAlt,
  FaEnvelope,
  FaSignOutAlt,
  FaBook,
} from "react-icons/fa";


const AdminPanel = () => {
  const [colleges, setColleges] = useState([]);
  const [activeLinks, setActiveLinks] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [generatedLink, setGeneratedLink] = useState("");
  const [expiry, setExpiry] = useState("");
  const [expiredLinks, setExpiredLinks] = useState([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [selectedYear, setSelectedYear] = useState(""); // New state for Year
  const [selectedSemester, setSelectedSemester] = useState(""); // New state for Semester
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({

    college: false,
    paidCollege: false,
  });


  useEffect(() => {
    fetch("http://localhost:5000/api/expired-links")
      .then((response) => response.json())
      .then((data) => {
        console.log("Expired Links Data:", data); // Check data
        setExpiredLinks(data);
      })
      .catch((error) => console.error("Error fetching expired links:", error));
  }, []);

  useEffect(() => {
    fetchColleges().then((data) => setColleges(data));
    fetchActiveLinks()
      .then((data) => {
        console.log("Active Links Data:", data); // Debug log
        setActiveLinks(data);
      })
      .catch((error) => console.error("Error fetching active links:", error));
  }, []);


  useEffect(() => {
    console.log("searchQuery changed:", searchQuery);
    if (searchQuery) {
      const filtered = colleges.filter(college =>
        college.collegeName && college.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("Filtered colleges:", filtered);
      filtered.sort((a, b) => {
        const aStartsWith = a.collegeName.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bStartsWith = b.collegeName.toLowerCase().startsWith(searchQuery.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.collegeName.localeCompare(b.collegeName);
      });
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges([]);
    }
  }, [searchQuery, colleges]);

  const handleCollegeChange = (eventOrValue) => {
    const value = typeof eventOrValue === "string" ? eventOrValue : eventOrValue?.target?.value;
    console.log("College input changed:", value);
    setSearchQuery(value || ""); // Allow empty value (e.g., when backspacing)
    if (value) {
      setSelectedCollege(value);
      setSelectedBranch("");
      setSelectedYear("");  // Reset Year on college change
      setSelectedSemester(""); // Reset Semester on college change
      setAttempts(0);
    }
    setFilteredColleges([]); // Hide suggestions after selection
    setTimeout(() => setFilteredColleges([]), 100);
  };

  const handleBranchChange = async (e) => {
    const branch = e.target.value;
    console.log("Sending request with:", { selectedCollege, branch });
    setSelectedBranch(branch);

    console.log("Selected College:", selectedCollege);
    console.log("Selected Branch:", branch);

    if (!selectedCollege || !branch) {
      console.error("Missing required values:", { selectedCollege, branch });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/attempts?collegeName=${encodeURIComponent(selectedCollege)}&branchName=${encodeURIComponent(branch)}`
      );
      const data = await response.json();

      if (response.ok) {
        setAttempts(data.attempts || 0);
      } else {
        console.error("Failed to fetch attempts:", data);
        alert("Failed to fetch attempts data.");
      }
    } catch (error) {
      console.error("Error fetching attempts:", error);
    }
  };


  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
  };

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeName: selectedCollege,
           branchName: selectedBranch,
          year: selectedYear,
          semester: selectedSemester
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate link");
      }

      // ✅ Set the generated link and open modal
      setGeneratedLink(data.url);
      setExpiry(data.expiry);
      setIsLinkModalOpen(true);

      // ✅ Fetch the latest attempts count immediately after creating the link
      fetchUpdatedAttempts(selectedCollege, selectedBranch);
      
      const url = data.url;
      const userInput = prompt("Link generated for " + selectedCollege +" : "+ selectedBranch + "\nCopy this link:", url);

      // ✅ Refresh the page after closing prompt (whether user copies or cancels)
      if (userInput !== null) {
        window.location.reload();
      }

    } catch (error) {
      console.error("Error generating link:", error);
      alert(error.message || "An unexpected error occurred.");
    }
};


  // 🔄 Function to fetch the updated attempts count after link generation
  const fetchUpdatedAttempts = async (college, branch) => {
    try {
      const response = await fetch(`http://localhost:5000/api/college/${college}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch updated attempts");
      }

      // ✅ Find the branch and update attempts in state immediately
      const updatedBranch = data.branches.find(b => b.branchName === branch);
      if (updatedBranch) {
        setAttempts(updatedBranch.attempts);
      }
    } catch (error) {
      console.error("Error fetching attempts:", error);
    }
  };

  // 🔄 Refresh page when the modal closes
  const handleCloseModal = () => {
    setIsLinkModalOpen(false);
    window.location.reload();  // ✅ Refresh the page after closing the modal
  };



  // const handleCloseModal = () => {
  //   setIsLinkModalOpen(false); // Close the modal
  // };

  return (
    <div className="admin-container">
      {/* Sidebar/Navbar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <button
          className="toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <div className="sidebar-links">
          <Link to="/Dashboard">
            <FaHome /> <span>Dashboard</span>
          </Link>
          <div
            onClick={() =>
              setSubmenuOpen({ ...submenuOpen, college: !submenuOpen.college })
            }
          >
            <FaUniversity /> <span>Regular College Data</span>
          </div>
          {submenuOpen.college && (
            <div className="submenu">
              <Link to="/college-registration">
                <FaBook /> <span>College Registration</span>
              </Link>
            </div>
          )}
          {submenuOpen.college && (
            <div className="submenu">
              <Link to="/regular-active-links">
                <FaBook /> <span>Active Regular Exams</span>
              </Link>
            </div>
          )}

          {submenuOpen.college && (
            <div className="submenu">
              <Link to="/regular-college-exam">
                <FaBook /> <span>Regular Link Generator</span>
              </Link>
            </div>
          )}
          {submenuOpen.college && (
            <div className="submenu">
              <Link to="/regular-past-exams">
                <FaBook /> <span>Regular Past Exams</span>
              </Link>
            </div>
          )}

          <div
            onClick={() =>
              setSubmenuOpen({
                ...submenuOpen,
                paidCollege: !submenuOpen.paidCollege,
              })
            }
          >
            <FaMoneyCheckAlt /> <span>Paid College Registration</span>
          </div>
          {/* {submenuOpen.college && (
            <div className="submenu">
              <Link to="/college-registration">
                <FaBook /> <span>College Registration</span>
              </Link>
            </div>
          )} */}
          {submenuOpen.paidCollege && (
            <div className="submenu">
              <Link to="/paid-active-links">
                <FaBook /> <span>Paid Regular Exams</span>
              </Link>
            </div>
          )}

          {submenuOpen.paidCollege && (
            <div className="submenu">
              <Link to="/paid-college-exam">
                <FaBook /> <span>Paid Link Generator</span>
              </Link>
            </div>
          )}
          {submenuOpen.paidCollege && (
            <div className="submenu">
              <Link to="/paidr-past-exams">
                <FaBook /> <span>Paid Past Exams</span>
              </Link>
            </div>
          )}

          

          <Link to="/logout">
            <FaSignOutAlt /> <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`content ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <Routes>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route
            path="/regular-active-links"
            element={
              <ActiveLinksTable
                activeLinks={activeLinks || []}
                onDetailsClick={setActiveLinks}
              />
            }
          />
          <Route
            path="/college-registration"
            element={<CollegeRegistration />}
          />
          <Route
            path="/regular-college-exam"
            element={
              <CollegeForm
                colleges={colleges}
                selectedCollege={selectedCollege}
                selectedBranch={selectedBranch}
                attempts={attempts}
                searchQuery={searchQuery}
                handleCollegeChange={handleCollegeChange}
                onBranchChange={handleBranchChange}
                filteredColleges={filteredColleges}
                setSelectedCollege={setSelectedCollege}
                setSearchQuery={setSearchQuery}
                setFilteredColleges={setFilteredColleges}
                selectedYear={selectedYear}
                selectedSemester={selectedSemester}
                onYearChange={handleYearChange}
                onSemesterChange={handleSemesterChange}
                handleGenerateLink={handleGenerateLink}  // Pass this function
              />

            }
          />
          <Route path="/regular-past-exams" element={<ExpiredLinksTable expiredLinks={expiredLinks || []} />} />
          {/* <Route path="/exam/:examId" element={<StudentRegistration />} />
          <Route path="/quiz/:examId" element={<AptitudeQuiz />} /> */}
          {/* <Route path="/quiz" element={<AptitudeQuiz />} /> */}
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
