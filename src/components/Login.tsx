import $ from "jquery";
import React, { MouseEvent, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { InputValidationWrapper, isInputValidationWrapperRecordValid } from "../abstract/InputValidationWrapper";
import "../assets/styles/Login.scss";
import { CONFIRM_ACCOUNT_STATUS_URL_QUERY_PARAM, getHeadTitleText, HOURS_BEFORE_CONFIRMATION_TOKEN_EXPIRES, REGISTER_PATH, SEND_RESET_PASSWORD_MAIL_STATUS_PARAM, START_PAGE_PATH } from "../helpers/constants";
import { isResponseError } from "../helpers/fetchUtils";
import { getCurrentUrlWithoutWWW, isBlank, isNumberFalsy, replaceCurrentBrowserHistoryEntry, setCsrfToken, stringToNumber } from "../helpers/utils";
import { useFormInput } from "../hooks/useFormInput";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Head from "./Head";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import Hr from "./helpers/Hr";
import TextInput from "./helpers/TextInput";
import Oauth2LoginButton from "./Oauth2LoginButton";
import Register from "./Register";
import ResendConfirmationMail from "./ResendConfirmationMail";
import SendPasswordResetMail from "./SendPasswordResetMail";


interface Props extends DefaultProps {

    /** Indicates whether this page is content of the ```<Popup>``` component. Default is ```false``` */
    isPopupContent?: boolean
}


/**
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function Login({isPopupContent = false, ...props}: Props) {
    
    const {
        inputValue: email, 
        setInputValue: setEmail,
        triggerInputValidation: triggerEmailValidation,
        setTriggerInputValidation: setTriggerEmailValidation,
        inputRef: emailInputRef
    } = useFormInput<string, HTMLInputElement>("");
        
    const {
        inputValue: password, 
        setInputValue: setPassword,
        triggerInputValidation: triggerPasswordValidation,
        setTriggerInputValidation: setTriggerPasswordValidation,
        inputRef: passwordInputRef
    } = useFormInput<string, HTMLInputElement>("");

    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const { toast, hidePopup, showPopup, replacePopupContent } = useContext(AppContext);
    const { fetchLogin, isLoggedInUseQueryResult } = useContext(AppFetchContext);
    
    const navigate = useNavigate();

    const [urlQueryParams, setUrlSearchParams] = useSearchParams();
    
    type InputName = "email" | "password";
    const inputValidationWrappers: Record<InputName, InputValidationWrapper[]> = {
        email: [
            {
                predicate: (email) => !isBlank(email),
                errorMessage: "Please put in your E-Mail",
                validateOnChange: true,
            }
        ],
        password: [
            {
                predicate: (password) => !isBlank(password),
                errorMessage: "Please set a password",
                validateOnChange: true
            }
        ]
    }

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Login", true);

    
    useEffect(() => {
        handleConfirmAccountRedirect();
        handleRequestResetPasswordMailRedirect();
        
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
            handleFormFailure(loginResponse.status);
            return;
        }

        const csrfToken = await loginResponse.text();

        handleFormSuccess(csrfToken);
    }


    function handleFormFailure(status: number): void {

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
    function handleFormSuccess(csrfToken: string): void {

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

        return isInputValidationWrapperRecordValid(inputValidationWrappers, [email, password]);
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

        const statusCodeString = urlQueryParams.get(CONFIRM_ACCOUNT_STATUS_URL_QUERY_PARAM);

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


    /**
     * Handle redirect from backend to frontend, if a reset-password mail has been requested by clicking an external link.
     */
    function handleRequestResetPasswordMailRedirect(): void {

        if (isPopupContent)
            return;

        const statusCodeString = urlQueryParams.get(SEND_RESET_PASSWORD_MAIL_STATUS_PARAM);

        if (!statusCodeString)
            return;

        const statusCode = stringToNumber(statusCodeString);

        // case: invalid param value, clear query params
        if (statusCode === -1) {
            replaceCurrentBrowserHistoryEntry();
            navigate(window.location.pathname);
            return;
        }

        const summary = "Request a reset password mail";

        switch (statusCode) {
            case 200: 
                toast(summary, "We've sent you an E-Mail to reset your password. Please check the junk folder as well.", "success", 8000);
                break;
                
            case 404:
                toast(summary, "This E-Mail is not registered", "warn");
                break;

            case 409:
                toast(summary, "This account has not been confirmed yet. Please click the 'Confirm' button in the confirmation E-Mail that we've sent you.", "error");
                break;

            case 417:
                toast(summary, "Cannot reset the password for this account. If you have registered using a third party provider like Google or Github, please refer to their account settings instead.", "warn");
                break;

            default:
                toast(summary, "An unexpected error has occurred. Please try again by clicking 'Forgot my password'.", "error", 8000);
        }
        
        // clear query params from url and from history
        replaceCurrentBrowserHistoryEntry();
        navigate(window.location.pathname);
    }
    
    
    function showResendConfirmationMailPopup(event: MouseEvent): void {

        showPopup(<ResendConfirmationMail isParentPopupContent={isPopupContent} />);
    }

        
    function showSendPasswordResetMailPopup(event: MouseEvent): void {

        showPopup(<SendPasswordResetMail isParentPopupContent={isPopupContent} />);
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
                    `<title>${getHeadTitleText("Login")}</title>`,
                    `<meta name="description" content="Login with your credentials or just use Google, Github or Microsoft" />`
                ]}
                rendered={!isPopupContent}
            />
            
            <div className={`Login-contentContainer ${!isPopupContent && 'mt-5'}`}>
                <h2 className="Login-contentContainer-heading mb-4">Login</h2> 

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
                    
                    <div className="Login-contentContainer-formContainer-linkContainer textCenter mb-5">
                        {/* Send reset-password mail */}
                        <div>
                            <Button 
                                className="hover Login-contentContainer-formContainer-linkContainer-linkButton mb-3"
                                onClick={showSendPasswordResetMailPopup}
                            >
                                Forgot my password
                            </Button> 
                        </div>

                        {/* Resend email */}
                        <div>
                            Didn't get the confirmation E-Mail? <br />

                            <Button 
                                className="hover Login-contentContainer-formContainer-linkContainer-linkButton"
                                onClick={showResendConfirmationMailPopup}
                            >
                                Resend confirmation email
                            </Button>       
                        </div>                 
                    </div>

                    {/* Register */}
                    <Button 
                        className="Login-contentContainer-formContainer-createAccountButton mb-2" 
                        tabIndex={-1}
                    >
                        <Link 
                            to={isPopupContent ? "" : REGISTER_PATH} 
                            className="Login-contentContainer-formContainer-createAccountButton-link simpleLink"
                            title="Create account"
                            onClick={handleRegisterClick}
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