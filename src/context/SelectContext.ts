import { createContext } from "react";

export const SelectContext = createContext({
    selectedOptions: new Set<string>()
});
