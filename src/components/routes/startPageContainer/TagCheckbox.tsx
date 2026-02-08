import { KeyboardEvent, useContext, useRef } from "react";
import { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import { TagEntity } from "../../../abstract/entites/TagEntity";
import HelperProps from "../../../abstract/HelperProps";
import { AppFetchContext } from "../../AppFetchContextProvider";
import Checkbox from "../../helpers/Checkbox";
import { StartPageContainerContext } from "./StartPageContainer";


interface Props extends HelperProps {

    tagEntity: TagEntity
}


/**
 * @parent ```<StartPageSideBarTagList>```
 * @since 0.0.1
 */
export default function TagCheckbox({tagEntity, onKeyDown, ...props}: Props) {
    const { setNoteSearchTags, getNoteSearchTags } = useContext(AppFetchContext);
    const { setIsUpdateSideBarTagList } = useContext(StartPageContainerContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "TagCheckbox");

    const componentRef = useRef<HTMLDivElement>(null);


    function handleIsSelectedChange(): void {
        if (!getNoteSearchTags().has(tagEntity.name))
            addTagToUrlQueryParam();
        else
            removeTagFromUrlQueryParam();
    }

    /**
     * Add if not exists in "tags=..." list.
     */
    function addTagToUrlQueryParam(): void {
        const noteSearchTags = getNoteSearchTags();

        if (!noteSearchTags.has(tagEntity.name))
            setNoteSearchTags(new Set([...noteSearchTags, tagEntity.name]));
    }

    function removeTagFromUrlQueryParam(): void {
        const selectedTagEntityNames = new Set(getNoteSearchTags());
        selectedTagEntityNames.delete(tagEntity.name);

        setNoteSearchTags(new Set([...selectedTagEntityNames]));
    }

    function handleKeyDown(event: KeyboardEvent): void {
        if (onKeyDown)
            onKeyDown(event);

        if (event.key === "Enter")
            componentRef.current?.click();

        if (event.key === "Tab") {
            // update sort order
            setIsUpdateSideBarTagList(prev => !prev);
        }
    }

    return (
        <Checkbox 
            id={id} 
            className={className}
            style={style}
            dontHideChildren
            isChecked={getNoteSearchTags().has(tagEntity.name)}
            ref={componentRef}
            onKeyDown={handleKeyDown}
            onChange={handleIsSelectedChange}
            _checked={{borderColor: "var(--accentColor)"}}
            {...otherProps}
        >
            {tagEntity.name}

            {children}
        </Checkbox>
    )
}
