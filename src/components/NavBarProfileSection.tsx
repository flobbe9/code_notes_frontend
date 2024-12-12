import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { PROFILE_PATH } from "../helpers/constants";
import DefaultProps, { getCleanDefaultProps } from "./../abstract/DefaultProps";
import "./../assets/styles/NavBarProfileSection.scss";
import { AppContext } from "./App";
import { AppFetchContext } from "./AppFetchContextHolder";
import Button from "./helpers/Button";
import HelperDiv from "./helpers/HelperDiv";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function NavBarProfileSection({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "NavBarProfileSection", true);

    const { isMobileWidth, isConfirmLogout } = useContext(AppContext);
    const { isLoggedIn, isLoggedInUseQueryResult, logout } = useContext(AppFetchContext);

    
    if (!isLoggedInUseQueryResult.isFetched)
        return <></>;


    async function handleLogout(): Promise<void> {

        if (isConfirmLogout) {
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
            {/* Profile icon */}
            <HelperDiv rendered={isLoggedIn}>
                <Link to={PROFILE_PATH}>
                    <img 
                        src="/img/account.png" 
                        alt="account" 
                        className="accountIcon invertColor hover" 
                        height={30}
                        title="Profile"
                    />
                </Link>

                {/* TODO: move this somewhere else */}
                <Button
                    style={{color: "white"}}
                    onClickPromise={handleLogout}
                >
                    Logout
                </Button>
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