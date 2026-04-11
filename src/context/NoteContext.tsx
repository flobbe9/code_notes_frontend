import { NoteEntity } from "@/abstract/entites/NoteEntity"
import { NoteInputEntity } from "@/abstract/entites/NoteInputEntity"
import { createContext, JSX } from "react"

export const NoteContext = createContext({
    noteEntity: {} as NoteEntity,
    setNoteEntity: (_noteEntity: NoteEntity) => {},

    noteInputs: [<></>],
    setNoteInputs: (_noteInputs: JSX.Element[]) => {},

    draggedNoteInputIndex: NaN as number, 
    setDraggedNoteInputIndex: (_index: number) => {},
    dragOverNoteInputIndex: NaN as number, 
    setDragOverNoteInputIndex: (_index: number) => {},

    createNoteInputByNoteInputType: (_noteInputEntity: NoteInputEntity, _focusOnRender = false) => {return <></>},

    /**
     * @param edited indicates whether the note entity should be considered edited (```true```) or not edited (hence saved, ``false```). Default is ```true```
     */
    updateNoteEdited: (_edited = true) => {},

    gotNewNoteInputs: false as boolean,
    setGotNewNoteInputs: (_newNoteInputs: boolean) => {},

    setAreNoteInputsExpanded: (_expanded: boolean) => {},

    isSaveButtonDisabled: true as boolean,
    clickSaveButton: (() => {}) as () => void
})
