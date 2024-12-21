import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { PROFILE_PATH } from "../helpers/constants";
import DefaultProps, { getCleanDefaultProps } from "./../abstract/DefaultProps";
import "./../assets/styles/NavBarProfileSection.scss";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import HelperDiv from "./helpers/HelperDiv";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function NavBarProfileSection({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "NavBarProfileSection", true);

    const { isMobileWidth, hasAnyNoteBeenEdited } = useContext(AppContext);
    const { isLoggedIn, isLoggedInUseQueryResult, logout } = useContext(AppFetchContext);

    
    if (!isLoggedInUseQueryResult.isFetched)
        return <></>;


    async function handleLogout(): Promise<void> {

        if (hasAnyNoteBeenEdited) {
            const doLogout = window.confirm("Delete unsaved changes and logout?");
            if (!doLogout)
                return;
        }
        
        await logout();
    }


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            <HelperDiv rendered={isLoggedIn}>
                {/* Logout */}
                <ButtonWithSlideLabel
                    label="Logout"
                    style={{color: "white"}}
                    onClickPromise={handleLogout}
                    title={"Logout"}
                >
                    <i className="fa-solid fa-right-from-bracket mirrorX"></i>
                </ButtonWithSlideLabel>

                {/* Profile */}
                <Link to={PROFILE_PATH}>
                    <img 
                        src="/img/account.png" 
                        alt="account" 
                        className="accountIcon invertColor hover dontSelectText" 
                        height={30}
                        title="Profile"
                    />
                </Link>
            </HelperDiv>
            
            <HelperDiv rendered={!isLoggedIn}>
                <HelperDiv className="textRight" rendered={isMobileWidth}>
                    {/* Register */}
                    <Link to="/register" id="Register" className="whiteLink dontBreakText">Create Account</Link>
                    <br />

                    {/* Login */}
                    <Link to="/login" className="whiteLink">Login</Link>
                </HelperDiv>

                <HelperDiv rendered={!isMobileWidth}>
                    {/* Register */}
                    <Link to="/register" className="NavBarProfileSection-registerLink me-4">
                        <Button 
                            className="NavBarProfileSection-registerLink-button transition" 
                            tabIndex={-1}
                            _hover={{backgroundColor: "white"}} 
                        >
                            Create Account
                        </Button>
                    </Link>

                    {/* Login */}
                    <Link to="/login" className="whiteLink hover dontSelectText">Login</Link>
                </HelperDiv>
            </HelperDiv>

            {children}
        </div>
    )
}