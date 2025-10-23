
import { logWarn } from '../../helpers/logUtils';
import { isBlank } from '../../helpers/utils';
import { AppUserEntity } from '../entites/AppUserEntity';
import { NoteEntity } from '../entites/NoteEntity';
import { TagEntity } from '../entites/TagEntity';
import { TagEntityService } from './TagEntityService';


/**
 * @since 0.0.1
 */
export class AppUserService {
    
    /** List of app user fields that need to be encrypted before caching the app user. Non-string fields will be ignored */
    private static SENSITIVE_FIELDS: (keyof AppUserEntity)[] = ["email", "password", "oauth2Id"];
    

    /**
     * @returns instance with default values (mostly ```null```)
     */
    public static getDefaultInstance(): AppUserEntity {

        return {
            id: null, 
            created: "", 
            updated: "", 
            email: "", 
            oauth2Id: "",
            password: "", 
            role: "USER" ,
            tags: null, 
        };
    }
    

    public static clone(appUserEntity: AppUserEntity): AppUserEntity {

        return {
            id: appUserEntity.id,
            created: appUserEntity.created,
            updated: appUserEntity.updated,
            email: appUserEntity.email,
            oauth2Id: appUserEntity.oauth2Id,
            password: appUserEntity.password,
            role: appUserEntity.role,
            tags: appUserEntity.tags,
        }
    }

    /**
     * Adds given tag to ```appUserEntity.tags``` if not contains.
     * 
     * @param appUserEntity to add tags to
     * @param tagEntity to add to ```this.tags```
     */
    public static addTagEntity(appUserEntity: AppUserEntity, tagEntity: TagEntity): void {
        if (!appUserEntity.tags)
            appUserEntity.tags = [];

        if (!TagEntityService.contains(appUserEntity.tags, tagEntity))
            appUserEntity.tags = [...appUserEntity.tags, tagEntity]
    }

    /**
     * Remove given tag from ```appUserEntity.tags```.
     * 
     * @param appUserEntity to remove tags from
     * @param tag to remove 
     */
    public static removeTagEntity(appUserEntity: AppUserEntity, tag: TagEntity): void {

        if (!tag || !appUserEntity.tags)
            return;

        const tagIndex = TagEntityService.getTagIndex(appUserEntity.tags, tag);
        if (tagIndex === -1) {
            if (!isBlank(tag.name))
                logWarn(`Could not find index for tag '${tag.name}' in appUserEntity.tags`);
            
            return;
        }

        appUserEntity.tags.splice(tagIndex, 1);
    }


    /**
     * @param editedNoteEntities to check for given ```tagEntity```
     * @param tag to search
     * @returns ```true``` if given tag is present at least in one note of ```editedNoteEntities```, else ```false```
     */
    public static isTagEntityPresentInANote(editedNoteEntities: NoteEntity[], tag: TagEntity): boolean {

        if (!tag || !editedNoteEntities)
            return false;

        return !!editedNoteEntities
            .find(noteEntity => 
                !!(noteEntity.tags || [])
                    .find(tagEntity => 
                        tag.name === tagEntity.name))
    }


    /**
     * Remove tagEtities from given app user that are not used in any of given ```editedNoteEntities```.
     * 
     * @param appUserEntity to remove tags from
     * @param editedNoteEntities to check for tags
     */
    public static removeUnusedTags(appUserEntity: AppUserEntity | undefined | null, editedNoteEntities: NoteEntity[]): void {

        if (!appUserEntity || !appUserEntity.tags || !appUserEntity.tags.length || !editedNoteEntities)
            return;

        // case: no notes, therefore no tags
        if (!editedNoteEntities.length) {
            appUserEntity.tags = [];
            return;
        }

        const appUserTags = [...appUserEntity.tags];

        appUserTags
            .forEach((tagEntity, i) => {
                if (!this.isTagEntityPresentInANote(editedNoteEntities, tagEntity))
                    appUserEntity.tags?.splice(i, 1);
            });
    }
}