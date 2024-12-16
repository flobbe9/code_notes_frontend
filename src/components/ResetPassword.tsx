import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { InputValidationWrapper, isInputValidationWrapperRecordValid } from "../abstract/InputValidationWrapper";
import "../assets/styles/ResetPassword.scss";
import { BACKEND_BASE_URL, getHeadTitleText, LOGIN_PATH, PASSWORD_REGEX, RESET_PASSWORD_BY_TOKEN_PATH, RESET_PASSWORD_TOKEN_LOCAL_STORAGE_KEY, RESET_PASSWORD_TOKEN_URL_QUERY_PARAM, START_PAGE_PATH } from "../helpers/constants";
import { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { getCurrentUrlWithoutWWW, isBlank, replaceCurrentBrowserHistoryEntry } from "../helpers/utils";
import { AppContext } from "./App";
import Head from "./helpers/Head";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import TextInput from "./helpers/TextInput";
import PasswordAdvice from "./PasswordAdvice";
import { useFormInput } from "../hooks/useFormInput";


interface Props extends DefaultProps {

    /** Indicates whether this page is content of the ```<Popup>``` component. Default is ```false``` */
    isPopupContent?: boolean
}


/**
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function ResetPassword({isPopupContent = false, ...props}: Props) {
    
    const {
        inputValue: oldPassword, 
        setInputValue: setOldPassword,
        triggerInputValidation: triggerOldPasswordValidation,
        setTriggerInputValidation: setTriggerOldPasswordValidation,
        inputRef: oldPasswordRef
    } = useFormInput<string, HTMLInputElement>("");
        
    const {
        inputValue: newPassword, 
        setInputValue: setNewPassword,
        triggerInputValidation: triggerNewPasswordValidation,
        setTriggerInputValidation: setTriggerNewPasswordValidation,
        inputRef: newPasswordRef
    } = useFormInput<string, HTMLInputElement>("");

    const {
        inputValue: repeatNewPassword, 
        setInputValue: setRepeatNewPassword,
        triggerInputValidation: triggerRepeatNewPasswordValidation,
        setTriggerInputValidation: setTriggerRepeatNewPasswordValidation,
        inputRef: repeatNewPasswordRef
    } = useFormInput<string, HTMLInputElement>("");
    
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const [isResetByToken, setIsResetByToken] = useState(window.location.pathname === RESET_PASSWORD_BY_TOKEN_PATH);
    
    const { toast } = useContext(AppContext);
    
    const [urlQueryParams, setUrlSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    type InputName = "oldPassword" | "newPassword" | "repeatNewPassword";
    const inputValidationWrappers: Record<InputName, InputValidationWrapper[]> = {
        oldPassword: [
            {
                predicate: (oldPassword) => !isBlank(oldPassword),
                errorMessage: "Please put in your old password",
                validateOnChange: true,
            }
        ],
        newPassword: [
            {
                predicate: (newPassword) => !isBlank(newPassword),
                errorMessage: "Please choose a new password",
                validateOnChange: true
            },
            {
                predicate: (newPassword) => newPassword.match(PASSWORD_REGEX) !== null,
                errorMessage: "Please choose a password that complies with the requirements (*)",
                validateOnChange: false
            }
        ],
        repeatNewPassword: [
            {
                predicate: (repeatNewPassword) => !isBlank(repeatNewPassword),
                errorMessage: "Please repeat your new password",
                validateOnChange: true
            },
            {
                predicate: (repeatNewPassword) => repeatNewPassword === newPassword,
                errorMessage: "New password inputs must match exactly",
                validateOnChange: false
            }
        ]
    }

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "ResetPassword", true);

    
    useEffect(() => {
        handlePageLoadNoToken();
        retrieveTokenUrlQueryParam();
    }, []);


    /**
     * Validate form, fetch login and cache csrf token (encrypted) or toast error.
     */
    async function handleFormSubmit(): Promise<void> {

        triggerFormValidation();

        if (!isFormValid())
            return;

        const response = await fetchAny(getFetchUrl(), "post");

        if (isResponseError(response)) 
            handleFormSubmitFailure(response.status);

        else
            handleFormSubmitSuccess(response.status);
    }


    function getFetchUrl(): string {

        if (isResetByToken)
            return `${BACKEND_BASE_URL}/app-user/reset-password-by-token?newPassword=${newPassword}&token=${getToken()}`;

        return `${BACKEND_BASE_URL}/app-user/reset-password?newPassword=${newPassword}&oldPassword=${oldPassword}`;
    }


    function handleFormSubmitFailure(status: number): void {

        const summary = "Password reset failed";

        let isRemoveToken = false;

        switch (status) {
            case 400:
                isRemoveToken = true;
                toast(summary, "An unexpected error has occurred. Please try refreshing the page.", "error", 8000);
                break;

            case 404:
                isRemoveToken = true;
                toast(summary, "This password reset link has become invalid. Please request a new link.", "error");
                break;
                
            case 406:
                if (isResetByToken) {
                    isRemoveToken = true;
                    toast(summary, "This password reset link has become invalid. Please request a new link.", "error");
                } else
                    toast(summary, "Old password does not match your current password.", "error");
                break;

            case 409:
                isRemoveToken = true;
                toast(summary, "This account has not been confirmed yet. Please click the 'Confirm' button in the confirmation E-Mail that we've sent you.", "error");
                break;

            case 417:
                isRemoveToken = true;
                toast(summary, "Cannot reset the password for this account. If you have registered using a third party provider like Google or Github, please refer to their account settings instead.", "warn");
                break;

            default:
                toast(summary, "An unexpected error has occurred. Please try refreshing the page.", "error", 8000);
        }

        // case: no point in resubmitting the form, remove invalid token and redirect
        if (isRemoveToken) {
            window.localStorage.removeItem(RESET_PASSWORD_TOKEN_LOCAL_STORAGE_KEY);
            navigate(LOGIN_PATH);
        }
    }


    function handleFormSubmitSuccess(status: number): void {

        switch (status) {
            case 202:
                toast("Password reset failed", "This password reset link has become invalid. Please request a new link.", "error");
                break;

            default:
                toast("Password reset successfully", "", "success", 8000);
        }
            
        window.localStorage.removeItem(RESET_PASSWORD_TOKEN_LOCAL_STORAGE_KEY);
        navigate(LOGIN_PATH);
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

        if (!isResetByToken)
            setTriggerOldPasswordValidation(!triggerOldPasswordValidation);

        setTriggerNewPasswordValidation(!triggerNewPasswordValidation);
        setTriggerRepeatNewPasswordValidation(!triggerRepeatNewPasswordValidation);
    }


    function isFormValid(): boolean {

        if (isResetByToken)
            // pass 'fake' oldPassword to match requrired arg lentgh
            return isInputValidationWrapperRecordValid(inputValidationWrappers, ["oldPassword", newPassword, repeatNewPassword]);

        return isInputValidationWrapperRecordValid(inputValidationWrappers, [oldPassword, newPassword, repeatNewPassword]);
    }


    /**
     * Cache token value if present in url and remove from url.
     */
    function retrieveTokenUrlQueryParam(): void {

        if (!urlQueryParams.has(RESET_PASSWORD_TOKEN_URL_QUERY_PARAM) || !isResetByToken)
            return;

        // cache token
        const token = urlQueryParams.get(RESET_PASSWORD_TOKEN_URL_QUERY_PARAM);
        if (!isBlank(token))
            window.localStorage.setItem(RESET_PASSWORD_TOKEN_LOCAL_STORAGE_KEY, token!);
        
        replaceCurrentBrowserHistoryEntry();
    }


    /**
     * Redirect to start page if ```isResetByToken``` but no token is present.
     */
    function handlePageLoadNoToken(): void {

        if (!isResetByToken)
            return;

        if (!urlQueryParams.has(RESET_PASSWORD_TOKEN_URL_QUERY_PARAM) && isBlank(getToken())) {
            replaceCurrentBrowserHistoryEntry(START_PAGE_PATH);
            navigate(START_PAGE_PATH);
        }
    }


    function getToken(): string {

        return window.localStorage.getItem(RESET_PASSWORD_TOKEN_LOCAL_STORAGE_KEY) || "";
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
                    `<title>${getHeadTitleText("Reset password")}</title>`,
                ]}
                rendered={!isPopupContent}
            />
            
            <div className={`ResetPassword-contentContainer ${!isPopupContent && 'mt-5'}`}>
                <h2 className="ResetPassword-contentContainer-heading mb-4">Reset password</h2> 

                <div className="ResetPassword-contentContainer-formContainer mb-5">
                    {/* Old password */}
                    <TextInput 
                        className="mb-4"
                        placeholder="Old password"
                        name="old-password"
                        type="password"
                        inputValidationWrappers={inputValidationWrappers.oldPassword}
                        triggerValidation={triggerOldPasswordValidation}
                        required
                        ref={oldPasswordRef}
                        rendered={!isResetByToken}
                        onChange={(e) => setOldPassword((e.target as HTMLInputElement).value)}
                        onKeyDown={handleTextInputKeyDown}
                    />
                    
                    {/* New password */}
                    <TextInput 
                        className="ResetPassword-contentContainer-formContainer-newPassword mb-4"
                        placeholder="New password"
                        name="new-password"
                        type="password"
                        inputValidationWrappers={inputValidationWrappers.newPassword}
                        triggerValidation={triggerNewPasswordValidation}
                        required
                        ref={newPasswordRef}
                        onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
                        onKeyDown={handleTextInputKeyDown}
                    >
                        <PasswordAdvice 
                            password={newPassword} 
                            rendered={
                                // has hit submit at least once
                                triggerNewPasswordValidation !== undefined && 
                                // password pattern invalid
                                !inputValidationWrappers.newPassword[1].predicate(newPassword)
                            }
                            useMobileView={isPopupContent}
                        />
                    </TextInput>

                    {/* Repeat new password */}
                    <TextInput 
                        className="mb-4"
                        placeholder="Repeat new password"
                        name="repeat-new-password"
                        type="password"
                        inputValidationWrappers={inputValidationWrappers.repeatNewPassword}
                        triggerValidation={triggerRepeatNewPasswordValidation}
                        required
                        ref={repeatNewPasswordRef}
                        onChange={(e) => setRepeatNewPassword((e.target as HTMLInputElement).value)}
                        onKeyDown={handleTextInputKeyDown}
                    />

                    {/* Submit */}
                    <Button 
                        className="ResetPassword-contentContainer-formContainer-submitButton fullWidth mt-4 mb-3"
                        ref={submitButtonRef}
                        onClickPromise={handleFormSubmit}
                    >
                        Reset password
                    </Button>
                </div>
            </div>
                
            {children}
        </Flex>
    )
}