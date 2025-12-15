import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CustomExceptionFormat } from "../abstract/CustomExceptionFormat";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import { InputValidationWrapper, isInputValidationWrapperRecordValid } from "../abstract/InputValidationWrapper";
import { BACKEND_BASE_URL, EMAIL_REGEX, LOGIN_PATH, POPUP_FADE_DURATION } from "../helpers/constants";
import { fetchAny, isResponseError } from "../helpers/fetchUtils";
import { isBlank } from "../helpers/utils";
import { useFormInput } from "../hooks/useFormInput";
import { AppContext } from "./App";
import Button from "./helpers/Button";
import TextInput from "./helpers/TextInput";
import Login from "./routes/Login";


interface Props extends DefaultProps {
    /** Indicates whether this component's parent is content of the ```<Popup>``` or not.  */
    isParentPopupContent: boolean
}


/**
 * @since 0.0.1
 */
export default function SendPasswordResetMail({isParentPopupContent, ...props}: Props) {

    const {
        inputValue: email, 
        setInputValue: setEmail,
        triggerInputValidation: triggerEmailValidation,
        setTriggerInputValidation: setTriggerEmailValidation,
        inputRef: emailInputRef
    } = useFormInput<string, HTMLInputElement>("");
    
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    
    const { toast, replacePopupContent, hidePopup } = useContext(AppContext);

    const navigate = useNavigate();

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "SendPasswordResetMail", true);
    type InputName = "email";
    const inputValidationWrappers: Record<InputName, InputValidationWrapper[]> = {
        email: [
            {
                predicate: (email) => !isBlank(email),
                errorMessage: "Please put in your E-Mail",
                validateOnChange: true,
            },
            {
                predicate: (email) => email.match(EMAIL_REGEX) !== null,
                errorMessage: "Please put in a valid E-Mail",
                validateOnChange: false
            }
        ]
    };


    useEffect(() => {
        focusOnRender();
    }, []);


    async function handleFormSubmit(event: React.MouseEvent): Promise<void> {

        triggerFormValidation();

        if (!isFormValid())
            return;

        const url = `${BACKEND_BASE_URL}/app-user/send-reset-password-mail?to=${email}`;
        const jsonResponse = await fetchAny(url);

        if (isResponseError(jsonResponse)) {
            handleFormSubmitError(jsonResponse);
            return;
        }

        handleFormSubmitSuccess(jsonResponse);
    }


    function handleFormSubmitError(jsonResponse: CustomExceptionFormat): void {

        // should not happen
        if (!jsonResponse) {
            toast("Failed to send mail", "An unexpected error occurred. Please refresh the page", "error");
            return;
        }
        
        switch (jsonResponse.status) {
            case 400:
                toast("Failed to send mail", "An unexpected error occurred. Please refresh the page", "error");
                break;

            case 404:
                toast("Failed to send mail", "This E-Mail is not registered", "warn");
                break;

            case 409:
                toast("Failed to send mail", "This account has not been confirmed yet. Please click the 'Confirm' button in the confirmation E-Mail that we've sent you.", "warn");
                break;

            case 417:
                toast("Failed to send mail", "Cannot reset the password for this account. If you have registered using a third party provider like Google or Github, you can simply login using the buttons on the bottom of this page.", "warn");
                break;

            default:
                toast("Failed to send mail", "An unexpected error occurred. Please refresh the page", "error");
        }
    }


    function handleFormSubmitSuccess(jsonResponse: Response): void {

        toast("Mail sent", "We've sent you an E-Mail to reset your password. Please check the junk folder as well.", "success", 8000);

        hidePopup();
        
        if (isParentPopupContent)
            setTimeout(() => 
                // wait for this popup to be hidden
                replacePopupContent(<Login isPopupContent />), POPUP_FADE_DURATION * 1.5);
        else 
            navigate(LOGIN_PATH);
        
    }


    /**
     * Make all inputs validate their current value and possibly display an error message.
     */
    function triggerFormValidation(): void {

        setTriggerEmailValidation(!triggerEmailValidation);
    }


    function isFormValid(): boolean {

        return isInputValidationWrapperRecordValid(inputValidationWrappers, [email]);
    }


    function handleEmailInputChange(event): void {
        
        setEmail(event.target.value);
    }


    function submitOnEnter(event: React.KeyboardEvent): void {

        if (event.key === "Enter")
            submitButtonRef.current!.click();
    }


    function focusOnRender(): void {
        
        setTimeout(() => {
            emailInputRef.current!.focus();
        // wait for ```<Popup>``` render focus to resove
        }, 100);
    }


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            <h4 className="mb-4 pe-4">Send reset password E-Mail</h4>

            <TextInput
                className="SendPasswordResetMail-emailInput mb-3"
                placeholder="E-Mail"
                type="email"
                inputValidationWrappers={inputValidationWrappers.email}
                triggerValidation={triggerEmailValidation}
                ref={emailInputRef}
                onChange={handleEmailInputChange}
                onKeyDown={submitOnEnter}
            />

            <Button
                className="SendPasswordResetMail-submitButton fullWidth textCenter"
                type="submit"
                title="Send"
                ref={submitButtonRef}
                onClickPromise={handleFormSubmit}
                onKeyDown={submitOnEnter}
            >
                Send
            </Button>
                
            {children}
        </div>
    )
}
