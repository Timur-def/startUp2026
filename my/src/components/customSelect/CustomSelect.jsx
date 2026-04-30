import { useState } from "react";
import "./CustomSelect.css";

export default function CustomSelect({ array, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="customSelectContainer">
      <div className="selectHeader" onClick={() => setIsOpen(!isOpen)}>
        <p className="optionHeader">{selectedOption ? selectedOption.title : "Выберите вариант..."}</p>
        <p className={`arrow ${isOpen ? "open" : ""}`}>◄</p>
      </div>

      {isOpen && (
        <div className="selectOptions">
          {array.map((element, i) => (
            <div
              key={i}
              className="optionItem"
              onClick={() => {
                setSelectedOption(element);
                setIsOpen(false);
                if (onChange) onChange(element);
              }}
            >
              {element.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
