import React, { useContext } from "react";
import "./../assets/styles/NavBarProfileSection.css";
import DefaultProps, { getCleanDefaultProps } from "./../abstract/DefaultProps";
import Link from "./helpers/CustomLink";
import Button from "./helpers/Button";
import { log } from "./../helpers/utils";
import { AppContext } from "./App";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function NavBarProfileSection({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "NavBarProfileSection", true);

    const { getDeviceWidth, isLoggedIn } = useContext(AppContext);
    const { isMobileWidth } = getDeviceWidth();


    return (
        <div 
            id={id} 
            className={className}
            style={style}
        >
            {
                isLoggedIn ?
                    // Profile icon
                    <img 
                        src="/img/account.png" 
                        alt="account" 
                        className="accountIcon invertColor hover" 
                        height={30}
                        title="Profile"
                    />
                :
                    <div>
                        {
                            isMobileWidth ?
                                <div className="textRight">
                                    {/* Register */}
                                    <Link to="/register" id="Register" className="whiteLink dontBreakText"><code>Create Account</code></Link>
                                    <br />
                                    {/* Login */}
                                    <Link to="/login" className="whiteLink"><code>Login</code></Link>
                                </div>
                            :
                                <div>
                                    {/* Register */}
                                    <Button id="Register" className="me-5 transition" _hover={{backgroundColor: "white"}} other={{tabIndex: -1}}>
                                        <Link to="/register" id="Register" className="whiteLink"><code>Create Account</code></Link>
                                    </Button>
            
                                    {/* Login */}
                                    <Link to="/login" className="whiteLink hover dontSelectText"><code>Login</code></Link>
                                </div>
                        }
                    </div>
            }  

            {children}
        </div>
    )
}