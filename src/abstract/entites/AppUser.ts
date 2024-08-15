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


    public constructor(
        id: number,
        email: string, 
        password: string, 
        role: AppUserRole, 
        tags: Tag[] | null, 
        notes: Note[] | null,
        csrfToken: string | null
    ) {
        super(id);
        this.email = email;
        this.password = password;
        this.role = role;
        this.tags = tags;
        this.notes = notes;
        this.csrfToken = csrfToken;
    }


    /**
     * Remove given tag from ```this.tags```.
     * 
     * @param tag to remove 
     */
    public removeTag(tag: Tag): void {

        if (!tag || !this.tags)
            return;

        const tagIndex = this.tags.indexOf(tag);

        this.tags.splice(tagIndex, 1);
    }


    /**
     * @param tag to search
     * @returns ```true``` if given tag is present at least in one note of ```this.notes```, else ```false```
     */
    public isTagPresentInANote(tag: Tag): boolean {

        if (!tag || !this.notes)
            return false;

        return !!this.notes.find(note => 
                    !!note.tags.find(noteTag => 
                        tag.name === noteTag.name))
    }


    /**
     * @returns instance with default values (mostly ```null```)
     */
    public static getDefaultInstance(): AppUser {

        return new AppUser(-1, "", "", AppUserRole.USER, null, null, null);
    }
}