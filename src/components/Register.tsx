import React, { FormEvent, useContext, useRef, useState } from "react";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { InputValidationWrapper, isInputValidationWrapperRecordValid } from "../abstract/InputValidationWrapper";
import "../assets/styles/Register.scss";
import { BACKEND_BASE_URL, EMAIL_REGEX, LOGIN_PATH, PASSWORD_REGEX } from "../helpers/constants";
import { isBlank } from "../helpers/utils";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import Hr from "./helpers/Hr";
import TextInput from "./helpers/TextInput";
import Oauth2LoginButton from "./Oauth2LoginButton";
import PasswordAdvice from "./PasswordAdvice";
import { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import { AppContext } from "./App";
import { useNavigate } from "react-router-dom";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function Register({...props}: Props) {
    
    const [email, setEmail] = useState<string>("");
    const [triggerEmailValidation, setTriggerEmailValidation] = useState<boolean | undefined>(undefined);

    const [password, setPassword] = useState<string>("");
    const [triggerPasswordValidation, setTriggerPasswordValidation] = useState<boolean | undefined>(undefined);

    const [repeatPassword, setRepeatPassword] = useState<string>("");
    const [triggerRepeatPasswordValidation, setTriggerRepeatPasswordValidation] = useState<boolean | undefined>(undefined);

    const { toast } = useContext(AppContext);

    const navigate = useNavigate();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Register", true);

    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const repeatPasswordInputRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    
    type InputName = "email" | "password" | "repeatPassword";
    const inputValidationWrappers: Record<InputName, InputValidationWrapper[]> = {
        email: [
            {
                predicate: () => !isBlank(email),
                errorMessage: "Please put in your E-Mail",
                validateOnChange: true
            },
            {
                predicate: () => email.match(EMAIL_REGEX) !== null,
                errorMessage: "Please put in a valid E-Mail",
                validateOnChange: false
            }
        ],
        password: [
            {
                predicate: () => !isBlank(password),
                errorMessage: "Please set a password",
                validateOnChange: true
            },
            {
                predicate: () => password.match(PASSWORD_REGEX) !== null,
                errorMessage: "Please set a password that complies with the requirements below (*)",
                validateOnChange: false
            }
        ],
        repeatPassword: [
            {
                predicate: () => !isBlank(repeatPassword),
                errorMessage: "Please repeat your password",
                validateOnChange: true
            },
            {
                predicate: () => repeatPassword === password,
                errorMessage: "Password inputs must match exactly",
                validateOnChange: false
            }
        ]
    }
    

    function handleEmailInputChange(event: FormEvent<any>): void {

        setEmail(emailInputRef.current!.value);
    }


    function handlePasswordInputChange(event: FormEvent<any>): void {

        setPassword(passwordInputRef.current!.value);
    }
    

    function handleRepeatPasswordInputChange(event: FormEvent<any>): void {

        setRepeatPassword(repeatPasswordInputRef.current!.value);
    }
    

    function handleTextInputKeyDown(event: React.KeyboardEvent): void {

        if (event.key === "Enter")
            submitButtonRef.current!.click();
    }


    async function handleFormSubmit(event?: any): Promise<void> {

        triggerFormValidation();

        if (!isFormValid())
            return;

        const url = `${BACKEND_BASE_URL}/app-user/register?email=${email}&password=${password}`;
        const response = await fetchAny(url, "post");

        if (isResponseError(response)) {
            handleFormSubmitError(response);
            return;
        }

        handleFormSubmitSuccess(response);
    }


    /**
     * Make all inputs validate their current value and possibly display an error message.
     */
    function triggerFormValidation(): void {

        setTriggerEmailValidation(!triggerEmailValidation);
        setTriggerPasswordValidation(!triggerPasswordValidation);
        setTriggerRepeatPasswordValidation(!triggerRepeatPasswordValidation);
    }


    function isFormValid(): boolean {

        return isInputValidationWrapperRecordValid(inputValidationWrappers);
    }


    function handleFormSubmitSuccess(response: Response | CustomExceptionFormat): void {

        navigate(LOGIN_PATH);
    }


    function handleFormSubmitError(response: CustomExceptionFormat): void {

        toast("Failed to register", response.message, "error");
    }

    // TOOD: 
        // enter key not working
        // login / register links for popups
            // pass boolean as prop
                // either normal link or change popup content

    return (
        <Flex 
            id={id} 
            className={className}
            style={style}
            horizontalAlign="center"
            verticalAlign="center"
            {...otherProps}
        >
            <div className="Register-contentContainer">
                <h1 className="Register-contentContainer-heading mb-4">Create account</h1>

                <div className="Register-contentContainer-formContainer mb-5">
                    {/* Email */}
                    <TextInput 
                        className="Register-contentContainer-formContainer-email mb-4"
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
                        className="Register-contentContainer-formContainer-password mb-4"
                        placeholder="Password"
                        name="password"
                        type="password"
                        inputValidationWrappers={inputValidationWrappers.password}
                        triggerValidation={triggerPasswordValidation}
                        required
                        ref={passwordInputRef}
                        onChange={handlePasswordInputChange}
                        onKeyDown={handleTextInputKeyDown}
                    >
                        <PasswordAdvice 
                            password={password} 
                            rendered={
                                // has hit submit at least once
                                triggerPasswordValidation !== undefined && 
                                // password pattern invalid
                                !inputValidationWrappers.password[1].predicate(password)
                            }
                        />
                    </TextInput>

                    {/* Repeat password */}
                    <TextInput 
                        className="Register-contentContainer-formContainer-repeatPassword mb-2"
                        placeholder="Repeat password"
                        name="repeatPassword"
                        type="password"
                        inputValidationWrappers={inputValidationWrappers.repeatPassword}
                        triggerValidation={triggerRepeatPasswordValidation}
                        required
                        ref={repeatPasswordInputRef}
                        onChange={handleRepeatPasswordInputChange}
                        onKeyDown={handleTextInputKeyDown}
                    />

                    {/* Submit */}
                    <Button 
                        className="Register-contentContainer-formContainer-submitButton fullWidth mb-3 mt-4"
                        ref={submitButtonRef}
                        type="submit"
                        onClickPromise={handleFormSubmit}
                    >
                        Create account
                    </Button>

                    <Flex horizontalAlign="center">
                        {/* Login */}
                        <span>Already have an account? &nbsp;</span>
                        <span className="hover Register-contentContainer-formContainer-createAccountLink"> Login</span>
                    </Flex>
                </div>

                <Hr><span className="mx-1">Or</span></Hr>

                <div className="Register-contentContainer-oauth2Container mt-5">
                    {/* Google */}
                    <Oauth2LoginButton 
                        className="Register-contentContainer-oauth2Container-googleButton mb-3"
                        clientRegistrationId="google"
                        iconSrc={"/img/google.png"}
                    >
                        Continue with Google
                    </Oauth2LoginButton>

                    {/* Github */}
                    <Oauth2LoginButton 
                        className="Register-contentContainer-oauth2Container-githubButton mb-3"
                        clientRegistrationId="github"
                        iconSrc={"/img/github.png"}
                    >
                        Continue with GitHub
                    </Oauth2LoginButton>

                    {/* Microsoft */}
                    <Oauth2LoginButton 
                        className="Register-contentContainer-oauth2Container-azureButton mb-3"
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