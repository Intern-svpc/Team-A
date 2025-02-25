import React from "react";

function StudentModal({ isOpen, onClose, title, students }) {
  if (!isOpen) return null; // Prevent rendering when modal is closed

  const handleRestart = (student) => {
    console.log(`Restarting attempt for: ${student.name} (${student.roll_no})`);
    // Implement restart logic here (e.g., API call)
  };

  return (
    <>
      <div className="overlay overlay-open" onClick={onClose}></div>

      {/* Modal */}
      <div className="modal modal-open">
        <div className="modal-content">
          <h2>{title}</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Attempted</th>
                  <th>Submit Status</th>
                  <th>Submitted At</th>
                  <th>Restart</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student, index) => {
                    console.log("Student Data:", student);
                    console.log("URL Array:", student.url);
                    console.log("Submitted Value:", student.url?.[0]?.submitted);

                    return (
                      <tr key={index}>
                        <td>{student.name || "N/A"}</td>
                        <td>{student.roll_no || "N/A"}</td>
                        <td>{student.attempted ? "Yes" : "No"}</td>
                        <td>
                          {Array.isArray(student.url) && student.url.length > 0
                            ? student.url[0].submitted === true
                              ? "Submitted"
                              : student.url[0].submitted === false
                                ? "Not Submitted"
                                : "Invalid Data"
                            : "No Data"}
                        </td>

                        <td>
                          {student.timestamp
                            ? new Date(student.timestamp).toLocaleString()
                            : "N/A"}
                        </td>
                        <td>
                          <button onClick={() => handleRestart(student)}>
                            Restart
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6">No student data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

export default StudentModal;
