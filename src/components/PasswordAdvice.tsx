import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "../assets/styles/PasswordAdvice.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import HelperDiv from "./helpers/HelperDiv";
import Flex from "./helpers/Flex";
import { isBlank, setCssConstant } from "../helpers/utils";
import { useHasComponentMounted } from "../hooks/useHasComponentMounted";


interface Props extends DefaultProps {

    /** The password user input to validate */
    password: string
}


/**
 * Small absolute window containing password rules.
 * 
 * Regex snippets are taken from ```PASSWORD_REGEX```.
 * 
 * @since 0.0.1
 */
export default function PasswordAdvice({password, ...props}: Props) {

    const [hasUpperCaseLetter, setHasUpperCaseLetter] = useState(false);
    const [hasLowerCaseLetter, setHasLowerCaseLetter] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSymbol, setHasSymbol] = useState(false);
    const [isValidLength, setIsValidLength] = useState(false);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "PasswordAdvice", true);

    const componentRef = useRef(null);

    const hasComponentMounted = useHasComponentMounted();


    useEffect(() => {
        if (hasComponentMounted)
            initComponentWidth();

    }, [hasComponentMounted]);


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

        const componentWidth = $(componentRef.current!).outerWidth() || 0;

        setCssConstant("registerPasswordAdviceWidth", componentWidth + "px");
    }


    return (
        <HelperDiv 
            id={id} 
            className={className}
            style={style}
            ref={componentRef}
            {...otherProps}
        >
            <Flex flexWrap="nowrap" verticalAlign="center">
                <div className="PasswordAdvice-contentContainer">
                    <div>Password must contain at least:</div>

                    <ul className="PasswordAdvice-contentContainer-regexList">
                        <li className={`PasswordAdvice-contentContainer-regexList-regexListItem ${hasUpperCaseLetter ? "validRegex" : "invalidRegex"}`}>
                            1 upper case letter
                        </li>
                        <li className={`PasswordAdvice-contentContainer-regexList-regexListItem ${hasLowerCaseLetter ? "validRegex" : "invalidRegex"}`}>
                            1 lower case letter
                        </li>
                        <li className={`PasswordAdvice-contentContainer-regexList-regexListItem ${hasNumber ? "validRegex" : "invalidRegex"}`}>
                            1 number
                        </li>
                        <li className={`PasswordAdvice-contentContainer-regexList-regexListItem ${hasSymbol ? "validRegex" : "invalidRegex"}`}>
                            1 symbol
                        </li>
                        <li className={`PasswordAdvice-contentContainer-regexList-regexListItem ${isValidLength ? "validRegex" : "invalidRegex"}`}>
                            length of 8 - 72 characters
                        </li>
                    </ul>
                </div>

                <div className="PasswordAdvice-arrowBox"></div>
            </Flex>
                
            {children}
        </HelperDiv>
    )
}