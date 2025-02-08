import React from "react";
import "../../assets/styles/PrivacyPolicy.scss";
import DefaultProps, { getCleanDefaultProps } from "../../abstract/DefaultProps";
import { BASE_URL, HELP_EMAIL, LINK_DEFAULT_REL } from "../../helpers/constants";
import Flex from "../helpers/Flex";
import { getCurrentUrlWithoutWWW } from "../../helpers/utils";
import Head from "../helpers/Head";
import { getHeadTitleText } from "../../helpers/projectUtils";


interface Props extends DefaultProps {

}


/**
 * @since 0.0.1
 */
export default function PrivacyPolicy({...props}: Props) {

    const { children, ...otherProps } = getCleanDefaultProps(props, "PrivacyPolicy", true);

    return (
        <Flex horizontalAlign="center" {...otherProps}>
            <Head headTagStrings={[
                `<link rel='canonical' href='${getCurrentUrlWithoutWWW()}' />`,
                `<title>${getHeadTitleText("Privacy Policy")}</title>`
            ]} />

            <div className="PrivacyPolicy-container defaultPageContent">
                <h2>Privacy Policy</h2><br />
                <p>Information about the processing of your data according to Article 13 of the General Data Protection Regulation</p>

                <h3>Controller and Data Protection Officer</h3>
                <p>Responsible for this website is</p>

                <p>
                    Mr. Florin Schikarski <br />
                    Bäckerklint 4 <br />
                    38100 Braunschweig <br />
                    Germany<br /><br />

                    Email: <a href={`mailto:${HELP_EMAIL}`} className="blueLink" rel={LINK_DEFAULT_REL}>{HELP_EMAIL}</a>
                </p>

                <h3>User Data</h3>
                <h5>Which data is processed/stored?</h5>
                <div>
                    <ul>
                        <li><b>Registration/Login via third-party providers (Google, GitHub or Microsoft)</b></li>
                        <ul>
                            <li>Email address (persistent*)</li>
                            <li>Global User ID (persistent)
                                <ul>
                                    <li>The unique, unmodifiable identifier of a user within the third-party provider's environment</li>
                                </ul>
                            </li>
                        </ul>

                        <li><b>Registration/Login via form</b></li>
                        <ul>
                            <li>Email address (persistent)</li>
                            <li>Password (persistent)</li>
                        </ul>
                    </ul>

                    <p>
                        *persistent: Stored on this website's server and in the browser session (after successful login).<br />
                    </p>
                    <p>
                        All user data stored on the web server is securely saved and inaccessible to outsiders. Passwords are irreversibly encrypted before beeing stored. <br />
                        User data is processed based on Article 6 par. 1 letter f DSGVO.
                    </p>
                </div>

                <h5>Why is user data processed/stored?</h5>
                <div>
                    <p>
                        Storing and processing the aforementioned user data serves to create user profiles, enabling the general functionality of this website.<br />
                        With user profiles, content created by users can be stored, retrieved, and edited.
                    </p>
                </div>

                <h5>How long is user data stored?</h5>
                <div>
                    <p>
                        User data on the server is stored as long as the user's account exists. <br />
                        User data in the browser session is stored as long as the browser session is valid.
                    </p>
                </div>

                <h5>Deletion of User Data</h5>
                <div>
                    <p>
                        User accounts that have not been confirmed after registration will be deleted after 14 days. Confirmed accounts will never be deleted automatically.
                        An account can generally be deleted anytime by the user themselves through profile settings or upon explicit request to the contact details mentioned above. <br />
                        User data in the browser session is deleted as soon as the user logs out or the session ID becomes invalid.
                        A session timeout (automatic logout after a certain amount of time) is not implemented for functionality reasons.
                    </p>
                </div>

                <h5>Editing User Data</h5>
                <div>
                    <p>
                        A user's password can be changed via profile settings or by requesting an email via link. <br />
                        User preferences related to website functionality (e.g., content creation) can also be edited upon successful login.
                    </p>
                </div>

                <h5>Data Subject Rights</h5>
                <div>
                    <b>Right to Access</b>
                    <p>You can request information under Article 15 DSGVO about your personal data processed by us.</p>

                    <b>Right to Object:</b>
                    <p>
                        You have the right to object at any time, for reasons arising from your particular situation, to the processing of your personal data based on Article 6(1)(f) DSGVO.
                        The controller will no longer process the personal data unless they can demonstrate compelling legitimate grounds for the processing that outweigh the interests, rights, 
                        and freedoms of the data subject, or the processing serves to assert, exercise, or defend legal claims. Data collection for providing the website is essential for the website's operation.
                    </p>

                    <b>Right to Rectification</b>
                    <p>
                        If the information concerning you is not (or no longer) correct, you can request a correction under Article 16 DSGVO. 
                        If your data is incomplete, you can request completion.
                    </p>

                    <b>Right to Erasure</b>
                    <p>
                        You can request the deletion of your personal data under Article 17 DSGVO.
                    </p>

                    <b>Right to Restriction of Processing</b>
                    <p>
                        You have the right to request a restriction on the processing of your personal data under Article 18 DSGVO.
                    </p>

                    <b>Right to Complain</b>
                    <p>
                        If you believe that the processing of your personal data violates data protection laws, you have the right to lodge a complaint with a supervisory authority of your choice under Article 77(1) DSGVO. 
                        This includes the supervisory authority responsible for the controller: State Commissioner for Data Protection and Freedom of Information Nordrhein-Westfalen, <a href="https://www.ldi.nrw.de/kontakt/ihre-beschwerde"  className="blueLink" target="_blank" rel={LINK_DEFAULT_REL}>https://www.ldi.nrw.de/kontakt/ihre-beschwerde</a>.
                    </p>

                    <b>Right to Data Portability</b>
                    <p>
                        If the conditions of Article 20(1) DSGVO are met, you have the right to receive data that we process based on your consent or to fulfill a contract, in an automated manner, either for yourself or for third parties. The data collection for providing the website is essential for website operation and is therefore not based on consent under Article 6(1)(a) DSGVO or a contract under Article 6(1)(b) DSGVO, but is justified under Article 6(1)(f) DSGVO. Therefore, the conditions of Article 20(1) DSGVO are not met.
                    </p>
                </div>

                <h3>Cookies and Tracking</h3>
                <div>
                    <div>
                        Only necessary cookies are used to ensure the full functionality of the website: <br />
                        <b>JSESSIONID</b>
                        <ul>
                            <li>Domain: {BASE_URL}</li>
                            <li>Lifespan: indefinite</li>
                            <li>Function: Identification of the browser session (remembering an active login, even after closing the browser)</li>
                        </ul>
                    </div>

                    <p>
                        No tracking tools are used. Additionally, data such as IP addresses or accessed websites are not logged or stored.
                    </p>
                </div>

                <h3>Hosting</h3>
                <div>
                    <p>
                        The content of our website is hosted by the following provider: <br />
                        <b>Strato</b>
                    </p>
                    
                    <p>
                        The provider is Strato AG, Otto-Ostrowski-Straße 7, 10249 Berlin (hereinafter “Strato”). When you visit our website, Strato collects various log files, including your IP address. <br />
                        For more information, please refer to Strato's privacy policy: <a className="blueLink" href="https://www.strato.de/datenschutz/" target="_blank" rel={LINK_DEFAULT_REL}>https://www.strato.de/datenschutz/</a>.
                    </p>

                    <p>
                        The use of Strato is based on Article 6(1)(f) DSGVO. We have a legitimate interest in the most reliable presentation of our website. If consent is requested, the processing is carried out exclusively based on Article 6(1)(a) DSGVO and § 25(1) TDDDG, as far as the consent includes the storage of cookies or access to user device information (e.g., device fingerprinting) under the TDDDG. Consent can be revoked at any time.
                    </p>
                    
                    <h5>Order Processing</h5>
                    <p>
                        We have concluded an order processing agreement (AVV) for the use of the above-mentioned service.
                        This is a legally required contract ensuring that the provider processes the personal data of our website visitors only according to our instructions and in compliance with the DSGVO.
                    </p>
                </div>

                {children}
            </div>
        </Flex>

    )
}