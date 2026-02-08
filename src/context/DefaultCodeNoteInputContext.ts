import { createContext, RefObject } from "react";

export const DefaultCodeNoteInputContext = createContext({
    componentRef: {} as RefObject<HTMLDivElement | null>
});
