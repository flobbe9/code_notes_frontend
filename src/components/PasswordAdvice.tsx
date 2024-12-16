import React, { useContext, useEffect, useRef, useState } from "react";
import { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperProps from "../abstract/HelperProps";
import "../assets/styles/PasswordAdvice.scss";
import { isBlank, setCssConstant } from "../helpers/utils";
import { AppContext } from "./App";
import Flex from "./helpers/Flex";
import HelperDiv from "./helpers/HelperDiv";


interface Props extends HelperProps {

    /** The password user input to validate */
    password: string,
    /** Forces the mobile view even if is desktop width. Default is false  */
    useMobileView?: boolean
}


/**
 * Small absolute window containing password rules.
 * 
 * Regex snippets are taken from ```PASSWORD_REGEX```.
 * 
 * @since 0.0.1
 */
export default function PasswordAdvice({password, useMobileView = false, ...props}: Props) {

    const [hasUpperCaseLetter, setHasUpperCaseLetter] = useState(false);
    const [hasLowerCaseLetter, setHasLowerCaseLetter] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSymbol, setHasSymbol] = useState(false);
    const [isValidLength, setIsValidLength] = useState(false);

    const { isDesktopWidth } = useContext(AppContext);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PasswordAdvice", true);

    const componentRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        initComponentWidth();

    }, [props.rendered]);


    useEffect(() => {
        validateAllCriteria();

    }, [password]);


    function validateAllCriteria(): void {

        updateHasUpperCaseLetter();
        updateHasLowerCaseLetter();
        updateHasNumber();
        updateHasSymbol();
        updateIsValidLength();
    }


    function updateHasUpperCaseLetter(): void {

        const regex = /[A-Z]/;
        setHasUpperCaseLetter(!isBlank(password) && password.match(regex) !== null);
    }
    

    function updateHasLowerCaseLetter(): void {

        const regex = /[a-z]/;
        setHasLowerCaseLetter(!isBlank(password) && password.match(regex) !== null);
    }
    

    function updateHasNumber(): void {

        const regex = /[0-9]/;
        setHasNumber(!isBlank(password) && password.match(regex) !== null);
    }
    

    function updateHasSymbol(): void {

        const regex = /[.,;_!#$%&@€*+=?´`"'\\/{|}()~^\-\])(]/;
        setHasSymbol(!isBlank(password) && password.match(regex) !== null);
    }
    

    function updateIsValidLength(): void {

        const regex = /^.{8,72}$/;
        setIsValidLength(!isBlank(password) && password.match(regex) !== null);
    }


    function initComponentWidth(): void {

        const componentWidth = componentRef.current!.offsetWidth;

        setCssConstant("passwordAdviceWidth", componentWidth + "px");
    }


    return (
        <HelperDiv 
            id={id} 
            className={className}
            style={{
                position: (isDesktopWidth && !useMobileView) ? "absolute" : undefined,
                ...style
            }}
            ref={componentRef}
            {...otherProps}
        >
            {/* Desktop */}
            <Flex 
                className="PasswordAdvice-desktopWidth" 
                flexWrap="nowrap" 
                verticalAlign="center"
                rendered={isDesktopWidth && !useMobileView}
            >
                <div className="PasswordAdvice-desktopWidth-contentContainer">
                    <div>Password must contain at least:</div>

                    <ul className="PasswordAdvice-desktopWidth-contentContainer-regexList">
                        <li className={`PasswordAdvice-regexList-item ${hasUpperCaseLetter ? "validRegex" : "invalidRegex"}`}>
                            1 upper case letter
                        </li>
                        <li className={`PasswordAdvice-regexList-item ${hasLowerCaseLetter ? "validRegex" : "invalidRegex"}`}>
                            1 lower case letter
                        </li>
                        <li className={`PasswordAdvice-regexList-item ${hasNumber ? "validRegex" : "invalidRegex"}`}>
                            1 number
                        </li>
                        <li className={`PasswordAdvice-regexList-item ${hasSymbol ? "validRegex" : "invalidRegex"}`}>
                            1 symbol
                        </li>
                        <li className={`PasswordAdvice-regexList-item ${isValidLength ? "validRegex" : "invalidRegex"}`}>
                            length of 8 - 72 characters
                        </li>
                    </ul>
                </div>

                <div className="PasswordAdvice-desktopWidth-arrowBox"></div>
            </Flex>

            {/* Tablet / Mobile */}
            <HelperDiv className="PasswordAdvice-nonDesktopWidth" rendered={!isDesktopWidth || useMobileView}>
                <div>* Password needs to contain at least</div> 
                <ul className="PasswordAdvice-nonDesktopWidth-contentContainer-regexList">
                    <li className={`PasswordAdvice-regexList-item ${hasUpperCaseLetter ? "validRegex" : "invalidRegex"}`}>
                        1 upper case letter
                    </li>
                    <li className={`PasswordAdvice-regexList-item ${hasLowerCaseLetter ? "validRegex" : "invalidRegex"}`}>
                        1 lower case letter
                    </li>
                    <li className={`PasswordAdvice-regexList-item ${hasNumber ? "validRegex" : "invalidRegex"}`}>
                        1 number
                    </li>
                    <li className={`PasswordAdvice-regexList-item ${hasSymbol ? "validRegex" : "invalidRegex"}`}>
                        1 symbol
                    </li>
                    <li className={`PasswordAdvice-regexList-item ${isValidLength ? "validRegex" : "invalidRegex"}`}>
                        length of 8 - 72 characters
                    </li>
                </ul>
            </HelperDiv>
                
            {children}
        </HelperDiv>
    )
}