import { CustomExceptionFormat } from "@/abstract/CustomExceptionFormat"
import { AppUserEntity } from "@/abstract/entites/AppUserEntity"
import { NoteEntity } from "@/abstract/entites/NoteEntity"
import { SearchNoteResultDto } from "@/abstract/SearchNoteResultDto"
import { AppUserService } from "@/abstract/services/AppUserService"
import { DefinedUseQueryResult } from "@tanstack/react-query"
import { createContext } from "react"


export const AppFetchContext = createContext({
    appUserEntity: AppUserService.getDefaultInstance() as AppUserEntity,
    setAppUserEntity: (_appUserEntity: AppUserEntity) => {},
    appUserEntityUseQueryResult: {} as DefinedUseQueryResult<AppUserEntity>,
    fetchSaveAppUserEntity: async (_appUserToSave?: AppUserEntity, _decrypt = true) => {return {} as Promise<AppUserEntity | CustomExceptionFormat> },
    fetchLogin: async (_email: string, _password: string) => {return {} as Promise<CustomExceptionFormat | Response>},

    editedNoteEntities: [] as NoteEntity[],
    setEditedNoteEntities: (_editedNoteEntities: NoteEntity[]) => {},
    getNoteSearchPhrase: () => "" as string,
    setNoteSearchPhrase: (_phrase: string) => {},
    getNoteSearchTags: () => new Set<string>(),
    setNoteSearchTags: (_tags: Set<string>) => {},
    fetchSaveNoteEntity: async (_noteEntity: NoteEntity) => {return {} as Promise<NoteEntity | CustomExceptionFormat>},
    fetchSaveAllNoteEntities: async (_editedNoteEntities: NoteEntity[]) => {return {} as Promise<NoteEntity[] | CustomExceptionFormat>},
    fetchDeleteNoteEntity: async (_noteEntity: NoteEntity) => {return {} as Promise<Response | CustomExceptionFormat>},
    isFetchNoteEntitiesTakingLonger: false as boolean,
    notesUseQueryResult: {} as DefinedUseQueryResult<SearchNoteResultDto>,
    /** 1-based */
    getCurrentNotesPage: () => 1 as number,
    setCurrentNotesPage: (_page: number) => {},
    totalNotePages: 0 as number,

    isLoggedIn: false,
    isLoggedInUseQueryResult: {} as DefinedUseQueryResult<boolean>,

    logout: async () => {}
})