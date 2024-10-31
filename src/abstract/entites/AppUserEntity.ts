import { AppUserRole } from "../AppUserRole";
import { AbstractEntity } from "./AbstractEntity";
import { NoteEntity } from "./NoteEntity";
import { TagEntity } from "./TagEntity";


/**
 * Interface defining a user of this website (as defined in the backend). Extends {@link AbstractEntity}.
 * 
 * @since 0.0.1
 */
export interface AppUserEntity extends AbstractEntity {

    email: string;

    password: string;

    role: AppUserRole;

    tags?: TagEntity[] | null;
}