import $ from "jquery";
import React, { useContext } from "react";
import "./../assets/styles/NavBarProfileSection.scss";
import DefaultProps, { getCleanDefaultProps } from "./../abstract/DefaultProps";
import Link from "./helpers/CustomLink";
import Button from "./helpers/Button";
import { log } from "./../helpers/utils";
import { AppContext } from "./App";
import { PROFILE_PATH } from "../helpers/constants";
import CustomLink from "./helpers/CustomLink";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function NavBarProfileSection({...props}: Props) {

    const { id, className, style, children, ...otherProps } = getCleanDefaultProps(props, "NavBarProfileSection", true);

    const { getDeviceWidth, isLoggedIn } = useContext(AppContext);
    const { isMobileWidth } = getDeviceWidth();


    return (
        <div 
            id={id} 
            className={className}
            style={style}
            {...otherProps}
        >
            {
                isLoggedIn ?
                    // Profile icon
                    <CustomLink to={PROFILE_PATH} >
                        <img 
                            src="/img/account.png" 
                            alt="account" 
                            className="accountIcon invertColor hover" 
                            height={30}
                            title="Profile"
                        />
                    </CustomLink>
                :
                    <div>
                        {
                            isMobileWidth ?
                                <div className="textRight">
                                    {/* Register */}
                                    <Link to="/register" id="Register" className="whiteLink dontBreakText">Create Account</Link>
                                    <br />
                                    {/* Login */}
                                    <Link to="/login" className="whiteLink">Login</Link>
                                </div>
                            :
                                <div>
                                    {/* Register */}
                                    <Button 
                                        id="Register" 
                                        className="me-4 transition" 
                                        tabIndex={-1}
                                        _hover={{backgroundColor: "white"}} 
                                    >
                                        <Link to="/register" id="Register" className="whiteLink">
                                            Create Account
                                        </Link>
                                    </Button>
            
                                    {/* Login */}
                                    <Link to="/login" className="whiteLink hover dontSelectText">Login</Link>
                                </div>
                        }
                    </div>
            }  

            {children}
        </div>
    )
}