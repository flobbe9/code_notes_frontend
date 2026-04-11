import { createContext } from "react";


export const RouteContext = createContext({
    clearUrlQueryParams:(_removeFromHistory = true) => {}
})
