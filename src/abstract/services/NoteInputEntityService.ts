import { NoteInputEntity } from "../entites/NoteInputEntity";
import { MAX_NOTE_INPUT_VALUE_LENGTH } from "../../helpers/constants";
import { AbstractService } from "./AbstractService";
import { logWarn } from "../../helpers/logUtils";


/**
 * @since 0.0.1
 */
export class NoteInputEntityService extends AbstractService {

    protected isValid(noteInputEntity: NoteInputEntity): boolean {

        if (!noteInputEntity)
            return false;

        return noteInputEntity.value.length <= MAX_NOTE_INPUT_VALUE_LENGTH;
    }
    

    protected handleInvalid(i: number, toast: CallableFunction): void {

        if (!toast) {
            logWarn("Invalid args");
            return;
        }

        toast("Note section invalid", `The content of note section number ${i + 1} is too long. Please shorten it a bit.`, "warn");
    }
}