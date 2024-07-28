import { AppUserRole } from "../AppUserRole";
import { AbstractEntity } from "./AbstractEntity";
import { Note } from "./Note";
import { Tag } from "./Tag";


/**
 * Class defining a user of this website (as defined in the backend). Extends {@link AbstractEntity}.
 * 
 * @since 0.0.1
 */
export class AppUser extends AbstractEntity {

    email: string;

    password: string;

    role: AppUserRole;

    tags?: Tag[] | null;

    notes?: Note[] | null;

    csrfToken?: string | null;
}