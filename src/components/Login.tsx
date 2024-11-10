import $ from "jquery";
import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { InputValidationWrapper, isInputValidationWrapperRecordValid } from "../abstract/InputValidationWrapper";
import "../assets/styles/Login.scss";
import { START_PAGE_PATH } from "../helpers/constants";
import { isResponseError } from "../helpers/fetchUtils";
import { isBlank, isNumberFalsy, setCsrfToken } from "../helpers/utils";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import Hr from "./helpers/Hr";
import TextInput from "./helpers/TextInput";
import Oauth2LoginButton from "./Oauth2LoginButton";


interface Props extends DefaultProps {

}


/**
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function Login({...props}: Props) {
    
    const [email, setEmail] = useState<string>("");
    const [triggerEmailValidation, setTriggerEmailValidation] = useState<boolean | undefined>(undefined);
    
    const [password, setPassword] = useState<string>("");
    const [triggerPasswordValidation, setTriggerPasswordValidation] = useState<boolean | undefined>(undefined);
    
    type InputName = "email" | "password";
    const inputValidationWrappers: Record<InputName, InputValidationWrapper[]> = {
        email: [
            {
                predicate: () => !isBlank(email),
                errorMessage: "Please put in your E-Mail",
                validateOnChange: true,
            }
        ],
        password: [
            {
                predicate: () => !isBlank(password),
                errorMessage: "Please set a password",
                validateOnChange: true
            }
        ]
    }

    const { toast } = useContext(AppContext);
    const { fetchLogin } = useContext(AppFetchContext);
    
    const navigate = useNavigate();

    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Login", true);


    /**
     * Validate form, fetch login and cache csrf token (encrypted) or toast error.
     */
    async function handleFormSubmit(): Promise<void> {

        triggerFormValidation();

        if (!isFormValid())
            return;

        const loginResponse = await fetchLogin(email, password);

        // case: fetch error
        if (isResponseError(loginResponse)) {
            handleLoginFailure(loginResponse.status);
            return;
        }

        const csrfToken = await loginResponse.text();

        handleLoginSuccess(csrfToken);
    }


    function handleLoginFailure(status: number): void {

        if (isNumberFalsy(status))
            return;

        if (status === 401)
            toast("Login failed", "Either wrong email or password.", "error", 5000);

        else
            toast("Login failed", "An unexpected error occured. Please try refreshing the page.", "error", 5000);
    }


    /**
     * Encrypts and stores given csrf token to local storage. Navigates to start page.
     * 
     * @param csrfToken to store
     */
    function handleLoginSuccess(csrfToken: string): void {

        setCsrfToken(csrfToken);

        navigate(START_PAGE_PATH);
    }


    function handleEmailInputChange(event: any): void {

        setEmail($(event.target).prop("value"));
    }

    
    function handlePasswordInputChange(event: any): void {

        setPassword($(event.target).prop("value"));
    }


    function handleTextInputKeyDown(event: any): void {

        if (event.key === "Enter") {
            event.preventDefault();
            submitButtonRef.current!.click();
        }
    }

    /**
     * Make all inputs validate their current value and possibly display an error message.
     */
    function triggerFormValidation(): void {

        setTriggerEmailValidation(!triggerEmailValidation);
        setTriggerPasswordValidation(!triggerPasswordValidation);
    }


    function isFormValid(): boolean {

        return isInputValidationWrapperRecordValid(inputValidationWrappers);
    }


    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            horizontalAlign="center"
            verticalAlign="center"
            {...otherProps}
        >
            <div className="Login-contentContainer">
                <h1 className="Login-contentContainer-heading mb-4">Login</h1> 

                <div className="Login-contentContainer-formContainer mb-5">
                    {/* Email */}
                    <TextInput 
                        className="mb-4"
                        placeholder="E-Mail"
                        name="email"
                        type="email"
                        inputValidationWrappers={inputValidationWrappers.email}
                        triggerValidation={triggerEmailValidation}
                        required
                        ref={emailInputRef}
                        onChange={handleEmailInputChange}
                        onKeyDown={handleTextInputKeyDown}
                    />
                    {/* Password */}
                    <TextInput 
                        className="mb-4"
                        placeholder="Password"
                        name="password"
                        type="password"
                        inputValidationWrappers={inputValidationWrappers.password}
                        triggerValidation={triggerPasswordValidation}
                        required
                        ref={passwordInputRef}
                        onChange={handlePasswordInputChange}
                        onKeyDown={handleTextInputKeyDown}
                    />

                    {/* Submit */}
                    <Button 
                        className="Login-contentContainer-formContainer-submitButton fullWidth mb-3"
                        ref={submitButtonRef}
                        onClickPromise={handleFormSubmit}
                    >
                        Login
                    </Button>

                    <Flex horizontalAlign="center">
                        {/* Register */}
                        <span className="hover Login-contentContainer-formContainer-createAccountLink">Create account</span>
                    </Flex>
                </div>

                <Hr><span className="mx-1">Or</span></Hr>

                <div className="Login-contentContainer-oauth2Container mt-5">
                    {/* Google */}
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-googleButton mb-3"
                        clientRegistrationId="google"
                        iconSrc={"/img/google.png"}
                    >
                        Continue with Google
                    </Oauth2LoginButton>

                    {/* Github */}
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-githubButton mb-3"
                        clientRegistrationId="github"
                        iconSrc={"/img/github.png"}
                    >
                        Continue with GitHub
                    </Oauth2LoginButton>

                    {/* Microsoft */}
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-azureButton mb-3"
                        clientRegistrationId="azure"
                        iconSrc={"/img/microsoft.png"}
                    >
                        Continue with Microsoft
                    </Oauth2LoginButton>
                </div>
            </div>
                
            {children}
        </Flex>
    )
}