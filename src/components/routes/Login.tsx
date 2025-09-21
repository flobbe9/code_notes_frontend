import React, { ChangeEvent, MouseEvent, useContext, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { InputValidationWrapper, isInputValidationWrapperRecordValid } from "../../abstract/InputValidationWrapper";
import "../../assets/styles/Login.scss";
import { CONFIRM_ACCOUNT_STATUS_URL_QUERY_PARAM, HOURS_BEFORE_CONFIRMATION_TOKEN_EXPIRES, OAUTH2_AUTH_LINK_GOOGLE, OAUTH2_LOGIN_ERROR_STATUS_URL_QUERY_PARAM, REGISTER_PATH, SEND_RESET_PASSWORD_MAIL_STATUS_PARAM } from "../../helpers/constants";
import { isResponseError } from "../../helpers/fetchUtils";
import { getHeadTitleText, setCsrfToken } from "../../helpers/projectUtils";
import { getCurrentUrlWithoutWWW, isBlank, isNumberFalsy, stringToNumber } from "../../helpers/utils";
import { useFormInput } from "../../hooks/useFormInput";
import { EDITED_NOTES_KEY } from "../../hooks/useNotes";
import { RouteContext } from "../RouteContextHolder";
import { AppContext } from "./../App";
import { AppFetchContext } from "./../AppFetchContextProvider";
import Button from "./../helpers/Button";
import Flex from "./../helpers/Flex";
import Head from "./../helpers/Head";
import Hr from "./../helpers/Hr";
import TextInput from "./../helpers/TextInput";
import Oauth2LoginButton from "./../Oauth2LoginButton";
import ResendConfirmationMail from "./../ResendConfirmationMail";
import SendPasswordResetMail from "./../SendPasswordResetMail";
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
    const { clearUrlQueryParams } = useContext(RouteContext);
    const { fetchLogin, isLoggedInUseQueryResult, editedNoteEntities } = useContext(AppFetchContext);
    
    const [urlQueryParams] = useSearchParams();
    
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
        handleOauth2ErrorRedirect();
        
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
     * Either navigates to last page or (if ```isPopupContent```) just refreshes states
     * 
     * @param csrfToken to store
     */
    function handleFormSuccess(csrfToken: string): void {

        setCsrfToken(csrfToken);

        if (!isPopupContent)
            window.history.back();

        else {
            isLoggedInUseQueryResult.refetch(); 
            hidePopup();
        }
    }


    function handleEmailInputChange(event: ChangeEvent): void {

        setEmail((event.target as HTMLInputElement).value);
    }

    
    function handlePasswordInputChange(event: ChangeEvent): void {

        setPassword((event.target as HTMLInputElement).value);
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
            clearUrlQueryParams();
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

        clearUrlQueryParams();
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
            clearUrlQueryParams();
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
        
        clearUrlQueryParams();
    }


    function handleOauth2ErrorRedirect(): void {

        if (isPopupContent)
            return;

        const statusCodeString = urlQueryParams.get(OAUTH2_LOGIN_ERROR_STATUS_URL_QUERY_PARAM);

        if (!statusCodeString)
            return;

        const statusCode = stringToNumber(statusCodeString);

        // case: invalid param value, clear query params
        if (statusCode === -1) {
            clearUrlQueryParams();
            return;
        }

        const summary = "Failed to register";

        switch (statusCode) {
            case 406:
                toast(summary, "An account with this E-Mail address is already registered, using a different third-party provider.", "warn");
                break;

            default:
                toast(summary, "An unexpected error occurred. Please try again.", "error", 8000);
        }

        clearUrlQueryParams();
    }
    
    
    function showResendConfirmationMailPopup(): void {

        showPopup(<ResendConfirmationMail isParentPopupContent={isPopupContent} />);
    }

        
    function showSendPasswordResetMailPopup(): void {

        showPopup(<SendPasswordResetMail isParentPopupContent={isPopupContent} />);
    }


    function handleOauth2ButtonClick(): void {

        localStorage.setItem(EDITED_NOTES_KEY, JSON.stringify(editedNoteEntities));
        // TODO: continue here
        // window.open(OAUTH2_AUTH_LINK_GOOGLE, "test", "popup=true,width=500,height=700")
        // open
        // authenticate
        // close
        // redirect to home
    }


    return (
        <Flex 
            id={id} 
            className={`${className} ${!isPopupContent && " mb-4"}`}
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
                        onClick={handleOauth2ButtonClick}
                    >
                        Login with Google
                    </Oauth2LoginButton>

                    {/* Github */}
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-githubButton mb-3"
                        clientRegistrationId="github"
                        iconSrc={"/img/github.png"}
                        onClick={handleOauth2ButtonClick}
                    >
                        Login with GitHub
                    </Oauth2LoginButton>

                    {/* Microsoft */}
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-azureButton mb-3"
                        clientRegistrationId="azure"
                        iconSrc={"/img/microsoft.png"}
                        onClick={handleOauth2ButtonClick}
                    >
                        Login with Microsoft
                    </Oauth2LoginButton>
                </div>
            </div>
                
            {children}
        </Flex>
    )
}