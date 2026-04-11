import { useContext } from "react";
import { Link } from "react-router-dom";
import { PROFILE_PATH } from "../helpers/constants";
import DefaultProps, { getCleanDefaultProps } from "./../abstract/DefaultProps";
import { AppContext } from "@/context/AppContext";
import { AppFetchContext } from "@/context/AppFetchContext";
import Button from "./helpers/Button";
import ButtonWithSlideLabel from "./helpers/ButtonWithSlideLabel";
import Confirm from "./helpers/Confirm";
import HelperDiv from "./helpers/HelperDiv";


interface Props extends DefaultProps {

}


/**
 * Displays either the profile and logout button or a login and register button.
 * 
 * Displays a pending spinner while not sure if logged in or not.
 * 
 * @since 0.0.1
 */
export default function NavBarProfileSection({...props}: Props) {

    const componentName = "NavBarProfileSection";
    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, componentName, true);

    const { isMobileWidth, showPopup } = useContext(AppContext);
    const { editedNoteEntities, isLoggedIn, isLoggedInUseQueryResult, logout } = useContext(AppFetchContext);

    
    if (!isLoggedInUseQueryResult.isFetched)
        return <i className="fa-solid fa-circle-notch fa-lg rotating"></i>


    function handleLogout(): void {

        if (editedNoteEntities.length) {
            showPopup(
                <Confirm 
                    heading={<h2>Discard unsaved changes?</h2>}
                    message={"You have some unsaved notes. Your changes will be lost if you logout."}
                    confirmLabel="Logout"
                    rememberMyChoice
                    rememberMyChoiceLabel="Don't ask again"
                    rememberMyChoiceKey="discardChangesLogout"
                    onConfirm={logout}
                />
            )
            
        } else 
            logout();
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
                    className={`${componentName}-logoutButton`}
                    label="Logout"
                    onClick={handleLogout}
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
