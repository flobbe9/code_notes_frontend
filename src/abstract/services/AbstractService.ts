import { log } from "../../helpers/utils";
import { AbstractEntity } from "../entites/AbstractEntity";


/**
 * @since 0.0.1
 */
export abstract class AbstractService {

    entities: AbstractEntity[];

    constructor(entities: AbstractEntity[]) {

        this.entities = entities;
    }


    abstract isEntityValid(entity: AbstractEntity): boolean;


    /**
     * Validates entities. Stops at first invalid one and toasts a message.
     * 
     * @param invalidHandler callback to execute on the first invalid tag. Passing the index as arg
     * @returns ```true``` if all entites are valid, else ```false```
     */
    areEntitiesValid(invalidHandler: (i: number) => void): boolean {

        for (let i = 0; i < this.entities.length; i++) {
            const tagEntity = this.entities[i];

            if (!this.isEntityValid(tagEntity)) {
                invalidHandler(i);
                return false;
            }
        }

        return true;
    }
}