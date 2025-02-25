import { useState } from "react";
import StudentModal from "./StudentModal"; // Ensure correct import
import { fetchStudentsByLink } from "../services/api";
import * as XLSX from "xlsx"; // Import xlsx library

const ExpiredLinksTable = ({ expiredLinks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [students, setStudents] = useState([]);

  const openStudentModal = async (college, branch, url) => {
    setModalTitle(`Students for ${college} - ${branch}`);
    const students = await fetchStudentsByLink(college, branch, url);
    console.log("Fetched students:", students); // Debugging
    setStudents(students);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setStudents([]);
  };

  // Function to handle Excel download
  const downloadExcel = async (college, branch, url) => {
    // Wait for the students data to be fetched
    const students = await fetchStudentsByLink(college, branch, url);
    console.log("Fetched students:", students); // Debugging
    setStudents(students);
    // Check if the students array is populated correctly
    console.log("Students data before export:", students);
  
    if (!Array.isArray(students) || students.length === 0) {
      alert("No students data available to download.");
      return;
    }
  
    // Convert students data to worksheet
    const ws = XLSX.utils.json_to_sheet(students);
  
    // Check the worksheet content
    console.log("Worksheet content:", ws);
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
  
    // Trigger Excel file download
    XLSX.writeFile(wb, "students_details.xlsx");
  };
  
  

  return (
    <>
    <h2>Expired Regular Links</h2>
      <table>
        <thead>
          <tr>
            <th>College Name</th>
            <th>Branch</th>
            <th>URL</th>
            <th>Students Attempted</th>
            <th>Students Submitted</th>
            <th>Time of Expiry</th>
            <th>Details</th>
            <th>Download Details</th>
          </tr>
        </thead>
        <tbody>
          {expiredLinks.length > 0 ? (
            expiredLinks.map((item, index) => (
              <tr key={index}>
                <td>{item.collegeName || "N/A"}</td>
                <td>{item.branch || "N/A"}</td>
                <td>{item.url || "N/A"}</td>
                <td>{item.numStudentsAttempted || 0}</td>
                <td>{item.numStudentsSubmitted || 0}</td>
                <td>{new Date(item.timeOfUrlExpiry).toLocaleString()}</td>
                <td>
                  <button onClick={() => openStudentModal(item.collegeName, item.branch, item.url)}>
                    Details
                  </button>
                </td>
                <td>
                  <button onClick={() => downloadExcel(item.collegeName, item.branch, item.url)}>
                    Download
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No expired links found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Student Modal */}
      <StudentModal 
        isOpen={isModalOpen}  // Pass the isOpen state
        title={modalTitle}
        students={students}
        onClose={closeModal}  // Use correct prop name
      />
    </>
  );
};

export default ExpiredLinksTable;
