import React from "react";
import "../../assets/styles/NavBarProfileSection.css";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import Link from "../helpers/CustomLink";
import Button from "../helpers/Button";
import { log } from "../../helpers/utils";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function NavBarProfileSection({...otherProps}: Props) {

    const { id, className, style, children } = getCleanDefaultProps(otherProps, "NavBarProfileSection");

    const isLoggedIn = false;


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
                    // Login / Register links
                    <div>
                        <Button id="Register" className="me-5 hover">
                            <Link to="/register" className="whiteLink">Create Account</Link>
                        </Button>

                        <Link to="/login" className="whiteLink hover">Login</Link>
                    </div>
            }  
            {children}
        </div>
    )
}