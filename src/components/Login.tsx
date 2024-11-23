import $ from "jquery";
import React, { MouseEvent, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { InputValidationWrapper, isInputValidationWrapperRecordValid } from "../abstract/InputValidationWrapper";
import "../assets/styles/Login.scss";
import { CONFIRM_ACCOUNT_STATUS_PARAM, HOURS_BEFORE_CONFIRMATION_TOKEN_EXPIRES, REGISTER_PATH, START_PAGE_PATH } from "../helpers/constants";
import { isResponseError } from "../helpers/fetchUtils";
import { isBlank, isNumberFalsy, replaceCurrentBrowserHistoryEntry, setCsrfToken, stringToNumber } from "../helpers/utils";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import Hr from "./helpers/Hr";
import TextInput from "./helpers/TextInput";
import Oauth2LoginButton from "./Oauth2LoginButton";
import Register from "./Register";


interface Props extends DefaultProps {

    /** Indicates whether this page is content of the ```<Popup>``` component. Default is ```false``` */
    isPopupContent?: boolean
}


/**
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function Login({isPopupContent = false, ...props}: Props) {
    
    const [email, setEmail] = useState<string>("");
    const [triggerEmailValidation, setTriggerEmailValidation] = useState<boolean | undefined>(undefined);
    
    const [password, setPassword] = useState<string>("");
    const [triggerPasswordValidation, setTriggerPasswordValidation] = useState<boolean | undefined>(undefined);
    
    const { toast, hidePopup, showPopup, replacePopupContent } = useContext(AppContext);
    const { fetchLogin, isLoggedInUseQueryResult } = useContext(AppFetchContext);
    
    const navigate = useNavigate();

    const [urlQueryParams, setUrlSearchParams] = useSearchParams();
    
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

    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Login", true);

    
    useEffect(() => {
        handleConfirmAccountRedirect();
    }, []);


    /**
     * Validate form, fetch login and cache csrf token (encrypted) or toast error.
     */
    async function handleFormSubmit(): Promise<void> {

        triggerFormValidation();

        if (!isFormValid())
            return;

        const loginResponse = await fetchLogin(email, password);

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
            toast("Login failed", "", "error", 5000);

        else
            toast("Login failed", "An unexpected error occured. Please try refreshing the page.", "error", 5000);
    }


    /**
     * Encrypts and stores given csrf token to local storage. 
     * 
     * Either navigates to start page or (if ```isPopupContent```) just refreshes states
     * 
     * @param csrfToken to store
     */
    function handleLoginSuccess(csrfToken: string): void {

        setCsrfToken(csrfToken);

        if (!isPopupContent)
            // location change will refetch loggedin state
            navigate(START_PAGE_PATH);

        else {
            isLoggedInUseQueryResult.refetch(); 
            hidePopup();
        }
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


    function handleRegisterClick(event: MouseEvent): void {

        if (isPopupContent) {
            // dont navigate
            event.preventDefault();
            replacePopupContent(<Register isPopupContent />);
        }
    }


    /**
     * If page was visited because of redirect for "/confirm-account" then retrieve http status code
     * and toast.
     * 
     * Return if ```isPopupContent```.
     */
    function handleConfirmAccountRedirect(): void {

        if (isPopupContent)
            return;

        const statusCodeString = urlQueryParams.get(CONFIRM_ACCOUNT_STATUS_PARAM);

        if (!statusCodeString)
            return;

        const statusCode = stringToNumber(statusCodeString);

        // case: invalid param value, clear query params
        if (statusCode === -1) {
            replaceCurrentBrowserHistoryEntry();
            navigate(window.location.pathname);
            return;
        }

        switch (statusCode) {
            case 200: 
                toast("Account confirmed successfully", "You can continue by logging in.", "success", 4000);
                break;

            case 202:
                toast("Account confirmed already", "Nothing further to be done. You can continue by logging in.", "info");
                break;
            
            case 400:
                toast("Invalid confirmation link", "Please resend the confirmation mail and click the 'Confirm' button in it.", "error");
                break;

            case 404:
                toast("Invalid confirmation link", "Please resend the confirmation mail and click the 'Confirm' button in it.", "error");
                break;

            case 406:
                toast("Confirmation link expired", `Please resend the confirmation mail and click the 'Confirm' button within ${HOURS_BEFORE_CONFIRMATION_TOKEN_EXPIRES} hours.`, "error");
                break;

            default:
                toast("Failed to confirm account", "An unexpected error occurred. Please resend the confirmation mail and click the 'Confirm' button in it.", "error");
        }

        // clear query params from url and from history
        replaceCurrentBrowserHistoryEntry();
        navigate(window.location.pathname);
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
            <div className={`Login-contentContainer ${!isPopupContent && 'mt-5'}`}>
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

                    {/* Reset Password */}
                    {/* TODO */}
                    
                    {/* Resend email */}
                    <div className="Register-contentContainer-formContainer-linkContainer textCenter mb-5">
                        Already registered but didn't get a confirmation E-Mail?&nbsp;
                        <span className="hover Register-contentContainer-formContainer-linkContainer-link">Resend confirmation email</span>
                    </div>

                    {/* Register */}
                    <Button className="Login-contentContainer-formContainer-createAccountButton mb-2" onClick={handleRegisterClick}>
                        <Link 
                            to={isPopupContent ? "" : REGISTER_PATH} 
                            className="Login-contentContainer-formContainer-createAccountButton-link simpleLink"
                            title="Create account"
                            tabIndex={-1}
                        >
                            Create account
                        </Link>
                    </Button>
                </div>

                <Hr><span className="mx-1">Or</span></Hr>

                <div className="Login-contentContainer-oauth2Container mt-5">
                    {/* Google */}
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-googleButton mb-3"
                        clientRegistrationId="google"
                        iconSrc={"/img/google.png"}
                    >
                        Login with Google
                    </Oauth2LoginButton>

                    {/* Github */}
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-githubButton mb-3"
                        clientRegistrationId="github"
                        iconSrc={"/img/github.png"}
                    >
                        Login with GitHub
                    </Oauth2LoginButton>

                    {/* Microsoft */}
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-azureButton mb-3"
                        clientRegistrationId="azure"
                        iconSrc={"/img/microsoft.png"}
                    >
                        Login with Microsoft
                    </Oauth2LoginButton>
                </div>
            </div>
                
            {children}
        </Flex>
    )
}