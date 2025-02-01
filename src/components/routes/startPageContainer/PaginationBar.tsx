import React, { createContext, Fragment, useContext, useEffect, useState } from "react";
import { ButtonProps } from "../../../abstract/ButtonProps";
import DefaultProps, { getCleanDefaultProps } from "../../../abstract/DefaultProps";
import "../../../assets/styles/PaginationBar.scss";
import { isNumberFalsy } from "../../../helpers/utils";
import { AppContext } from "../../App";
import Button from "../../helpers/Button";
import Flex from "../../helpers/Flex";
import HelperDiv from "../../helpers/HelperDiv";


interface Props extends DefaultProps {

    totalPages: number,
    currentPage: number
    setCurrentPage: (page: number) => void,
    /** The number of page numbers to display aside from ```1``` and ```totalPages```. Default is ```3``` */
    maxVisiblePageNumbers?: number,
    /** Defaults to ```1``` */
    mobileMaxVisiblePageNumbers?: number,
    /** Defaults to ```5``` */
    tabletMaxVisiblePageNumbers?: number,
    /** Will hide the whole component if ther's onely 1 page. Default is ```true``` */
    hideIfOnePage?: boolean
}

interface PageNumberProps extends ButtonProps {

    page: number
}


const defaultMaxVisiblePageNumbers = 3;
const defaultMobileMaxVisiblePageNumbers = 1;
const defaultTabletMaxVisiblePageNumbers = 5;


/**
 * @since 0.0.6
 */
