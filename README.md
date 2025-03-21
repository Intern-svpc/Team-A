# 🎓 College Admin Dashboard (React App)

## 📚 Project Overview

This is a **React App** project designed specifically for the **college-side admin dashboard**. The dashboard enables administrators to manage various college-related operations, including:

- **Registering Colleges**
- **Creating Branch-wise College Exams**
- **Viewing All Registered Colleges**
- **Displaying Respective Students Associated with Each College**

The project is structured into multiple folders, each serving a clear purpose for both frontend and backend functionality.

---

## 📁 Project Structure

The repository contains the following key directories and files:

```
project/
|
├── server/                # Backend server handling MongoDB connectivity
│   └── server.js          # Main Node.js server file
|
├── public/                # Contains the main frontend entry point
│   └── index.html         # Root HTML file for React app
|
├── src/                   # Contains all React components and pages
│   ├── components/        # Reusable UI components
│   ├── pages/             # Main pages like dashboard, registration, and exam link generator
│   ├── App.js             # Main React component
│   └── index.js           # Renders the App component
|
├── .gitignore             # Files and directories to be ignored by Git
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

---

## 🚀 Features

The admin dashboard includes the following features:

1. **College Registration**

   - Allows admin to register new colleges.
   - Captures college details like name, branches, and contact information.

2. **Exam Link Generator**

   - Generates branch-specific exam links.
   - Allows sharing links with students for online exams.

3. **Dashboard**

   - Displays all registered colleges.
   - Shows student lists for each college.

4. **MongoDB Integration**

   - Backend is connected to MongoDB to store college, student, and exam data.

---

## 🏗️ Installation and Setup

Follow these steps to set up the project locally:

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/college-admin-dashboard.git
   ```

2. **Navigate into the project directory:**

   ```bash
   cd college-admin-dashboard
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Set up MongoDB:**

   - Ensure MongoDB is running locally or provide your MongoDB Atlas connection string.
   - Update `server.js` with the correct MongoDB URI.

5. **Run the server:**

   ```bash
   node server/server.js
   ```

6. **Start the React app:**

   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

---

## 🔧 Technologies Used

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Package Manager:** npm

---

## 📦 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`feature/your-feature-name`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

Happy Coding! 🚀

