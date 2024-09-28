import $ from "jquery";
import React, { useContext, useRef, useState } from "react";
import "../assets/styles/Login.scss";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import Flex from "./helpers/Flex";
import TextInput from "./helpers/TextInput";
import Button from "./helpers/Button";
import { isBlank, isNumberFalsy, log } from "../helpers/utils";
import CryptoJSImpl from "../abstract/CryptoJSImpl";
import { AppContext } from "./App";
import { AppUserService } from "../services/AppUserService";
import { isResponseError } from "../helpers/fetchUtils";


interface Props extends DefaultProps {

}


/**
 * @parent ```<App>```
 * @since 0.0.1
 */
// TODO: remember me
export default function Login({...props}: Props) {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const { toast, fetchLogin } = useContext(AppContext);

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const submitButtonRef = useRef(null);

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "Login", true);


    /**
     * Fetch login and cache csrf token (encrypted) or toast error.
     */
    async function handleSubmit(): Promise<void> {

        if (isBlank(email) || isBlank(password)) {
            toast("Login failed", "Please fill out both email and password input.", "warn", 4000);
            return;
        }

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

        const cryptoJs = new CryptoJSImpl();
        const encryptedCsrfToken = cryptoJs.encrypt(csrfToken);

        window.localStorage.setItem(CSRF_TOKEN_LOCAL_STORAGE_KEY, encryptedCsrfToken);

        // dont navigate here, page reload is necessary for useLoggedIn hook to trigger
        window.location.href = "/";
    }


    function handleEmailInputChange(event: any): void {

        setEmail($(event.target).prop("value"));
    }

    
    function handlePasswordInputChange(event: any): void {

        setPassword($(event.target).prop("value"));
    }


    function handleTextInputKeyDown(event: any): void {

        if (isBlank(email) || isBlank(password))
            return;

        if (event.key === "Enter")
            $(submitButtonRef.current!).trigger("click");
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
            <div className="loginContentContainer">
                <h1 className="loginHeading mb-4">Login</h1>

                <div className="loginFormContainer">
                    {/* Email */}
                    <TextInput 
                        className="mb-3"
                        placeholder="Email"
                        name="email"
                        isValidPredicate={(value) => !isBlank(value)}
                        invalidMessage="Please put in your email address"
                        ref={emailInputRef}
                        onChange={handleEmailInputChange}
                        onKeyDown={handleTextInputKeyDown}
                    />
                    {/* Password */}
                    <TextInput 
                        placeholder="Password"
                        name="password"
                        type="password"
                        isValidPredicate={(value) => !isBlank(value)}
                        invalidMessage="Please put in your password"
                        ref={passwordInputRef}
                        onChange={handlePasswordInputChange}
                        onKeyDown={handleTextInputKeyDown}
                    />

                    {/* Submit */}
                    <Button 
                        className="loginSubmitButton fullWidth mt-5"
                        ref={submitButtonRef}
                        onClickPromise={handleSubmit}
                    >
                        Login
                    </Button>
                </div>

            </div>
                
            {children}
        </Flex>
    )
}


export const CSRF_TOKEN_LOCAL_STORAGE_KEY = "csrfToken";