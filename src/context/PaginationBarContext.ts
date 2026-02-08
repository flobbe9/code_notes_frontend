import { createContext } from "react";


export const PaginationBarContext = createContext({
    getCurrentPage: () => 1 as number,
    setCurrentPage: (_page: number) => {}
})