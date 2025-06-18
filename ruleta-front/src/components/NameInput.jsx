import React, { useState } from "react";

function NameInput({ onAdd }) {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const lines = inputValue.split("\n");
      const lastLine = lines[lines.length - 1].trim();
      if (lastLine) {
        onAdd(lastLine);
        setInputValue(lines.slice(0, -1).join("\n"));
      }
    }
  };

  return (
    <div className="name-input">
      <textarea
        rows={2}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un nombre y presiona Enter."
        style={{ resize: "none", width: "100%" }}
      />
    </div>
  );
}

export default NameInput; 