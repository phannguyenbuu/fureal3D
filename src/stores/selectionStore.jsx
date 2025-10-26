import React, { createContext, useContext, useState } from "react";

const SelectionContext = createContext();

export function SelectionProvider({ children }) {
  const [currentNodeSelection, setCurrentNodeSelection] = useState(null);
  return (
    <SelectionContext.Provider value={{ currentNodeSelection, setCurrentNodeSelection }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  return useContext(SelectionContext);
}
