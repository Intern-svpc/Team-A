import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [colleges, setColleges] = useState( );
  const [students, setStudents] = useState();
  const [paidColleges, setPaidColleges] = useState();
  const [paidStudents, setPaidStudents] = useState();
  

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/counts");
                const data = await response.json();
                setColleges(data.colleges);  // Fix: Use correct key from API response
                setStudents(data.students);  // Fix: Use correct key from API response
                // If you need paid data, ensure the backend provides it
                setPaidColleges(data.paidColleges || 0); 
                setPaidStudents(data.paidStudents || 0); 
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 sec

        return () => clearInterval(interval);
    }, []);

    return (
      <>
        <h2>Admin Dashboard</h2>
        <div className="dashboard-container">
            <Card icon="📁" title="No. of Colleges" number={colleges} completed={`${colleges} Registered`} />
            <Card icon="🎓" title="No. of Students" number={students} completed={`${students} Active`} />
            <Card icon="💰" title="Paid Colleges" number={paidColleges} completed="0 Subscribed" />
            <Card icon="📈" title="Paid Students" number={paidStudents} completed="0 Subscribed" />
        </div>
        </>
    );
};

const Card = ({ icon, title, number, completed }) => (
    <div className="card">
        <div className="icon">{icon}</div>
        <h3>{title}</h3>
        <div className="number">{number}</div>
        <div className="completed">{completed}</div>
    </div>
);

export default Dashboard;
