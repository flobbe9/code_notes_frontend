import { MAX_TAG_INPUT_VALUE_LENGTH } from "../../helpers/constants";
import { logWarn } from "../../helpers/logUtils";
import { TagEntity } from "../entites/TagEntity";
import { AbstractService } from "./AbstractService";


export class TagEntityService extends AbstractService {

    protected isValid(tagEntity: TagEntity): boolean {

        if (!tagEntity)
            return false;

        return tagEntity.name.length <= MAX_TAG_INPUT_VALUE_LENGTH;
    }


    protected handleInvalid(i: number, toast: CallableFunction): void {

        if (!toast) {
            logWarn("Invalid args");
            return;
        }

        toast(`Tag ${i + 1} invalid`, `Tags cannot be longer than ${MAX_TAG_INPUT_VALUE_LENGTH} characters.`, "warn");
    }


    public static getDefaultInstance(): TagEntity {

        return {
            id: -1,
            created: "",
            updated: "",
            name: ""
        }
    }


    public static clone(tagEntity: TagEntity): TagEntity {

        if (!tagEntity)
            return this.getDefaultInstance();

        return {
            id: tagEntity.id,
            created: tagEntity.created,
            updated: tagEntity.updated,
            name: tagEntity.name
        }
    }
    

    /**
     * @param tags to search ```tag``` in
     * @param tag to get index for
     * @returns index of given ```tag``` in given ```tags```, matching by ```tag.name```
     */
    public static getTagIndex(tags: TagEntity[] | undefined | null, tag: TagEntity | undefined | null): number {

        if (!tags || !tag)
            return -1;

        let tagIndex = -1;
        tags.forEach((existingTag, i) => {
            if (existingTag.name === tag.name) {
                tagIndex = i;
                return;
            }
        });

        return tagIndex;
    }


    public static contains(tags: TagEntity[] | undefined | null, tag: TagEntity | undefined | null): boolean {

        return this.getTagIndex(tags, tag) !== -1;
    }
}
