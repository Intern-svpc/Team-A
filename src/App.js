import React, { useState, useEffect } from "react";
import CollegeForm from "./components/CollegeForm";
import ActiveLinksTable from "./components/ActiveLinksTable";
import StudentModal from "./components/StudentModal";
import ExpiredLinksTable from "./components/ExpiredLinksTable";
import LinkModal from "./components/LinkModal";
import AdminDashboard from "./components/AdminDashboard"; // Import the component
//import MainLayout from "./components/MainLayout";
import { fetchColleges, fetchActiveLinks, generateLink, fetchStudentsByLink } from "./services/api";
import "./App.css";

function App() {
  const [colleges, setColleges] = useState([]);
  const [activeLinks, setActiveLinks] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [generatedLink, setGeneratedLink] = useState("");
  const [expiry, setExpiry] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [expiredLinks, setExpiredLinks] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [selectedYear, setSelectedYear] = useState(""); // New state for Year
  const [selectedSemester, setSelectedSemester] = useState(""); // New state for Semester

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
    if (searchQuery) {
      const filtered = colleges.filter(college =>
        college.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      filtered.sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(searchQuery.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      });
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges([]);
    }
  }, [searchQuery, colleges]);

  const handleCollegeChange = (eventOrValue) => {
    const value = typeof eventOrValue === "string" ? eventOrValue : eventOrValue?.target?.value;
    setSearchQuery(value || ""); // Allow empty value (e.g., when backspacing)
    if (value) {
      setSelectedCollege(value);
      setSelectedBranch("");
      setSelectedYear("");  // Reset Year on college change
      setSelectedSemester(""); // Reset Semester on college change
      setAttempts(0);
    }
    setFilteredColleges([]); // Hide suggestions after selection
  };

  const handleBranchChange = async (e) => {
    const branch = e.target.value;
    setSelectedBranch(branch);

    if (selectedCollege && branch) {
      try {
        const response = await fetch(`http://localhost:5000/api/attempts?collegeName=${encodeURIComponent(selectedCollege)}&branchName=${encodeURIComponent(branch)}`);
        const data = await response.json();
        setAttempts(data.attempts || 0);
      } catch (error) {
        console.error("Error fetching attempts:", error);
      }
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
    console.log("Generating link for:", selectedCollege, selectedBranch, selectedYear, selectedSemester);
  
    if (!selectedCollege || !selectedBranch || !selectedYear || !selectedSemester) {
      alert("Please select college, branch, year, and semester.");
      return;
    }
  
    try {
      const response = await generateLink(selectedCollege, selectedBranch, selectedYear, selectedSemester);
      console.log("Generated Link Response:", response);
  
      if (response.url) {
        setGeneratedLink(response.url);
        setExpiry(response.expiry);
        setIsLinkModalOpen(true);
        fetchActiveLinks().then((data) => setActiveLinks(data));
  
        const attemptsUrl = `http://localhost:5000/api/attempts?collegeName=${encodeURIComponent(selectedCollege)}&branchName=${encodeURIComponent(selectedBranch)}`;
        console.log('Requesting attempts data from:', attemptsUrl);
  
        const attemptsResponse = await fetch(attemptsUrl);
        const attemptsData = await attemptsResponse.json();
        console.log("Attempts Data:", attemptsData);
  
        if (attemptsResponse.ok) {
          setAttempts(attemptsData.attempts || 0);
        } else {
          console.error("Failed to fetch attempts data:", attemptsData);
          alert("Failed to fetch attempts data.");
        }
      } else {
        alert("Failed to generate link.");
      }
    } catch (error) {
      console.error("Error in generating link or fetching attempts:", error);
      alert("There was an error. Please try again.");
    }
  };
  
  

  const openStudentModal = async (college, branch, url) => {
    setModalTitle(`Students for ${college} - ${branch}`);
    const students = await fetchStudentsByLink(college, branch, url);
    setStudents(students);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStudents([]);
  };

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
  };
  return <AdminDashboard />;
//   return (
//     <div className="container">
//       {/* <MainLayout /> */}
//       <h1>College Link Generator</h1>

//       <CollegeForm
//   colleges={colleges}
//   selectedCollege={selectedCollege}
//   selectedBranch={selectedBranch}
//   selectedYear={selectedYear}
//   selectedSemester={selectedSemester}
//   attempts={attempts}
//   searchQuery={searchQuery}
//   handleCollegeChange={handleCollegeChange}
//   onBranchChange={handleBranchChange}
//   onYearChange={handleYearChange}
//   onSemesterChange={handleSemesterChange}
//   onGenerateLink={handleGenerateLink}
//   filteredColleges={filteredColleges}
//   setSelectedCollege={setSelectedCollege}
//   setSearchQuery={setSearchQuery}
//   setFilteredColleges={setFilteredColleges}
// />

//       <ActiveLinksTable activeLinks={activeLinks} onDetailsClick={openStudentModal} />
//       <StudentModal
//         isOpen={isModalOpen}
//         onClose={closeModal}
//         title={modalTitle}
//         students={students}
//       />
//       {isLinkModalOpen && (
//         <LinkModal
//           link={generatedLink}
//           expiry={expiry}
//           onClose={closeLinkModal}
//         />
//       )}
//       <h2>Expired Links:</h2>
//       <ExpiredLinksTable expiredLinks={expiredLinks} /> {/* Pass expired links */}
//     </div>
//   );
}

export default App;
