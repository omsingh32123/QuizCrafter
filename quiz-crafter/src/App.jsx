import React,{ useState, useEffect } from "react";
import Home from './Pages/Home/Home';
import Invalid from "./Pages/Invalid/Invalid";
function App() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const updateScreenWidth = () => {
    setScreenWidth(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener('resize', updateScreenWidth);
    return () => {
      window.removeEventListener('resize', updateScreenWidth);
    };
  }, []);
  if(screenWidth<600)
  {
    return(
      <Invalid />
    );
  }
  return (
      <Home />
  );
}

export default App;