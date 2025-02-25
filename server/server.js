const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/yashind", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define College Schema
const collegeSchema = new mongoose.Schema({
    collegeName: String,
    uniName: String,
    branches: [
        {
            branchName: String,
            attempts: { type: Number, default: 1 }
        }
    ],
    establishmentYear: Number,
    address: String,
});

const College = mongoose.model("College", collegeSchema, "colleges"); // Collection: colleges

// API to fetch all colleges and branches
app.get("/api/attempts", async (req, res) => {
    const { collegeName, branchName } = req.query;
    console.log("Fetching attempts for:", { collegeName, branchName });

    try {
        const college = await College.findOne({
            collegeName: { $regex: new RegExp(`^${collegeName}$`, "i") }
        });

        console.log("Found college:", college?.collegeName);

        if (!college) {
            return res.status(404).json({
                success: false,
                message: `College "${collegeName}" not found`
            });
        }

        const branch = college.branches.find(b => 
            b.branchName.toLowerCase() === branchName.toLowerCase().trim()
        );

        console.log("Found branch:", branch?.branchName);

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: `Branch "${branchName}" not found in ${collegeName}`
            });
        }

        return res.json({
            success: true,
            attempts: branch.attempts,
            collegeName: college.collegeName,
            branchName: branch.branchName
        });

    } catch (error) {
        console.error("Error in /api/attempts:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// API to fetch all colleges
app.get("/api/colleges", async (req, res) => {
    try {
        const colleges = await College.find({}, {
            collegeName: 1,
            branches: 1,
            _id: 0
        });
        res.json(colleges);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch colleges",
            error: error.message
        });
    }
});

// Generate link endpoint

const crypto = require("crypto"); // Import for generating unique ID

app.post("/api/generate-link", async (req, res) => {
    const { collegeName, branchName, year, semester } = req.body;

    if (!collegeName || !branchName || !year || !semester) {
        return res.status(400).json({ error: "College, branch, year, and semester parameters are required" });
    }

    try {
        console.log("Looking for college:", collegeName);

        const collegeData = await College.findOne({ collegeName });

        if (!collegeData) {
            console.error("College not found:", collegeName);
            return res.status(404).json({ error: "College not found" });
        }

        const branchData = collegeData.branches.find((b) => b.branchName === branchName);

        if (!branchData) {
            console.error("Branch not found:", branchName);
            return res.status(404).json({ error: "Branch not found" });
        }

        if (branchData.attempts <= 0) {
            console.error("No attempts left for this branch:", branchName);
            return res.status(400).json({ error: "No attempts left for this branch" });
        }

        console.log("Generating new link...");

        // ✅ Generate a unique 8-character ID
        const uniqueId = crypto.randomBytes(4).toString("hex");

        // ✅ Remove spaces from college name and branch name
        const cleanCollegeName = collegeName.replace(/\s+/g, "").toLowerCase();
        const cleanBranchName = branchName.replace(/\s+/g, "").toLowerCase();

        // ✅ Construct the final exam link
        const newLink = {
            url: `http://localhost:5000/exam/${cleanCollegeName}-${cleanBranchName}-${uniqueId}`,
            created_at: new Date(),
            expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour expiry
            year,
            semester,
        };

        // Save new active exam in the database
        const newActiveExam = new ActiveExam({
            college: collegeData.collegeName,
            branch: branchData.branchName,
            year,
            semester,
            url: newLink.url,
            created_at: newLink.created_at,
            expiry: newLink.expiry,
        });

        await newActiveExam.save();

        // Decrease the attempts count
        branchData.attempts -= 1;
        await collegeData.save();

        console.log("Link generated:", newLink.url);

        res.json(newLink);
    } catch (error) {
        console.error("Error generating link:", error);
        res.status(500).json({ error: "Error generating link" });
    }
});





