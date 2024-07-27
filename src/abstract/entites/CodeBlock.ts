import { AbstractBlock } from "./AbstractBlock";


/**
 * Class defining a code block entity as defined in backend. Extends {@link AbstractBlock}.
 * 
 * Includes both code blocks and code blocks with variables.
 * 
 * @since 0.0.1
 */
export class CodeBlock extends AbstractBlock {

    programmingLanguage: string;
}