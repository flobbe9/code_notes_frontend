/**
 * Describes the position of the cursor inside an input or contenteditable.
 * 
 * @since 1.1.0
 */
export interface CursorPosition {
    /** 
     * The 0-based position of the cursor. For contenteditables it's the position relative to the current line, for 
     * other inputs its the position relative to the whole input value. 
     * 
     * If text is selected, `x` is the starting point (`anchorOffset`) of the selection.
     * 
     * Never negative.
     * 
     * Set to 0 in order not to move.
     */
    x: number;
    /** 
     * The 1-based line number of the cursor within the current input. 
     * 
     * If text is selected accross lines `y` is the line where the selection was started. 
     * 
     * Never negative.
     * 
     * Set to -1 in order not to move.
     */
    y: number;
    /** 
     * The number of chars currently selected. May be negative if chars were selected "backwards". 0 if no chars are selected.
     * 
     * This value is inaccurate for contenteditable divs if text is selected accross lines, as it only subtracts x-end-of-selection from x-start-of-selection.
     */
    selectedChars: number;
}