// API to fetch branches for a specific college
app.get("/api/branches", async (req, res) => {
    try {
        const { college } = req.query;

        if (!college) {
            return res.status(400).json({ error: "College name is required" });
        }

        // Fetch college data using Mongoose
        const collegeData = await College.findOne({ collegeName: college });

        if (!collegeData) {
            return res.status(404).json({ error: "College not found" });
        }

        // Extract branch names
        const branches = collegeData.branches.map((b) => b.branchName);

        res.json({ branches });
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/register-college", async (req, res) => {
    try {
        const { collegeName, uniName, branches, establishmentYear, address } = req.body;

        // Convert branches array from ["CSE", "ECE"] to [{ branchName: "CSE", attempts: 1 }, { branchName: "ECE", attempts: 1 }]
        const formattedBranches = branches.map(branch => ({
            branchName: branch,
            attempts: 1
        }));

        const newCollege = new College({
            collegeName,
            uniName,
            branches: formattedBranches,
            establishmentYear,
            address,
        });

        await newCollege.save();
        
    } catch (error) {
        res.status(500).json({ error: "Error saving college data." });
    }
});


const activeExamSchema = new mongoose.Schema({
    college: String,
    branch: String,
    year: Number,
    semester: Number,
    url: String,
    created_at: Date,
    expiry: Date,
});

const ActiveExam = mongoose.model("ActiveExam", activeExamSchema, "active-exams");

// API to generate a link for a specific college and branch
app.post("/api/links", async (req, res) => {
    const { college, branch, year, semester } = req.body;

    if (!college || !branch || !year || !semester) {
        return res.status(400).json({ error: "College, branch, year, and semester parameters are required" });
    }

    try {
        console.log("Looking for college:", college);

        const collegeData = await College.findOne({ name: college });

        if (!collegeData) {
            console.error("College not found:", college);
            return res.status(404).json({ error: "College not found" });
        }

        const branchData = collegeData.branches.find((b) => b.branch_name === branch);

        if (!branchData) {
            console.error("Branch not found:", branch);
            return res.status(404).json({ error: "Branch not found" });
        }

        if (branchData.num_of_attempts <= 0) {
            console.error("No attempts left for this branch:", branch);
            return res.status(400).json({ error: "No attempts left for this branch" });
        }

        console.log("Generating new link...");

        // Generate a new unique link
        const newLink = {
            url: `http://localhost:5000/api/join/${college}-${branch}-${Date.now()}`,
            created_at: new Date(),
            year: year,
            semester: semester,
        };

        const newActiveExam = new ActiveExam({
            college,
            branch,
            year,
            semester,
            url: newLink.url,
            created_at: newLink.created_at,
            expiry: new Date(newLink.created_at).setHours(new Date(newLink.created_at).getHours() + 24),
        });
        
        await newActiveExam.save();
        
        // Decrease the num_of_attempts by 1
        branchData.num_of_attempts -= 1;

        // Save the updated document
        //await collegeData.save();

        console.log("Link generated:", newLink.url);

        res.json({
            url: newLink.url,
            expiry: new Date(newLink.created_at).setHours(new Date(newLink.created_at).getHours() + 24),
            year: year,
            semester: semester,
        });
    } catch (error) {
        console.error("Error generating link:", error);
        res.status(500).json({ error: "Error generating link" });
    }
});




// API to fetch all active links
app.get("/api/active-links", async (req, res) => {
    try {
        const now = new Date();

        // Fetch only active links (not expired)
        const activeLinks = await ActiveExam.find({
            expiry: { $gt: now } // Fetch links where expiry is greater than current time
        }, { college: 1, branch: 1, year: 1, semester: 1, url: 1, created_at: 1, expiry: 1 });

        res.json(activeLinks);
    } catch (error) {
        res.status(500).json({ error: "Error fetching active links" });
    }
});


// API to fetch total number of colleges and students
app.get("/api/counts", async (req, res) => {
    try {
        const collegeCount = await College.countDocuments();
        const studentCount = await Student.countDocuments();

        res.json({
            colleges: collegeCount,
            students: studentCount,
        });
    } catch (error) {
        console.error("Error fetching counts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// app.get("/api/expired-links", async (req, res) => {
//     try {
//         const expiredLinks = await pastExamsCollection.find({}, { 
//             collegeName: 1, 
//             branch: 1, 
//             url: 1, 
//             numStudentsAttempted: 1, 
//             numStudentsSubmitted: 1, 
//             timeOfUrlExpiry: 1 
//         }).lean();

//         if (!expiredLinks || expiredLinks.length === 0) {
//             return res.status(404).json({ error: "No expired links found" });
//         }

//         res.json(expiredLinks);
//     } catch (error) {
//         console.error("Error fetching expired links:", error.message);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// Define Expired Links Schema
const expiredLinkSchema = new mongoose.Schema({
    collegeName: String,
    branch: String,
    total_students: Number,
    url: String,
    numStudentsAttempted: Number,
    numStudentsSubmitted: Number,
    timeOfUrlExpiry: Date
});

// Create a Mongoose model for expired links
const PastExam = mongoose.model("PastExam", expiredLinkSchema, "past-exams");

// API to fetch expired links
app.get("/api/expired-links", async (req, res) => {
    try {
        const expiredLinks = await PastExam.find({}, {
            collegeName: 1,
            branch: 1,
            url: 1,
            numStudentsAttempted: 1,
            numStudentsSubmitted: 1,
            timeOfUrlExpiry: 1
        }).lean();

        if (!expiredLinks || expiredLinks.length === 0) {
            return res.status(404).json({ error: "No expired links found" });
        }

        res.json(expiredLinks);
    } catch (error) {
        console.error("Error fetching expired links:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Define Student Schema
const studentSchema = new mongoose.Schema({
    name: String,
    college_name: String,
    branch: String,
    roll_no: String,
    gender: String,
    url: [
        {
            url: String,
            attempted: Boolean,
            submitted: Boolean,
            submitted_at: Date
        }
    ]
});

const Student = mongoose.model("Student", studentSchema, "students"); // Collection: students

// API to fetch students matching a specific active link
app.get("/api/students-by-active-link", async (req, res) => {
    const { college, branch, url } = req.query;

    if (!college || !branch || !url) {
        return res.status(400).json({ error: "College, branch, and URL are required" });
    }

    try {
        const students = await Student.find({
            college_name: college,
            branch: branch,
            "url.url": url
        });

        const formattedStudents = students.map(student => {
            //console.log("Processing student:", student.name, "URLs:", student.url);

            // Ensure student.url is an array
            if (!Array.isArray(student.url)) {
                console.log("No URLs found for:", student.name);
                return {
                    name: student.name,
                    roll_no: student.roll_no,
                    attempted: "No",
                    submitted: "No",
                    timestamp: "N/A"
                };
            }

            // Find the attempt for the given URL
            const attempt = student.url.find(a => a.url.trim() === url.trim());

            //console.log("Found attempt:", attempt);

            return {
                name: student.name || "Unknown",
                roll_no: student.roll_no || "N/A",
                attempted: attempt?.attempted === true ? "Yes" : "No",
                submitted: attempt?.submitted === true ? "Yes" : "No",
                timestamp: attempt?.submitted_at ? new Date(attempt.submitted_at).toISOString() : "N/A"
            };
        });


        res.json(formattedStudents);

    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// async function deleteOldUrls() {
//     const client = new MongoClient("mongodb://localhost:27017");
//     try {
//         await client.connect();
//         const db = client.db("yashind");
//         const collection = db.collection("colleges");

//         const result = await collection.updateMany(
//             {
//                 "branches.urls.created_at": {
//                     $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
//                 }
//             },
//             {
//                 $pull: {
//                     "branches.$[].urls": {
//                         created_at: {
//                             $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
//                         }
//                     }
//                 }
//             }
//         );
//         //console.log(`${result.modifiedCount} documents updated`);
//     } finally {
//         await client.close();
//     }
// }

// const { MongoClient } = require("mongodb");

async function deleteOldUrls() {
    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        const db = client.db("yashind");
        const collegesCollection = db.collection("colleges");
        const pastExamsCollection = db.collection("past-exams");
        const studentsCollection = db.collection("students");

        const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

        // Find all colleges where at least one URL is expired
        const collegesWithOldUrls = await collegesCollection.find({
            "branches.urls.created_at": { $lt: expiryTime }
        }).toArray();

        for (const college of collegesWithOldUrls) {
            for (const branch of college.branches) {
                const expiredUrls = branch.urls.filter(url => url.created_at < expiryTime);

                for (const url of expiredUrls) {
                    // Count attempted and submitted from students collection
                    const students = await studentsCollection.find({ "url.url": url.url }).toArray();

                    let numStudentsAttempted = 0;
                    let numStudentsSubmitted = 0;

                    for (const student of students) {
                        const matchingUrls = student.url.filter(u => u.url === url.url);
                        numStudentsAttempted += matchingUrls.filter(u => u.attempted).length;
                        numStudentsSubmitted += matchingUrls.filter(u => u.submitted).length;
                    }

                    // Move expired URL to past-exams
                    await pastExamsCollection.insertOne({
                        collegeName: college.name,
                        branch: branch.branch_name,
                        total_students: branch.total_students,
                        url: url.url,
                        numStudentsAttempted,
                        numStudentsSubmitted,
                        timeOfUrlExpiry: new Date()
                    });
                }

                // Remove expired URLs from the colleges collection
                await collegesCollection.updateOne(
                    { _id: college._id, "branches.branch_name": branch.branch_name },
                    {
                        $pull: {
                            "branches.$.urls": { created_at: { $lt: expiryTime } }
                        }
                    }
                );
            }
        }

        console.log("Expired URLs moved to past-exams collection.");
    } finally {
        await client.close();
    }
}

//deleteOldUrls().catch(console.error);


// deleteOldUrls().catch(console.error);



const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));