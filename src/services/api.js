export const fetchColleges = async () => {
    const response = await fetch("http://localhost:5000/api/colleges");
    return response.json();
  };
  
  export const fetchActiveLinks = async () => {
    const response = await fetch("http://localhost:5000/api/active-links");
    return response.json();
  };
  
  export const generateLink = async (college, branch , year , semester) => {
    const response = await fetch("http://localhost:5000/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ college, branch , year , semester }),
    });
    return response.json();
  };
  
  export const fetchStudentsByLink = async (college, branch, url) => {
    const response = await fetch(
      `http://localhost:5000/api/students-by-active-link?college=${encodeURIComponent(
        college
      )}&branch=${encodeURIComponent(branch)}&url=${encodeURIComponent(url)}`
    );
    return response.json();
  };