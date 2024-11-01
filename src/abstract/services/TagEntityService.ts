import { MAX_TAG_INPUT_VALUE_LENGTH } from "../../helpers/constants";
import { TagEntity } from "../entites/TagEntity";
import { AbstractService } from "./AbstractService";


export class TagEntityService extends AbstractService {

    tagEntities: TagEntity[] | null;


    constructor(tagEntities: TagEntity[] | null) {

        super(tagEntities || []);
        this.tagEntities = tagEntities;
    }


    isEntityValid(tagEntity: TagEntity): boolean {

        if (!tagEntity)
            return false;

        return tagEntity.name.length <= MAX_TAG_INPUT_VALUE_LENGTH;
    }
}