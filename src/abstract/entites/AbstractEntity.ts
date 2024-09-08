/**
 * Abstract class that is inherited by any entity.
 * 
 * @since 0.0.1
 */
export abstract class AbstractEntity {

    id?: number | null;

    created?: string;

    updated?: string;


    public constructor(id: number | null) {
        
        this.id = id;
    }
}