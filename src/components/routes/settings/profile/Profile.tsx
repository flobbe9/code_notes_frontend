import { MouseEvent, useContext, useEffect, useState } from "react";
import { CustomExceptionFormat } from "../../../../abstract/CustomExceptionFormat";
import DefaultProps, { getCleanDefaultProps } from "../../../../abstract/DefaultProps";
import { CustomExceptionFormatService } from "../../../../abstract/services/CustomExceptionFormatService";
import { BACKEND_BASE_URL } from "../../../../helpers/constants";
import { fetchAny, isResponseError } from "../../../../helpers/fetchUtils";
import { getCurrentUrlWithoutWWW, isBlank } from "../../../../helpers/utils";
import { AppContext } from "../../../App";
import { AppFetchContext } from "../../../AppFetchContextProvider";
import ResetPassword from "../../../ResetPassword";
import Button from "../../../helpers/Button";
import Confirm from "../../../helpers/Confirm";
import ContentEditableDiv from "../../../helpers/ContentEditableDiv";
import Head from "../../../helpers/Head";
import TextInput from "../../../helpers/TextInput";
import { getHeadTitleText } from "../../../../helpers/projectUtils";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function Profile({...props}: Props) {

    const { showPopup, toast } = useContext(AppContext);
    const { appUserEntity, isLoggedInUseQueryResult } = useContext(AppFetchContext);

    const [email, setEmail] = useState("");


    useEffect(() => {
        setEmail(appUserEntity.email);

    }, [appUserEntity]);


    const { children, ...otherProps } = getCleanDefaultProps(props, "Profile", true);


    function handleChangePassword(_event: MouseEvent): void {
        showPopup(<ResetPassword isPopupContent />);
    }


    /**
     * Will ask for confirmation and on confirm will fetch delete app user, then refetch isLoggedIn and toast.
     * 
     * @param event 
     */
    function handleDeleteAccount(_event: MouseEvent): void {
        showPopup(
            <Confirm 
                heading={<h3 style={{color: "red"}}>Delete your account?</h3>}
                message={"All user data and all your notes will be deleted and can never be recovered!"}
                confirmLabel="Delete my account"
                onConfirm={async () => {
                    const response = await fetchDeleteAppUserEntity();
                    if (response.status === 200) {
                        setTimeout(() => {
                            isLoggedInUseQueryResult.refetch();
                            toast("Your account has been deleted", "", "info", 8000);
                        }, 200); // prevents weird double "go-back"
                    }
                }}
            />
        );
    }


    /**
     * Will fetch delete and send a confirmation mail if successful.
     * 
     * @returns error response or response object with status 200
     */
    async function fetchDeleteAppUserEntity(): Promise<CustomExceptionFormat> {

        const url = `${BACKEND_BASE_URL}/app-user/delete-current`;
        const response = await fetchAny(url, "delete");

        if (isResponseError(response)) {
            toast(response.message);
            return CustomExceptionFormatService.getInstance(response.status, response.message);
        }

        return CustomExceptionFormatService.getInstance(200, "");
    }


    function cannotChangePassword(): boolean {

        return isBlank(appUserEntity.password);
    }


    return (
        <div {...otherProps}>
            <Head headTagStrings={[
                `<link rel='canonical' href='${getCurrentUrlWithoutWWW()}' />`,
                `<title>${getHeadTitleText("Profile")}</title>`,
                `<meta name='robots' content='noindex nofollow'>`
            ]} />

            <div className="Profile-userDetail">
                <img 
                    src={"/img/account.png"}
                    className="Profile-userDetail-accountImage"
                    alt="account" 
                    height={120}
                />

                <ContentEditableDiv className="Profile-userDetail-input mt-4" disabled>
                    {email}
                </ContentEditableDiv>

                <TextInput 
                    className="Profile-userDetail-passwordInput Profile-userDetail-input" 
                    rendered={!cannotChangePassword()}
                    disabled 
                    defaultValue={"Cannot show password"}
                    type="password"
                >
                    <Button
                        className="Profile-userDetail-passwordInput-changePasswordButton hover"
                        title={"Change password"}
                        onClick={handleChangePassword}
                    >
                        Change password
                    </Button>
                </TextInput>
            </div>

            {/* Delete Account */}
            <div className="Profile-deleteAccountContainer">
                <Button
                    className="Profile-deleteAccountContainer-deleteButton"
                    onClick={handleDeleteAccount}
                >
                    Delete account
                </Button>

                <p className="mt-2">
                    All your user information and notes will be deleted. This cannot be undone!
                </p>
            </div>

            {children}
        </div>
    )
}
