import sanitize from "sanitize-html";
import { Env } from "../abstract/Env";
import { LogLevel } from "../abstract/LogLevel";
import { isBlank } from "./utils";

// App
export const ENV: Env = import.meta.env["VITE_APP_ENV"] as Env;
export const PROTOCOL = import.meta.env["VITE_GATEWAY_PROTOCOL"] as string;
export const HOST = import.meta.env["VITE_GATEWAY_HOST"] as string;
export const VERSION = import.meta.env["VITE_VERSION"] as string;
export const APP_NAME_PRETTY = "Code Notes";
export const LOG_LEVEL = LogLevel[import.meta.env["VITE_LOG_LEVEL"] as string];


// URLs
export const BASE_URL = import.meta.env["VITE_GATEWAY_BASE_URL"] as string;
export const BACKEND_BASE_URL = import.meta.env["VITE_BACKEND_BASE_URL"] as string;
/** Default rel attr to pass to any external link */
export const LINK_DEFAULT_REL = "noopener noreferrer nofollow";

export const START_PAGE_PATH = "/";
export const SETTINGS_PATH = "/settings";
export const LOGIN_PATH = `/login`;
export const REGISTER_PATH = `/register`;
export const RESET_PASSWORD_PATH = `${SETTINGS_PATH}/reset-password`;
export const RESET_PASSWORD_BY_TOKEN_PATH = `/reset-password-by-token`;
export const PRIVACY_POLICY_PATH = `/privacy-policy`;
export const CONTACT_PATH = `/contact`;
export const PROFILE_PATH = `${SETTINGS_PATH}/profile`;

export const LOGOUT_URL = `${BACKEND_BASE_URL}/logout`;
/** The link that will trigger the oauth2 flow. This link is useless without the provider name appended. E.g. append "/google" */
const OAUTH2_AUTH_LINK = `${BACKEND_BASE_URL}/oauth2/authorization`;
export const OAUTH2_AUTH_LINK_GOOGLE = `${OAUTH2_AUTH_LINK}/google`;
export const OAUTH2_AUTH_LINK_AZURE = `${OAUTH2_AUTH_LINK}/azure`;
export const OAUTH2_AUTH_LINK_GITHUB = `${OAUTH2_AUTH_LINK}/github`;
/** The url query param the csrf token value will be assigned to. */
export const CSRF_TOKEN_URL_QUERY_PARAM = "csrf";
/** The url query param key used for redirect after successful or unsucessful account confirmation. Also hard coded in "AppUserController.java" */
export const CONFIRM_ACCOUNT_STATUS_URL_QUERY_PARAM = "confirm-account-status-code";
/** The url query param key that is appended to the redirect url after requesting a reset-password mail externally. Also hard coded in "AppUserController.java" */
export const SEND_RESET_PASSWORD_MAIL_STATUS_PARAM = "send-reset-password-mail";
/** The url query param key that is appended to the redirect url after requesting a reset-password mail externally. Also hard coded in "CustomLoginSuccessHandler.java" */
export const OAUTH2_LOGIN_ERROR_STATUS_URL_QUERY_PARAM = "oauth2-login-error";
/** Also hard coded in "Utils.java" */
export const RESET_PASSWORD_TOKEN_URL_QUERY_PARAM = "token";
export const RESET_PASSWORD_TOKEN_LOCAL_STORAGE_KEY = "reset-password-token";
export const NOTE_PAGE_URL_QUERY_PARAM = "page";
export const NOTE_SEARCH_PHRASE_URL_QUERY_PARAM = "searchPhrase";
export const NOTE_SEARCH_PHRASE_MIN_LENGTH = 4;
/** Time to wait before making a note search request to backend. In ms */
export const NOTE_SEARCH_PHRASE_USER_INPUT_DELAY = 500;
export const NOTE_SEARCH_TAGS_URL_QUERY_PARAM = "tagNames";
export const NOTE_SEARCH_TAGS_URL_QUERY_PARAM_SEPARATOR = ",";


// Other
/** Time the noteInput settings slide animation takes (in ms). */
export const BLOCK_SETTINGS_ANIMATION_DURATION = 150;
/** In ms. See ```<Popup>``` */
export const POPUP_FADE_DURATION = 200;
/** In ms */
export const CODE_INPUT_FULLSCREEN_ANIMATION_DURATION = 300;
export const INVALID_INPUT_CLASS_NAME = "invalidInput";
export const MAX_TAG_INPUT_VALUE_LENGTH = 50;
export const MAX_NOTE_TITLE_VALUE_LENGTH = 255;
export const MAX_NOTE_INPUT_VALUE_LENGTH = 65_535;
export const CSRF_TOKEN_HEADER_NAME = "X-CSRF-TOKEN";
export const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred. Please copy your unsaved contents and refresh the page.";
export const REQUIRED_PASSWORD_SYMBOLS = ".,;_!#§$%&@€*+=?´\"'/()~-";
export const PASSWORD_REGEX = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.,;_!#§$%&@€*+=?´"'/()~-])(.{8,72})$/, "g");
export const EMAIL_REGEX = new RegExp(/^[\w\-.]+@([\w-]+.)+[\w-]{2,4}$/, "g");
/** Also hard coded in "ConfirmationToken.java" */
export const HOURS_BEFORE_CONFIRMATION_TOKEN_EXPIRES = 12;
/** Will be prepended to the localStorage key to prevent key name collisions. */
export const REMEMBER_MY_CHOICE_KEY_PREFIX = "code_notes-rememberMyChoice-";
export const HELP_EMAIL = "help.codenotes@gmail.com";
/** Min is 1 for backend */
export const NUM_NOTES_PER_PAGE = 5;


