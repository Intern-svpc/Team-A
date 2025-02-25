import React from "react";

function RecentTestsTable({ recentTests, onButtonClick }) {
  // Function to calculate the number of students who submitted the test
  const calculateSubmittedStudents = (students) => {
    return students.filter(student => student.submitted).length;
  };

  return (
    <div className="recent-tests">
      <h2>Recent Tests:</h2>
      <table id="testsTable">
        <thead>
          <tr>
            <th>College Name</th>
            <th>Branch</th>
            <th>Number of Students Appeared</th>
            <th>Number of Students Submitted</th>
            <th>Time of Creation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {recentTests.map((test, index) => (
            <tr key={index}>
              <td>{test.college}</td>
              <td>{test.branch}</td>
              <td>{test.students.length}</td>
              <td>{calculateSubmittedStudents(test.students)}</td>
              <td>{new Date(test.createdAt).toLocaleString()}</td>
              <td>
                <button
                  className="action-button"
                  onClick={() => onButtonClick(test.college, test.branch, test.createdAt)}
                >
                  Action
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentTestsTable;