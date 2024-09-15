import { AppUserRole } from "../AppUserRole";
import { AbstractEntity } from "./AbstractEntity";
import { NoteEntity } from "./NoteEntity";
import { TagEntity } from "./TagEntity";


/**
 * Class defining a user of this website (as defined in the backend). Extends {@link AbstractEntity}.
 * 
 * @since 0.0.1
 */
export class AppUserEntity extends AbstractEntity {

    /** List of app user fields that need to be encrypted before caching the app user */
    public static SENSITIVE_FIELDS = ["email", "password", "csrfToken"];

    email: string;

    password: string;

    role: AppUserRole;

    tags?: TagEntity[] | null;

    notes?: NoteEntity[] | null;

    csrfToken?: string | null;


    public constructor(
        id: number | null,
        created: string | undefined,
        updated: string | undefined,
        email: string, 
        password: string, 
        role: AppUserRole, 
        tags: TagEntity[] | null, 
        notes: NoteEntity[] | null,
        csrfToken: string | null
    ) {
        super(id);
        this.created = created;
        this.updated = updated;
        this.email = email;
        this.password = password;
        this.role = role;
        this.tags = tags;
        this.notes = notes;
        this.csrfToken = csrfToken;
    }


    /**
     * Adds given tag to ```this.tags``` if not yet exists.
     * 
     * @param tagEntity to add to ```this.tags```
     */
    public addTag(tagEntity: TagEntity): void {

        if (!this.tags)
            this.tags = [];

        if (!this.isTagEntityPresentInANote(tagEntity))
            this.tags.push(tagEntity);
    }


    /**
     * Remove given tag from ```this.tags```.
     * 
     * @param tag to remove 
     */
    public removeTagEntity(tag: TagEntity): void {

        if (!tag || !this.tags)
            return;

        const tagIndex = this.tags.indexOf(tag);

        this.tags.splice(tagIndex, 1);
    }


    /**
     * @param tag to search
     * @returns ```true``` if given tag is present at least in one note of ```this.notes```, else ```false```
     */
    public isTagEntityPresentInANote(tag: TagEntity): boolean {

        if (!tag || !this.notes)
            return false;

        return !!this.notes
            .find(noteEntity => 
                !!(noteEntity.tags || [])
                    .find(tagEntity => 
                        tag.name === tagEntity.name))
    }


    /**
     * @returns instance with default values (mostly ```null```)
     */
    public static getDefaultInstance(): AppUserEntity {

        return new AppUserEntity(-1, new Date().toISOString(), new Date().toISOString(), "", "", AppUserRole.USER, null, null, null);
    }
    

    public static getInstance(appUserEntity: AppUserEntity): AppUserEntity {

        return new AppUserEntity(
            appUserEntity.id || null,
            appUserEntity.created,
            appUserEntity.updated,
            appUserEntity.email,
            appUserEntity.password,
            appUserEntity.role,
            appUserEntity.tags || null,
            appUserEntity.notes || null,
            appUserEntity.csrfToken || null
        )
    }
}