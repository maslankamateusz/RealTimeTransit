import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled }) => {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`px-6 py-3 my-1 rounded-md border-2 transition duration-200 ease-in-out
        ${
          disabled
            ? "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"
            : "bg-gray-700 text-white border-gray-700 hover:bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        }`}
    >
      {children}
    </button>
  );
};

export default Button;
