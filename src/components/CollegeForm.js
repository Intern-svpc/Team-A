import React, { useState } from "react";
import LinkModal from "./LinkModal";
import { generateLink } from "../services/api";

function CollegeForm({
  colleges,
  selectedCollege,
  selectedBranch,
  attempts,
  searchQuery,
  handleCollegeChange,
  onBranchChange,
  filteredColleges,
  setSelectedCollege,
  setSearchQuery,
  setFilteredColleges,
  selectedYear,
  selectedSemester,
  onYearChange,
  onSemesterChange,
  handleGenerateLink
}) {
  const [generatedLink, setGeneratedLinkState] = useState("");
  const [expiry, setExpiryState] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpenState] = useState(false);

  const handleCloseModal = () => {
    setIsLinkModalOpenState(false); // Close the modal
  };

  

  return (
    <>
      <h2>College Link Generator</h2>
      <form id="linkForm" onSubmit={handleGenerateLink}>
        <div className="form-row">
          {/* College Name Input with Autocomplete */}
          <label htmlFor="collegeName">College Name:</label>
          <div className="input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={handleCollegeChange}
              placeholder="Search for a college..."
              onFocus={() => {
                if (!filteredColleges.length) setFilteredColleges(colleges);
              }}
            />
            {filteredColleges.length > 0 && (
  <div className="suggestions">
    {filteredColleges.map((college) => (
      <div
        key={college.id || college.collegeName} // Fix: Ensure unique key
        className="suggestion-item"
        onClick={() => {
          setSelectedCollege(college.collegeName);
          setSearchQuery(college.collegeName);
          setFilteredColleges([]);
        }}
      >
        {college.collegeName}
      </div>
    ))}
  </div>
)}
</div>
<label>Branch :</label>
<select
  id="branchName"
  value={selectedBranch}
  onChange={onBranchChange}
  required
>
  <option value="">Select Branch</option>
  {selectedCollege &&
    colleges
      .find((c) => c.collegeName === selectedCollege)
      ?.branches?.map((branch) => (
        <option key={branch.id || branch.branchName} value={branch.branchName}>
          {branch.branchName}
        </option>
      ))}
</select>
<label>Year :</label>
<select id="year" value={selectedYear} onChange={onYearChange} required>
  <option value="">Select Year</option>
  {[1, 2, 3, 4].map((year) => (
    <option key={year} value={year}>
      {year}st Year
    </option>
  ))}
</select>
<label>Semester :</label>
<select id="semester" value={selectedSemester} onChange={onSemesterChange} required>
  <option value="">Select Semester</option>
  {Array.from({ length: 8 }, (_, i) => (
    <option key={'semester-' + (i + 1)} value={i + 1}>
      Semester {i + 1}
    </option>
  ))}
</select>

          {/* Attempts (Read-Only) */}
          <label htmlFor="attempts">Attempts:</label>
          <input
            type="number"
            id="attempts"
            value={attempts}
            readOnly
            required
          />

          {/* Submit Button */}
          <button type="submit">Generate Link</button>
        </div>
      </form>

      {/* LinkModal: Display the generated link and expiry */}
      {isLinkModalOpen && (
        <LinkModal
          link={generatedLink}
          expiry={expiry}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default CollegeForm;
