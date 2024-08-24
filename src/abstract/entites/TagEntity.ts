import { AbstractEntity } from "./AbstractEntity";


/**
 * Class defining a tag object as defined in backend. 
 * Notes will get tags in order to improove search results. 
 * All tags are unique to the logged in ```AppUserEntity```.
 * 
 * Equivalent to the ```<TagInput />``` component
 * 
 * Extends {@link AbstractEntity}.
 * 
 * @since 0.0.1
 */
export class TagEntity extends AbstractEntity {

    name: string;


    public constructor() {
        super(-1);
    }
}