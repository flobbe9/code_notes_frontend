import { forwardRef, Ref, useContext } from "react";
import { ButtonProps } from "../../../abstract/ButtonProps";
import { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { NoteEntity } from "../../../abstract/entites/NoteEntity";
import { isResponseError } from "../../../helpers/fetchUtils";
import { isNumberFalsy } from '../../../helpers/utils';
import { AppContext } from "../../App";
import { AppFetchContext } from "../../AppFetchContextProvider";
import Button from "../../helpers/Button";
import Login from "../Login";
import { NoteEntityService } from "../../../abstract/services/NoteEntityService";


interface Props extends ButtonProps {

}


/**
 * @since 0.0.1
 */
export default forwardRef(function SaveAllNotesButton({...props}: Props, ref: Ref<HTMLButtonElement>) {

    const { toast, showPopup } = useContext(AppContext);
    const { editedNoteEntities, setEditedNoteEntities, isLoggedIn, fetchSaveAllNoteEntities, notesUseQueryResult } = useContext(AppFetchContext);

    const {className, children, ...otherProps} = getCleanDefaultProps(props, "SaveAllNotesButton", true);


    /**
     * Fetch method will validate and toast. Refetch after success
     */
    async function handleSave(): Promise<void> {
        if (!isLoggedIn) {
            showPopup(<Login isPopupContent />);
            return;
        }

        const editedNoteEntitiesAndIndices: Record<number, NoteEntity> = getEditedNoteEntities();

        const jsonResponse = await fetchSaveAllNoteEntities(Object.values(editedNoteEntitiesAndIndices));
        if (isResponseError(jsonResponse))
            // error handled by fetch method
            return;

        notesUseQueryResult.refetch();

        toast("Save all notes", "All notes saved successfully", "success", 4000);

        // mark all notes as "not-edited" for confirm popup to be removed
        setEditedNoteEntities([]);
    }


    /**
     * @returns object formatted like <noteEntityIndex, noteEntity>. Contains the editedNoteEntities matching ```editedNoteEntities``` or having no id (not beeing saved once yet)
     */
    function getEditedNoteEntities(): Record<number, NoteEntity> { 

        if (!editedNoteEntities || !editedNoteEntities.length)
            return [];

        const editedNoteEntitiesAndIndices: Record<number, NoteEntity> = {};

        editedNoteEntities
            .forEach((noteEntity, i) => {
                if (isNumberFalsy(noteEntity.id) || NoteEntityService.includesById(editedNoteEntities, noteEntity.id!))
                    editedNoteEntitiesAndIndices[i] = noteEntity;
            });

        return editedNoteEntitiesAndIndices;
    }
    

    return (
        <Button 
            className={`${className} hover`} 
            title={props.disabled ? "No changes yet" : "Save all edited notes (Ctr + Shift + S)"}
            ref={ref}
            onClickPromise={handleSave}
            {...otherProps}
        >
            <i className="fa-solid fa-floppy-disk me-2"></i> <span>Save all changes</span>

            {children}
        </Button>
    )
})