import { AbstractEntity } from "./AbstractEntity";
import { CodeBlock } from "./CodeBlock";
import { PlainTextBlock } from "./PlainTextBlock";
import { Tag } from "./Tag";


/**
 * Class defining a tag object as defined in backend. Extends {@link AbstractEntity}.
 * 
 * @since 0.0.1
 */
export class Note extends AbstractEntity {

    title: string;

    plainTextBlocks: PlainTextBlock[];

    codeBlocks: CodeBlock[];

    tags: Tag[];
}