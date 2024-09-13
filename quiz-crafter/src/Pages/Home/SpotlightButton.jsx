import { useEffect, useRef } from "react";
import './SpotlightButton.css'; // Import the CSS file

const ButtonWrapper = () => {
  return (
    <div className="button-wrapper">
      <SpotlightButton />
    </div>
  );
};

const SpotlightButton = () => {
  const btnRef = useRef(null);
  const spanRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { width } = e.target.getBoundingClientRect();
      const offset = e.offsetX;
      const left = `${(offset / width) * 100}%`;

      spanRef.current.style.left = left;
    };

    const handleMouseLeave = () => {
      spanRef.current.style.left = '50%';
    };

    const buttonElement = btnRef.current;
    buttonElement.addEventListener("mousemove", handleMouseMove);
    buttonElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      buttonElement.removeEventListener("mousemove", handleMouseMove);
      buttonElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <button
      ref={btnRef}
      className="spotlight-button"
    >
      <span className="spotlight-button-text">Generate</span>
      <span
        ref={spanRef}
        className="spotlight-highlight"
      />
    </button>
  );
};

export default ButtonWrapper;
