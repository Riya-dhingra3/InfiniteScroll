import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const DebouncedInput: React.FC = () => {
  const [text, setText] = useState<string>(''); // Store the input value

  // Function that will be called after debounce
  const handleSearch = (value: string) => {
    console.log('Search value:', value);
  };

  // Debounced function
  const debouncedSearch = useCallback(
    debounce((value: string) => handleSearch(value), 500), // 500ms debounce delay
    [] // Empty array ensures debounce function is created once
  );

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    debouncedSearch(e.target.value); // Call debounced function
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Search..."
      />
      <p>Typed Text: {text}</p>
    </div>
  );
};

export default DebouncedInput;