// Crypto
export const CRYPTO_KEY = import.meta.env["VITE_CRYPTO_KEY"] || "";
export const CRYPTO_IV = import.meta.env["VITE_CRYPTO_IV"] || "";

/** Dont log to console if the 'message' contains one of these strings */
export const CONSOLE_MESSAGES_TO_AVOID: (string | number)[] = [
    // unallowed children of content editable
    "Warning: A component is `contentEditable` and contains `children` managed by React",
];


// CodeNoteInputWithVariables
export const VARIABLE_INPUT_SEQUENCE_REGEX = /^.*\$\[\[.*\]\].*$/;
export const VARIABLE_INPUT_DEFAULT_PLACEHOLDER = "VARIABLE_NAME";
export const VARIABLE_INPUT_START_SEQUENCE = "$[[";
export const VARIABLE_INPUT_END_SEQUENCE = "]]";
export const CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE = "Plaintext";


// CodeNoteInput
export const CODE_BLOCK_DEFAULT_LANGUAGE = "_plaintext";


// PlainTextInput
export const CODE_SNIPPET_SEQUENCE_MULTILINE = "```";
export const CODE_SNIPPET_SEQUENCE_MULTILINE_HTML_START = "<pre><code>";
export const CODE_SNIPPET_SEQUENCE_MULTILINE_HTML_END = "</code></pre>";
export const CODE_SNIPPET_SEQUENCE_SINGLELINE = "`";
export const CODE_SNIPPET_SEQUENCE_SINGLELINE_HTML_START = "<code>";
export const CODE_SNIPPET_SEQUENCE_SINGLELINE_HTML_END = "</code>";


export const VARIABLE_INPUT_CLASS = "variableInput";
/**
 * Input will always be as wide as given ```placeholder``` text. Uses the default placeholder if given ```placeholder``` is blank.
 * 
 * @param placeholder to use for the ```<input>```. Default is {@link VARIABLE_INPUT_DEFAULT_PLACEHOLDER}
 * @param inputWidth width of input (in px). Should fit the placeholder's text. Default is 120px
 * @returns ```<input>``` tag as string with a few attributes
 */
export function getDefaultVariableInput(placeholder = VARIABLE_INPUT_DEFAULT_PLACEHOLDER, inputWidth = 120): string {
    // case: invalid placeholder
    if (isBlank(placeholder))
        placeholder = VARIABLE_INPUT_DEFAULT_PLACEHOLDER;

    return `<input type="text" style="width: ${inputWidth}px" class="${VARIABLE_INPUT_CLASS}" placeholder="${placeholder}" />`;
}


// Sanitizer
const ALLOWED_TAG_ATTRIBUTES = ["class", "id", "title", "style"];
export const DEFAULT_HTML_SANTIZER_OPTIONS: sanitize.IOptions = {
    allowedTags: [
        "a",
        "bdo",
        "br",
        "code",
        "div",
        "em",
        "figcaption",
        "figure",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "i",
        "img",
        "input",
        "kbd",
        "mark",
        "p",
        "pre",
        "s",
        "span",
        "strong",
        "sub",
        "sup",
        "svg",
    ],
    allowedAttributes: {
        "a": ["href", "alt", "target", "rel", ...ALLOWED_TAG_ATTRIBUTES],
        "bdo": ["lang", "dir", ...ALLOWED_TAG_ATTRIBUTES],
        "div": [...ALLOWED_TAG_ATTRIBUTES],
        "figure": [...ALLOWED_TAG_ATTRIBUTES],
        "h1": [...ALLOWED_TAG_ATTRIBUTES],
        "h2": [...ALLOWED_TAG_ATTRIBUTES],
        "h3": [...ALLOWED_TAG_ATTRIBUTES],
        "h4": [...ALLOWED_TAG_ATTRIBUTES],
        "h5": [...ALLOWED_TAG_ATTRIBUTES],
        "h6": [...ALLOWED_TAG_ATTRIBUTES],
        "i": [...ALLOWED_TAG_ATTRIBUTES],
        "img": ["src", "alt", ...ALLOWED_TAG_ATTRIBUTES],
        "input": ["placeholder", "value", "defaultValue", ...ALLOWED_TAG_ATTRIBUTES],
        "mark": ["alt", "color", ...ALLOWED_TAG_ATTRIBUTES],
        "p": [...ALLOWED_TAG_ATTRIBUTES],
        "span": [...ALLOWED_TAG_ATTRIBUTES],
    },
    parseStyleAttributes: false
}
