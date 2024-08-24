import { AbstractEntity } from "./AbstractEntity";
import { NoteInputEntity } from "./NoteInputEntity";
import { TagEntity } from "./TagEntity";


/**
 * Class defining a tag object as defined in backend. Extends {@link AbstractEntity}.
 * 
 * Equivalent to the ```<BlockContainer />``` component
 * 
 * @since 0.0.1
 */
export class NoteEntity extends AbstractEntity {

    title: string;

    noteInputEntitys: NoteInputEntity[] | null;

    tags: TagEntity[];


    constructor() {
        super(null);
    }
}