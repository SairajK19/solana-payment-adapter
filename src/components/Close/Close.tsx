import React from "react";

export const Close = ({ handler }: { handler: any }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => handler(false)}
      id="close"
    >
      <circle cx="11.5" cy="11.5" r="11.5" fill="#221838" />
      <path
        d="M14.9938 7.125L11.5 10.6188L8.00625 7.125L7.125 8.00625L10.6188 11.5L7.125 14.9938L8.00625 15.875L11.5 12.3812L14.9938 15.875L15.875 14.9938L12.3812 11.5L15.875 8.00625L14.9938 7.125Z"
        fill="#D6D6D6"
      />
    </svg>
  );
};