export default function PaginationBar({
    totalPages,
    currentPage,
    setCurrentPage,
    maxVisiblePageNumbers = defaultMaxVisiblePageNumbers,
    mobileMaxVisiblePageNumbers = defaultMobileMaxVisiblePageNumbers,
    tabletMaxVisiblePageNumbers = defaultTabletMaxVisiblePageNumbers,
    hideIfOnePage = true,
    ...props
}: Props) {

    const componentName = "PaginationBar";
    const { children, className, ...otherProps } = getCleanDefaultProps(props, componentName);

    /** Never contains ```1``` or ```totalPages``` or ```...```. Only the numbers in between first and last page */
    const [pageNumbersInBetween, setPageNumbersInBetween] = useState<JSX.Element[]>([]);
    /** Make sure ```maxVisiblePageNumbers``` is not invalid. Use this instead of maxVisiblePageNumbers */
    const [cleanMaxVisiblePageNumbers, setCleanMaxVisiblePageNumbers] = useState(defaultMaxVisiblePageNumbers);

    const { isMobileWidth, isTableWidth, windowSize } = useContext(AppContext);

    const context = { currentPage, setCurrentPage };


    useEffect(() => {
        setCleanMaxVisiblePageNumbers(getCleanMaxVisiblePageNumbers());

    }, [maxVisiblePageNumbers, totalPages, windowSize]);


    useEffect(() => {
        setPageNumbersInBetween(mapPageNumbersInBetween());

    }, [currentPage, cleanMaxVisiblePageNumbers]);


    if (!areComponentPropsValid())
        return <Fragment />


    /**
     * Make sure that there's always at least ```maxVisiblePageNumbers``` in between ```1``` and ```n```.
     * The focused page should be in the middle of the visible page numbers if possible.
     * 
     * @returns array of ```<PageNumber>``` elements
     */
    function mapPageNumbersInBetween(): JSX.Element[] {

        // case: no numbers in between
        if (totalPages <= 2)
            return [];

        const maxHalf = Math.ceil(cleanMaxVisiblePageNumbers / 2);

        const pageNumbersInBetween: JSX.Element[] = [];

        let page: number;

        // case: one of the first numbers
        if (currentPage <= maxHalf)
            for (let i = 1; i <= cleanMaxVisiblePageNumbers; i++) {
                page = i + 1;
                pageNumbersInBetween.push(<PageNumber page={page} key={page} />)
            }
        
        // case: one of the last numbers
        else if (totalPages - currentPage <= maxHalf)
            for (let i = 1; i <= cleanMaxVisiblePageNumbers; i++) {
                page = totalPages - cleanMaxVisiblePageNumbers + i - 1;
                pageNumbersInBetween.push(<PageNumber page={page} key={page} />);
            }

        // case: something in the middle
        else {
            for (let i = 0; i < cleanMaxVisiblePageNumbers; i++) {
                if (cleanMaxVisiblePageNumbers % 2 !== 0) {
                    page = i + currentPage - Math.floor(cleanMaxVisiblePageNumbers / 2);
                    pageNumbersInBetween.push(<PageNumber page={page} key={page} />);

                } else {
                    page = i + currentPage - (cleanMaxVisiblePageNumbers / 2) + 1;
                    pageNumbersInBetween.push(<PageNumber page={page} key={i + currentPage - (cleanMaxVisiblePageNumbers / 2) + 1} />);
                }
            }
        }

        return pageNumbersInBetween;
    }


    function areComponentPropsValid(): boolean {

        const isInvalid = 
            isNumberFalsy(totalPages) || 
            isNumberFalsy(currentPage) || 
            currentPage < 1 ||
            totalPages < currentPage;

        // if (isInvalid)
        //     logDebug(`Failed to render PaginationBar. Invalid props (totalPages, currentPage): ${totalPages}, ${currentPage}`);

        return !isInvalid;
    }


    function goToNextPage(): void {

        if (currentPage === totalPages) 
            return;

        setCurrentPage(currentPage + 1);
    }


    function goToPrevPage(): void {

        if (currentPage === 1) 
            return;

        setCurrentPage(currentPage - 1);
    }


    function getCleanMaxVisiblePageNumbers(): number {

        const maxVisiblePageNumbers = getMaxVisiblePageNumbersForCurrentWidth();

        if (isNumberFalsy(maxVisiblePageNumbers) || maxVisiblePageNumbers < 0)
            return defaultMaxVisiblePageNumbers;

        if (maxVisiblePageNumbers > totalPages - 2)
            return totalPages - 2;

        return maxVisiblePageNumbers;
    }


    /**
     * @returns the ```maxVisiblePageNumbers``` prop depending on the current window width (not cleaned yet)
     */
    function getMaxVisiblePageNumbersForCurrentWidth(): number {

        if (isMobileWidth)
            return mobileMaxVisiblePageNumbers;

        if (isTableWidth)
            return tabletMaxVisiblePageNumbers;

        return maxVisiblePageNumbers;
    }


    function canDisplayAllPageNumbers(): boolean {

        // -2 because we always display page 1 and page n
        return cleanMaxVisiblePageNumbers >= totalPages - 2;
    }


    function displayLeftHandDots(): boolean {

        return !canDisplayAllPageNumbers() && currentPage - Math.ceil(cleanMaxVisiblePageNumbers / 2) > 1;
    }


    function displayRightHandDots(): boolean {

        if (cleanMaxVisiblePageNumbers % 2 === 0)
            return !canDisplayAllPageNumbers() && totalPages - (currentPage + (cleanMaxVisiblePageNumbers / 2) + 1) > 0;

        return !canDisplayAllPageNumbers() && totalPages - (currentPage + Math.ceil(cleanMaxVisiblePageNumbers / 2)) > 0;
    }


    return (
        <PaginationBarContext.Provider value={context}>
            <Flex 
                className={`${className} fullWidth`} 
                horizontalAlign="center" 
                verticalAlign="center" 
                rendered={!(hideIfOnePage && totalPages === 1)}
                {...otherProps}
            >
                {/* Left Arrow */}
                <Button 
                    className={`${componentName}-arrowButton hoverStrong`}
                    disabled={currentPage === 1} 
                    title={currentPage === 1 ? "" : "Previous page"}
                    onClick={goToPrevPage}
                >
                    <i className={`fa-solid fa-chevron-left`}></i>
                </Button>

                <Flex className={`${componentName}-numContainer`} horizontalAlign="center">
                    <PageNumber page={1} />

                    <HelperDiv className="dontSelectText" rendered={displayLeftHandDots()}>...</HelperDiv>

                    <Flex className={`${componentName}-numContainer-pageNumbersInBetweenContainer`}>{pageNumbersInBetween}</Flex>

                    <HelperDiv className="dontSelectText" rendered={displayRightHandDots()}>...</HelperDiv>

                    <PageNumber page={totalPages} rendered={totalPages > 1} />
                </Flex>

                {/* Right Arrow */}
                <Button 
                    className={`${componentName}-arrowButton hoverStrong`} 
                    disabled={currentPage === totalPages} 
                    title={currentPage === totalPages ? "" : "Next page"}
                    onClick={goToNextPage}
                >
                    <i className={`fa-solid fa-chevron-right`}></i>
                </Button>

                {children}
            </Flex>
        </PaginationBarContext.Provider>
    )
}


const PaginationBarContext = createContext({
    currentPage: 1 as number,
    setCurrentPage: (page: number) => {}
})
        

/**
 * Renders exactly one page number with a click event updating the ```currentPage```.
 * 
 * @returns @since 0.0.6
 */
function PageNumber({page, rendered, ...props}: PageNumberProps): JSX.Element {

    const componentName = "PageNumber";
    const { children, className, ...otherProps } = getCleanDefaultProps(props, componentName);

    const { currentPage, setCurrentPage } = useContext(PaginationBarContext);


    if (isNumberFalsy(page))
        return <Fragment />;


    return (
        <Button 
            className={`${className} ${page === currentPage && `${componentName}-active`} hoverStrong mx-2`}
            rendered={rendered}
            onClick={() => setCurrentPage(page)}
            {...otherProps}
        >
            {page}
        </Button>
    );
}