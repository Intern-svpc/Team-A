import { useState } from "react";
import "./CollegeRegistration.css";

export default function CollegeRegistration() {
  const [collegeName, setCollegeName] = useState("");
  const [branches, setBranches] = useState([""]);
  const [establishmentYear, setEstablishmentYear] = useState("");
  const [address, setAddress] = useState("");
  const [uniName, setUniName] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  const addBranch = () => {
    setBranches([...branches, ""]);
  };

  const removeBranch = (index) => {
    if (branches.length > 1) {
      setBranches(branches.filter((_, i) => i !== index));
    }
  };

  const handleBranchChange = (index, value) => {
    const newBranches = [...branches];
    newBranches[index] = value;
    setBranches(newBranches);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const collegeData = { collegeName, uniName, branches, establishmentYear, address };
  
    try {
      const response = await fetch("http://localhost:5000/register-college", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collegeData),
      });
  
      if (response.ok) {
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
        setCollegeName("");
        setUniName("");
        setBranches([""]);
        setEstablishmentYear("");
        setAddress("");
      } else {
        console.error("Failed to register college");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  return (
    <div className="container">
      <h1 className="title">College Registration Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>College Name:</label>
          <input type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>University Name:</label>
          <input type="text" value={uniName} onChange={(e) => setUniName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Branches:</label>
          <button type="button" onClick={addBranch} className="add-branch-btn">Add Branch</button>
          {branches.map((branch, index) => (
            <div key={index} className="branch-input">
              <input type="text" value={branch} onChange={(e) => handleBranchChange(index, e.target.value)} required />
              <button type="button" onClick={() => removeBranch(index)} className="remove-branch-btn">X</button>
            </div>
          ))}
        </div>
        <div className="form-group">
          <label>Establishment Year:</label>
          <input type="number" value={establishmentYear} onChange={(e) => setEstablishmentYear(e.target.value)} min="1800" max="2024" required />
        </div>
        <div className="form-group">
          <label>Address:</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows="4" required></textarea>
        </div>
        <button type="submit" className="submit-btn">Register College</button>
      </form>
      {successMessage && <div className="success-message">College registered successfully!</div>}
    </div>
  );
}
