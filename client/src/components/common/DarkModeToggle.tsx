import styled from "styled-components";
import React from "react";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => {
  return (
    <StyledWrapper>
      <label className="switch" title={isDarkMode ? "Light Mode" : "Dark Mode"}>
        <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
        <span className="slider" />
        <span className="clouds_stars" />
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .switch {
    font-size: 15px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    background-color: #2185d6;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;
    transition: 0.4s;
    border-radius: 30px;
    box-shadow: 0 0 0 rgba(33, 133, 214, 0);
    transition: all 0.4s ease;
  }
  .slider:hover {
    box-shadow: 0 0 15px rgba(33, 133, 214, 0.5);
  }

  .slider::before {
    position: absolute;
    content: "";
    height: 1.4em;
    width: 1.4em;
    border-radius: 50%;
    left: 10%;
    bottom: 15%;
    box-shadow: inset 15px -4px 0px 15px #fdf906;
    background-color: #28096b;
    transition: all 0.4s ease;
    transform-origin: center;
  }
  .slider:hover::before {
    transform: rotate(45deg);
  }
  .clouds_stars {
    position: absolute;
    content: "";
    border-radius: 50%;
    height: 8px;
    width: 8px;
    left: 70%;
    bottom: 50%;
    background-color: #fff;

    transition: all 0.3s;
    box-shadow: -10px 0 0 0 white, -5px 0 0 1.6px white, 0.3px 14px 0 white,
      -5.5px 14px 0 white;
    filter: blur(0.45px);
  }
  .switch input:checked ~ .clouds_stars {
    transform: translateX(-20px);
    height: 1.5px;
    width: 1.5px;
    border-radius: 50%;
    left: 80%;
    top: 15%;
    background-color: #fff;
    backdrop-filter: blur(8px);
    transition: all 0.3s;
    box-shadow: -6px 8px 0 #fff, 7px 12px 0 #fff, -15px 1px 0 #fff,
      -18px 8px 0 #fff, -6px 20px 0 #fff, -12px 22px 0 #fff;
    filter: none;
    animation: twinkle 2s infinite;
  }
  .switch input:checked + .slider {
    background-color: #28096b !important;
  }
  .switch input:checked + .slider::before {
    transform: translateX(100%);
    box-shadow: inset 8px -4px 0 0 #fff;
  }
  .switch input:checked + .slider:hover::before {
    transform: translateX(100%) rotate(-45deg);
  }
  @keyframes twinkle {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export default DarkModeToggle;
