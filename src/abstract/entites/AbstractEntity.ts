/**
 * Abstract class that is inherited by any entity.
 * 
 * @since 0.0.1
 */
export abstract class AbstractEntity {

    id?: number | null;


    public constructor(id: number | null) {
        
        this.id = id;
    }
}