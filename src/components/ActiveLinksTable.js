import React, { useEffect } from "react";

const ActiveLinksTable = ({ activeLinks }) => {
  // Debugging: Check if data is received
  useEffect(() => {
    console.log("Received Active Links in Table:", activeLinks);
  }, [activeLinks]);

  // Debugging: Check if activeLinks is an array
  if (!Array.isArray(activeLinks) || activeLinks.length === 0) {
    return <p>No active links available.</p>;
  }

  return (
    <div>
      <h2>Active Links</h2>
      <table>
        <thead>
          <tr>
            <th>College</th>
            <th>Branch</th>
            <th>Year</th>
            <th>Semester</th>
            <th>Link</th>
            <th>Created At</th>
            <th>Expires At</th>
          </tr>
        </thead>
        <tbody>
          {activeLinks.map((link, index) => (
            <tr key={index}>
              <td>{link.college || "N/A"}</td>
              <td>{link.branch || "N/A"}</td>
              <td>{link.year || "N/A"}</td>
              <td>{link.semester || "N/A"}</td>
              <td>
                {link.url ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.url}
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td>{link.created_at || "N/A"}</td>
              <td>{link.expiry || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveLinksTable;
