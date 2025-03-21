import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AptitudeQuiz.css";

const AptitudeQuiz = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [timeLeft, setTimeLeft] = useState(180);
    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quizSubmitted, setQuizSubmitted] = useState(false);


    // useEffect(() => {
    //     const handleVisibilityChange = () => {
    //       if (document.hidden) {
    //         alert("Tab switching is not allowed!");
    //         window.location.reload(); // Reload or take other action
    //       }
    //     };
      
    //     document.addEventListener("visibilitychange", handleVisibilityChange);
      
    //     return () => {
    //       document.removeEventListener("visibilitychange", handleVisibilityChange);
    //     };
    //   }, []);
      
    //     useEffect(() => {
    //       const enterFullscreen = () => {
    //         if (document.documentElement.requestFullscreen) {
    //           document.documentElement.requestFullscreen();
    //         } else if (document.documentElement.mozRequestFullScreen) {
    //           document.documentElement.mozRequestFullScreen();
    //         } else if (document.documentElement.webkitRequestFullscreen) {
    //           document.documentElement.webkitRequestFullscreen();
    //         } else if (document.documentElement.msRequestFullscreen) {
    //           document.documentElement.msRequestFullscreen();
    //         }
    //       };
      
    //       enterFullscreen();
      
    //       return () => {
    //         if (document.exitFullscreen) {
    //           document.exitFullscreen();
    //         }
    //       };
    //     }, []);

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (quizSubmitted || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, quizSubmitted]);

    async function fetchQuestions() {
        try {
            const res = await fetch("http://localhost:5000/api/questions");
            const data = await res.json();
            setQuestions(data);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    }

    function selectOption(index) {
        setSelectedOptions(prev => ({ ...prev, [currentQuestion]: index }));
    }

    function clearSelection() {
        setSelectedOptions(prev => {
            const copy = { ...prev };
            delete copy[currentQuestion];
            return copy;
        });
    }

    function nextQuestion() {
        if (currentQuestion < questions.length - 1)
            setCurrentQuestion(current => current + 1);
    }

    function prevQuestion() {
        if (currentQuestion > 0)
            setCurrentQuestion(current => current - 1);
    }
    const navigate = useNavigate();
    async function submitQuiz() {
        
        if (quizSubmitted) return;
        setQuizSubmitted(true);

        const userResponses = questions.map((_, i) =>
            selectedOptions[i] !== undefined ? selectedOptions[i] : null
        );

        const res = await fetch("http://localhost:5000/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userResponses })
        });

        const result = await res.json();
        //setScoreData(result);
        const confirmSubmit = window.confirm("Are you sure you want to submit?");
  
        if (confirmSubmit) 
        navigate("/next-quiz");
    }

    if (loading) return <h2>Loading...</h2>;
    if (!questions.length) return <h2>No questions available.</h2>;

    return (
        <div className="quiz-container">
            <div className="header">
                <h2 class="apti">Aptitude Quiz</h2>
                <div className="timer">
                    {`${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
                        .toString()
                        .padStart(2, "0")}`}
                </div>
            </div>

            {scoreData === null ? (
                <>
                    <h3>{questions[currentQuestion].question}</h3>
                    <div className="options">
                        {questions[currentQuestion].answers.map((opt, i) => (
                            <button
                                key={i}
                                className={
                                    selectedOptions[currentQuestion] === i
                                        ? "selected"
                                        : ""
                                }
                                onClick={() => selectOption(i)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="nav-buttons">
                        <button onClick={prevQuestion} disabled={currentQuestion === 0}>Previous</button>
                        <button onClick={clearSelection}>Clear</button>
                        <button onClick={nextQuestion} disabled={currentQuestion === questions.length - 1}>Next</button>
                        <button onClick={submitQuiz}>Submit</button>
                    </div>
                </>
            ) : (
                <div className="result-section">
                    <h2>Quiz Result</h2>
                    <p>Score: {scoreData.score} / {questions.length}</p>
                    <p>Attempted: {scoreData.attempted}</p>
                    <p>Unattempted: {scoreData.unattempted}</p>
                    <h3>Review:</h3>
                    <ul>
                        {scoreData.review.map((r, i) => (
                            <li key={i}>
                                <b>Q{i + 1}:</b> {r.question} <br />
                                <b>Selected:</b> {r.selected !== null ? r.options[r.selected] : "None"} <br />
                                <b>Correct:</b> {r.options[r.correct]} <br />
                                <b>Status:</b> {r.isCorrect ? "✔ Correct" : "❌ Incorrect"}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AptitudeQuiz;