import $ from "jquery";
import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultProps, { getCleanDefaultProps } from "../abstract/DefaultProps";
import "../assets/styles/Login.scss";
import { isResponseError } from "../helpers/fetchUtils";
import { isBlank, isNumberFalsy, setCsrfToken } from "../helpers/utils";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import Flex from "./helpers/Flex";
import TextInput from "./helpers/TextInput";
import Oauth2LoginButton from "./Oauth2LoginButton";
import { START_PAGE_PATH } from "../helpers/constants";


interface Props extends DefaultProps {

}


/**
 * @parent ```<App>```
 * @since 0.0.1
 */
export default function Login({...props}: Props) {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const { toast } = useContext(AppContext);
    const { fetchLogin } = useContext(AppFetchContext);
    
    const navigate = useNavigate();

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
            <div className="Login-contentContainer">
                <h1 className="Login-contentContainer-heading mb-4">Login</h1>

                <div className="Login-contentContainer-formContainer mb-5">
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
                        className="Login-contentContainer-formContainer-submitButton fullWidth mt-5"
                        ref={submitButtonRef}
                        onClickPromise={handleSubmit}
                    >
                        Login
                    </Button>
                </div>

                <hr />

                {/* 
                    TODO
                        center text properly

                 */}
                <div className="Login-contentContainer-oauth2Container mt-5">
                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-googleButton mb-3"
                        clientRegistrationId="google"
                        iconSrc={"/img/google.png"}
                    >
                        Login with Google
                    </Oauth2LoginButton>

                    <Oauth2LoginButton 
                        className="Login-contentContainer-oauth2Container-githubButton mb-3"
                        clientRegistrationId="github"
                        iconSrc={"/img/github.png"}
                    >
                        Login with GitHub
                    </Oauth2LoginButton>

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