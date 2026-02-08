import { NoteEntity } from "@/abstract/entites/NoteEntity"
import { createContext, JSX } from "react"

export const StartPageContentContext = createContext({
    notes: [<></>],
    setNotes: (_notes: JSX.Element[]) => {},
    mapNoteEntitiesToJsx: (_noteEntities: NoteEntity[]): JSX.Element[] => [],

    setIsFocusFirstNote: (_focus: boolean) => {},

    createNoteByNoteEntity: (_noteEntity: NoteEntity, _focusOnRender = false) => {return <></>},
    isSearchingNotes: () => false as boolean,
    isEditingNotes: () => false as boolean
})
