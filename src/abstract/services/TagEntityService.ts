import { MAX_TAG_INPUT_VALUE_LENGTH } from "../../helpers/constants";
import { logWarn } from "../../helpers/utils";
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
}