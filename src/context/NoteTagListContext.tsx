import { TagEntity } from "@/abstract/entites/TagEntity"
import { createContext } from "react"

export const NoteTagListContext = createContext({
    getTagElementIndex: (_key: string | number) => {return -1 as number},
    addTag: () => {},
    addTagEntity: (_tag: TagEntity) => {},
    removeTag: (_index: number) => {},
    removeTagEntity: (_index: number) => {},
    getNumBlankTags: () => {return 1 as number},
    tags: [<></>],
    noteTagEntities: [{}] as (TagEntity[] | null)
})
