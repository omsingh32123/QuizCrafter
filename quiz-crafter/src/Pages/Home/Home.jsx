import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "./Home.css";
import "./ChooseDifficulty.css";
import 'react-toastify/dist/ReactToastify.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ButtonWrapper from "./SpotlightButton";
import { ThreeDots  } from 'react-loader-spinner';

const Home = () => {
    const [selected, setSelected] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [Qcount, setQCount] = useState(null);
    const [visible, setVisible] = useState(false);
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const targetElementRef = useRef(null);
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API);

    const getResponseForGivenPrompt = async () => {
        try {
          setLoading(true)
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-exp-0827" });
          const inputValue = `Hey Gemini, write ${Qcount} multiple choice questions with answers of ${selected} difficulty, on the topic : ${prompt}. Give Respone very strictly in format : {Question_1:QUESTION_1; Option_1:OPTION_1; Option_2:OPTION_2; Option_3:OPTION_3; Option_4:OPTION_4; Answer:ASNWER};{Question_2:QUESTION_2; Option_1:OPTION_1; Option_2:OPTION_2; Option_3:OPTION_3; Option_4:OPTION_4; Answer:ASNWER}`;
          const result = await model.generateContent(inputValue);
          const response = result.response;
          const text = response.text();
          const decodedData = decodeResponse(text);
          setResult(decodedData);
          console.log(text);
          setLoading(false)
        }
        catch (error) {
          console.log(error)
          console.log("Something Went Wrong");
          setLoading(false)
        }
      };

      function decodeResponse(responseText) {
        // Split the response into individual question blocks
        const questionBlocks = responseText.split(/;\s*/).filter(Boolean);
      
        // Initialize an empty array to hold the result
        const result = [];
      
        // Temporary object to store data for each question
        let currentQuestion = {};
      
        questionBlocks.forEach(block => {
          // Remove leading and trailing curly braces
          const cleanedBlock = block.replace(/^{|}$/g, '');
      
          // Split the block into key-value pairs
          const parts = cleanedBlock.split(';');
      
          parts.forEach(part => {
            const [key, value] = part.split(':');
            if (key && value) {
              const trimmedKey = key.trim();
              const trimmedValue = value.trim();
      
              if (trimmedKey.startsWith('Question_')) {
                if (Object.keys(currentQuestion).length > 0) {
                  result.push(currentQuestion);
                  currentQuestion = {};
                }
                currentQuestion.question = trimmedValue;
              } else if (trimmedKey.startsWith('Option_')) {
                const optionIndex = trimmedKey.split('_')[1];
                currentQuestion[`Option_${optionIndex}`] = trimmedValue;
              } else if (trimmedKey === 'Answer') {
                currentQuestion.answer = trimmedValue;
              }
            }
          });
        });
      
        // Push the last question object into the result array
        if (Object.keys(currentQuestion).length > 0) {
          result.push(currentQuestion);
        }
      
        // Format the result array to include a structured object with options
        return result.map(item => {
          return {
            question: item.question,
            options: [
              item['Option_1'],
              item['Option_2'],
              item['Option_3'],
              item['Option_4']
            ],
            answer: item.answer
          };
        });
      }

      function parseResponse(responseText) {
        const questionBlocks = responseText.split(/(?=\{Question:)/).filter(Boolean);
        return questionBlocks.map(block => {
          const cleanedBlock = block.replace(/\{|\}/g, '');
          const blockParts = cleanedBlock.split(';').reduce((acc, part) => {
            const [key, value] = part.split(':');
            if (key && value) {
              acc[key.trim()] = value.trim();
            }
            return acc;
          }, {});
          return {
            question: blockParts['Question'],
            options: [
              blockParts['Option_1'],
              blockParts['Option_2'],
              blockParts['Option_3'],
              blockParts['Option_4']
            ],
            answer: blockParts['Answer']
          };
        });
      }
      const handleScrollToElement = () => {
        if (targetElementRef.current) {
          targetElementRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start", 
          });
        } else {
          console.error("Element not found to scroll into view.");
        }
      };
    const handleClick = (option) => {
        setSelected(option); 
    };
    const handlePromptChange = (event) => {
        if(event.target.value.length>150)
            return;
        setPrompt(event.target.value);
    };
    const handleCountChange = (event) => {
        if(event.target.value>30 || event.target.value<0)
            return;
        setQCount(event.target.value);
    };
    const handleSubmit = async () => {
        if(selected==null || prompt==null || prompt=="" || Qcount==null )
        {
            notifyError();
            return;
        }
        setVisible(true);
        handleScrollToElement();
        await getResponseForGivenPrompt();
        handleScrollToElement();
        setTimeout(() => {
            handleScrollToElement();
          }, 3000);
    };
    const notifyError = () => {
    toast("All fields are necessary!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
            backgroundColor: "#333", 
            color: "#ccc", 
          },
        });
    };


  return (
    <div className="scroll-container">
        <ToastContainer />
        <div className="home-container-1">
            <h1 className="home-text">
                <span className="home-word-l">INSTANT</span>
                <span className="home-word-r">QUIZ CRAFTER</span>
                <span className="home-word-l">FOR YOU</span>
            </h1>
            <div className="arrow-down"></div>
        </div>
        <div className="home-container-2">
            <div className="form-container">
                <h2 className="home-text"><span className="home-word-l2">
                Enter a Topic to Generate Questions</span></h2>
                <input className="styled-input" type="text" placeholder="Enter your text" 
                    onChange={handlePromptChange} value={prompt}/>
                <div className="input-container">
                    
                    <div className="button-group">
                        <button
                        className={`choose-button ${selected === "EASY" ? "selected" : ""}`}
                        onClick={() => handleClick("EASY")}
                        > EASY </button>
                        <button
                        className={`choose-button ${selected === "MEDIUM" ? "selected" : ""}`}
                        onClick={() => handleClick("MEDIUM")}
                        > MEDIUM </button>
                        <button
                        className={`choose-button ${selected === "HARD" ? "selected" : ""}`}
                        onClick={() => handleClick("HARD")}
                        > HARD </button>
                    </div>
                    <input className="inner-styled-input" type="number" placeholder="Number of Questions" 
                    onChange={handleCountChange} value={(Qcount) ? Qcount : ""}/>
                </div>
                <div className="button-class" onClick={handleSubmit} ><ButtonWrapper /></div>
                
            </div>
        </div>
        { visible && <div className="home-container-1" ref={targetElementRef}>
            <h2 className="home-text"><span className="home-word-l2">GENERATED QUIZ</span></h2>
            { (result && result.length>0) 
                ? <div className="questions-outer-block">
                    {result.map((item, index) => (
                        <QuestionCard
                            key={index}
                            number={index+1}
                            question={item.question}
                            options={item.options}
                            answer={item.answer}
                        />
                    ))}
                </div>
                : <div className="questions-outer-block">
                    <ThreeDots className="loader" color="white"  />
                </div>}
        </div>}
    </div>
  );
};
const QuestionCard = ({ number, question, options, answer }) => {
    const [showAns, setShowAns] = useState(false);
    const handleShowAnswer = () => {
        setShowAns(true);
    }
    if(!question)
        return null;
    return (
    <div className="result-div">
        <h3>{number}) {question}</h3>
        <ul>
            {options.map((option, index) => (
                <p key={index}>
                {String.fromCharCode(65 + index)}) {option}
                </p>
            ))}
        </ul>
        { (showAns) 
            ? <p><strong>Answer:</strong> {answer}</p>
            : <div className="show-ans-button" onClick={handleShowAnswer}>See Answer</div>
        }
    </div>
    );
};

export default Home;
