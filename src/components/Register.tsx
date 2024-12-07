import React, { FormEvent, MouseEvent, useContext, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { InputValidationWrapper, isInputValidationWrapperRecordValid } from "../abstract/InputValidationWrapper";
import "../assets/styles/Register.scss";
import { BACKEND_BASE_URL, EMAIL_REGEX, getHeadTitleText, LOGIN_PATH, PASSWORD_REGEX } from "../helpers/constants";
import { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { getCurrentUrlWithoutWWW, isBlank } from "../helpers/utils";
import { AppContext } from "./App";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import Hr from "./helpers/Hr";
import TextInput from "./helpers/TextInput";
import Login from "./Login";
import Oauth2LoginButton from "./Oauth2LoginButton";
import PasswordAdvice from "./PasswordAdvice";
import ResendConfirmationMail from "./ResendConfirmationMail";
import Head from "./Head";


interface Props extends DefaultProps {

    /** Indicates whether this page is content of the ```<Popup>``` component. Default is ```false``` */
    isPopupContent?: boolean
}


/**
 * @since 0.0.1
 */
export default function Register({isPopupContent = false, ...props}: Props) {
    
    const [email, setEmail] = useState<string>("");
    const [triggerEmailValidation, setTriggerEmailValidation] = useState<boolean | undefined>(undefined);

    const [password, setPassword] = useState<string>("");
    const [triggerPasswordValidation, setTriggerPasswordValidation] = useState<boolean | undefined>(undefined);

    const [repeatPassword, setRepeatPassword] = useState<string>("");
    const [triggerRepeatPasswordValidation, setTriggerRepeatPasswordValidation] = useState<boolean | undefined>(undefined);

    const { toast, showPopup, replacePopupContent } = useContext(AppContext);

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
                predicate: (email) => !isBlank(email),
                errorMessage: "Please put in your E-Mail",
                validateOnChange: true
            },
            {
                predicate: (email) => email.match(EMAIL_REGEX) !== null,
                errorMessage: "Please put in a valid E-Mail",
                validateOnChange: false
            }
        ],
        password: [
            {
                predicate: (password) => !isBlank(password),
                errorMessage: "Please set a password",
                validateOnChange: true
            },
            {
                predicate: (password) => password.match(PASSWORD_REGEX) !== null,
                errorMessage: "Please set a password that complies with the requirements (*)",
                validateOnChange: false
            }
        ],
        repeatPassword: [
            {
                predicate: (repeatPassword) => !isBlank(repeatPassword),
                errorMessage: "Please repeat your password",
                validateOnChange: true
            },
            {
                predicate: (repeatPassword) => repeatPassword === password,
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
        const jsonResponse = await fetchAny(url, "post");

        if (isResponseError(jsonResponse)) {
            handleFormSubmitError(jsonResponse);
            return;
        }

        handleFormSubmitSuccess(jsonResponse);
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

        return isInputValidationWrapperRecordValid(inputValidationWrappers, [email, password, repeatPassword]);
    }


    function handleFormSubmitSuccess(response: Response | CustomExceptionFormat): void {

        if (!isPopupContent)
            navigate(LOGIN_PATH);

        else
            showPopup(<Login isPopupContent />);

        toast(
            "Successfully registered", 
            "We've sent you an E-Mail to confirm your account. Please make sure you check the junk folder as well.", 
            "success"
        );
    }


    function handleFormSubmitError(response: CustomExceptionFormat): void {

        if (response.status === 409)
            toast("Failed to register", "This E-Mail address is already registered. Please use a different one.", "warn");
        else
            toast("Failed to register", "", "error");
    }


    function handleLoginClick(event: MouseEvent): void {

        if (isPopupContent) {
            // don't navigate
            event.preventDefault();
            replacePopupContent(<Login isPopupContent />);
        }
    }


    function showResendConfirmationMailPopup(event: MouseEvent): void {

        showPopup(<ResendConfirmationMail isParentPopupContent={isPopupContent} />);
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
            <Head 
                headTagStrings={[
                    `<link rel='canonical' href='${getCurrentUrlWithoutWWW()}' />`,
                    `<title>${getHeadTitleText("Create account")}</title>`,
                    `<meta name="description" content="Create an account with your E-Mail address or just continue with Google, Github or Microsoft" />`
                ]}
                rendered={!isPopupContent}
            />

            <div className={`Register-contentContainer ${!isPopupContent && 'mt-5'}`}>
                <h2 className="Register-contentContainer-heading mb-4">Create account</h2>

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
                            useMobileView={isPopupContent}
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

                    {/* Resend email */}
                    <div className="Register-contentContainer-formContainer-linkContainer textCenter mb-5">
                        {/* Resend email */}
                        <div>
                            Didn't get the confirmation E-Mail? <br />
                            <Button 
                                className="hover Register-contentContainer-formContainer-linkContainer-linkButton"
                                onClick={showResendConfirmationMailPopup}
                            >
                                Resend confirmation email
                            </Button>
                        </div>
                    </div>
                    
                    {/* Login */}
                    <Button 
                        className="Register-contentContainer-formContainer-loginButton mb-2" 
                        tabIndex={-1}
                    >
                        <Link 
                            to={isPopupContent ? "" : LOGIN_PATH} 
                            className="Register-contentContainer-formContainer-loginButton-link simpleLink"
                            title="Login"
                            onClick={handleLoginClick}
                        >
                            Login
                        </Link>
                    </Button>
                </div>

                <Hr><span className="mx-1">Or</span></Hr>

                <div className="Register-contentContainer-oauth2Container mt-5">
                    {/* Google */}
                    <Oauth2LoginButton 
                        className="Register-contentContainer-oauth2Container-googleButton mb-3"
                        clientRegistrationId="google"
                        iconSrc={"/img/google.png"}
                    >
                        Register with Google
                    </Oauth2LoginButton>

                    {/* Github */}
                    <Oauth2LoginButton 
                        className="Register-contentContainer-oauth2Container-githubButton mb-3"
                        clientRegistrationId="github"
                        iconSrc={"/img/github.png"}
                    >
                        Register with GitHub
                    </Oauth2LoginButton>

                    {/* Microsoft */}
                    <Oauth2LoginButton 
                        className="Register-contentContainer-oauth2Container-azureButton mb-3"
                        clientRegistrationId="azure"
                        iconSrc={"/img/microsoft.png"}
                    >
                        Register with Microsoft
                    </Oauth2LoginButton>
                </div>
            </div>
                
            {children}
        </Flex>
    )
}