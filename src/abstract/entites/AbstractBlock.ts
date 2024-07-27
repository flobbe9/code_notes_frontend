import { BlockType } from "../BlockType";
import { AbstractEntity } from "./AbstractEntity";


/**
 * Abstract class defining any block's fields. Extends {@link AbstractEntity}.
 * 
 * @since 0.0.1
 */
export abstract class AbstractBlock extends AbstractEntity {

    value: string;

    blockType: BlockType;
}