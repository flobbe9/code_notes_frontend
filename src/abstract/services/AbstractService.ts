import { AbstractEntity } from "../entites/AbstractEntity";


/**
 * @since 0.0.1
 */
export abstract class AbstractService {

    /**
     * Will validate given entities fields, not including referenced entities.
     * 
     * @param entity to validate
     * @returns ```false``` if at least one field is invalid, else ```true```
     */
    protected abstract isValid(entity: AbstractEntity): boolean;


    /**
     * @param i index of invalid entity
     * @param toast exact same function from "App.tsx" in order to show small popup
     */
    protected abstract handleInvalid(i: number, toast: CallableFunction): void;


    /**
     * Validates given ```entities``` using {@link isValid} and will call {@link handleInvalid} if an entity is invalid. 
     * Stops at first invalid one and toasts a message.
     * 
     * @param invalidHandler callback to execute on the first invalid tag. Passing the index as arg
     * @param toast exact same function from "App.tsx" in order to show small popup
     * @returns ```true``` if all entites are valid, else ```false```
     */
    areEntitiesValid(entities: AbstractEntity[], toast: CallableFunction): boolean {

        if (!entities)
            return false;

        for (let i = 0; i < entities.length; i++) {
            const tagEntity = entities[i];

            if (!this.isValid(tagEntity)) {
                this.handleInvalid(i, toast);
                return false;
            }
        }

        return true;
    }
}