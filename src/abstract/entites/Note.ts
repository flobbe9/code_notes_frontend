import { AbstractEntity } from "./AbstractEntity";
import { NoteInput } from "./NoteInput";
import { Tag } from "./Tag";


/**
 * Class defining a tag object as defined in backend. Extends {@link AbstractEntity}.
 * 
 * Equivalent to the ```<BlockContainer />``` component
 * 
 * @since 0.0.1
 */
export class Note extends AbstractEntity {

    title: string;

    noteInputs: NoteInput[] | null;

    tags: Tag[];
}