import sanitize from "sanitize-html";
import { Env } from "../abstract/Env";
import { ProgrammingLanguage } from "../abstract/ProgrammingLanguage";
import { isBlank } from "./utils";

// App
export const ENV: Env = process.env.NODE_ENV as Env;
export const PROTOCOL = process.env.REACT_APP_PROTOCOL + "";
export const VERSION = process.env.REACT_APP_VERSION + "";


// URLs
export const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL + "";
/** Default rel attr to pass to any link */
export const LINK_DEFAULT_REL = "noopener noreferrer nofollow";


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
        "img",
        "input",
        "kbd",
        "mark",
        "p",
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
        "img": ["src", "alt", ...ALLOWED_TAG_ATTRIBUTES],
        "input": ["placeholder", "value", "defaultValue", ...ALLOWED_TAG_ATTRIBUTES],
        "mark": ["alt", "color", ...ALLOWED_TAG_ATTRIBUTES],
        "p": [...ALLOWED_TAG_ATTRIBUTES],
        "span": [...ALLOWED_TAG_ATTRIBUTES],
    },
    parseStyleAttributes: false
}


// Crypto
export const CRYPTO_KEY = process.env.REACT_APP_CRYPTO_KEY || "";
export const CRYPTO_IV = process.env.REACT_APP_CRYPTO_IV || "";


// Custom log
export type LogSevirity = "error" | "warn" | "info";
export const LOG_SEVIRITY_COLORS: Record<LogSevirity, string> = {
    "info": "white",
    "warn": "rgb(255, 233, 174)",
    "error": "rgb(255, 191, 191)"
}

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


// CodeNoteInput
export const CODE_BLOCK_DEFAULT_LANGUAGE = "_plaintext";
export const CODE_BLOCK_LANGUAGES: ProgrammingLanguage[] = [
    {
        name: "_plaintext",
        aliases: [
            "Plain Text",
            "text",
            "none",
            "normal",
        ]
    },
    {
        name: "abap",
        aliases: [
            "abap",
            "ABAP"
        ]
    },
    {
        name: "apex",
        aliases: [
            "Apex",
            "apex"
        ]
    },
    {
        name: "azcli",
        aliases: [
            "Azure CLI",
            "azcli"
        ]
    },
    {
        name: "bat",
        aliases: [
            "Batch",
            "bat"
        ]
    },
    {
        name: "bicep",
        aliases: [
            "Bicep"
        ]
    },
    {
        name: "cameligo",
        aliases: [
            "Cameligo"
        ]
    },
    {
        name: "clojure",
        aliases: [
            "clojure",
            "Clojure"
        ]
    },
    {
        name: "coffeescript",
        aliases: [
            "CoffeeScript",
            "coffeescript",
            "coffee"
        ]
    },
    {
        name: "c",
        aliases: [
            "C",
            "c"
        ]
    },
    {
        name: "cpp",
        aliases: [
            "C++",
            "Cpp",
            "cpp"
        ]
    },
    {
        name: "csharp",
        aliases: [
            "C#",
            "csharp"
        ]
    },
    {
        name: "csp",
        aliases: [
            "CSP",
            "csp"
        ]
    },
    {
        name: "css",
        aliases: [
            "CSS",
            "css"
        ]
    },
    {
        name: "cypher",
        aliases: [
            "Cypher",
            "OpenCypher"
        ]
    },
    {
        name: "dart",
        aliases: [
            "Dart",
            "dart"
        ]
    },
    {
        name: "dockerfile",
        aliases: [
            "Dockerfile"
        ]
    },
    {
        name: "ecl",
        aliases: [
            "ECL",
            "Ecl",
            "ecl"
        ]
    },
    {
        name: "elixir",
        aliases: [
            "Elixir",
            "elixir",
            "ex"
        ]
    },
    {
        name: "flow9",
        aliases: [
            "Flow9",
            "Flow",
            "flow9",
            "flow"
        ]
    },
    {
        name: "fsharp",
        aliases: [
            "F#",
            "FSharp",
            "fsharp"
        ]
    },
    {
        name: "freemarker2",
        aliases: [
            "FreeMarker2",
            "Apache FreeMarker2"
        ]
    },
    {
        name: "freemarker2.tag-angle.interpolation-dollar",
        aliases: [
            "FreeMarker2 (Angle/Dollar)",
            "Apache FreeMarker2 (Angle/Dollar)"
        ]
    },
    {
        name: "freemarker2.tag-bracket.interpolation-dollar",
        aliases: [
            "FreeMarker2 (Bracket/Dollar)",
            "Apache FreeMarker2 (Bracket/Dollar)"
        ]
    },
    {
        name: "freemarker2.tag-angle.interpolation-bracket",
        aliases: [
            "FreeMarker2 (Angle/Bracket)",
            "Apache FreeMarker2 (Angle/Bracket)"
        ]
    },
    {
        name: "freemarker2.tag-bracket.interpolation-bracket",
        aliases: [
            "FreeMarker2 (Bracket/Bracket)",
            "Apache FreeMarker2 (Bracket/Bracket)"
        ]
    },
    {
        name: "freemarker2.tag-auto.interpolation-dollar",
        aliases: [
            "FreeMarker2 (Auto/Dollar)",
            "Apache FreeMarker2 (Auto/Dollar)"
        ]
    },
    {
        name: "freemarker2.tag-auto.interpolation-bracket",
        aliases: [
            "FreeMarker2 (Auto/Bracket)",
            "Apache FreeMarker2 (Auto/Bracket)"
        ]
    },
    {
        name: "go",
        aliases: [
            "Go"
        ]
    },
    {
        name: "graphql",
        aliases: [
            "GraphQL",
            "graphql",
            "gql"
        ]
    },
    {
        name: "handlebars",
        aliases: [
            "Handlebars",
            "handlebars",
            "hbs"
        ]
    },
    {
        name: "hcl",
        aliases: [
            "Terraform",
            "tf",
            "HCL",
            "hcl"
        ]
    },
    {
        name: "html",
        aliases: [
            "HTML",
            "htm",
            "html",
            "xhtml"
        ]
    },
    {
        name: "ini",
        aliases: [
            "Ini",
            "ini"
        ]
    },
    {
        name: "java",
        aliases: [
            "Java",
            "java"
        ]
    },
    {
        name: "javascript",
        aliases: [
            "JavaScript",
            "javascript",
            "js"
        ]
    },
    {
        name: "julia",
        aliases: [
            "julia",
            "Julia"
        ]
    },
    {
        name: "kotlin",
        aliases: [
            "Kotlin",
            "kotlin"
        ]
    },
    {
        name: "less",
        aliases: [
            "Less",
            "less"
        ]
    },
    {
        name: "lexon",
        aliases: [
            "Lexon"
        ]
    },
    {
        name: "lua",
        aliases: [
            "Lua",
            "lua"
        ]
    },
    {
        name: "liquid",
        aliases: [
            "Liquid",
            "liquid"
        ]
    },
    {
        name: "m3",
        aliases: [
            "Modula-3",
            "Modula3",
            "modula3",
            "m3"
        ]
    },
    {
        name: "markdown",
        aliases: [
            "Markdown",
            "markdown"
        ]
    },
    {
        name: "mdx",
        aliases: [
            "MDX",
            "mdx"
        ]
    },
    {
        name: "mips",
        aliases: [
            "MIPS",
            "MIPS-V"
        ]
    },
    {
        name: "msdax",
        aliases: [
            "DAX",
            "MSDAX"
        ]
    },
    {
        name: "mysql",
        aliases: [
            "MySQL",
            "mysql"
        ]
    },
    {
        name: "objective-c",
        aliases: [
            "Objective-C"
        ]
    },
    {
        name: "pascal",
        aliases: [
            "Pascal",
            "pas"
        ]
    },
    {
        name: "pascaligo",
        aliases: [
            "Pascaligo",
            "ligo"
        ]
    },
    {
        name: "perl",
        aliases: [
            "Perl",
            "pl"
        ]
    },
    {
        name: "pgsql",
        aliases: [
            "PostgreSQL",
            "postgres",
            "pg",
            "postgre"
        ]
    },
    {
        name: "php",
        aliases: [
            "PHP",
            "php"
        ]
    },
    {
        name: "pla",
        aliases: []
    },
    {
        name: "postiats",
        aliases: [
            "ATS",
            "ATS/Postiats"
        ]
    },
    {
        name: "powerquery",
        aliases: [
            "PQ",
            "M",
            "Power Query",
            "Power Query M"
        ]
    },
    {
        name: "powershell",
        aliases: [
            "PowerShell",
            "powershell",
            "ps",
            "ps1"
        ]
    },
    {
        name: "proto",
        aliases: [
            "protobuf",
            "Protocol Buffers"
        ]
    },
    {
        name: "pug",
        aliases: [
            "Pug",
            "Jade",
            "jade"
        ]
    },
    {
        name: "python",
        aliases: [
            "Python",
            "py"
        ]
    },
    {
        name: "qsharp",
        aliases: [
            "Q#",
            "qsharp"
        ]
    },
    {
        name: "r",
        aliases: [
            "R",
            "r"
        ]
    },
    {
        name: "razor",
        aliases: [
            "Razor",
            "razor"
        ]
    },
    {
        name: "redis",
        aliases: [
            "redis"
        ]
    },
    {
        name: "redshift",
        aliases: [
            "Redshift",
            "redshift"
        ]
    },
    {
        name: "restructuredtext",
        aliases: [
            "reStructuredText",
            "restructuredtext"
        ]
    },
    {
        name: "ruby",
        aliases: [
            "Ruby",
            "rb"
        ]
    },
    {
        name: "rust",
        aliases: [
            "Rust",
            "rust"
        ]
    },
    {
        name: "sb",
        aliases: [
            "Small Basic",
            "sb"
        ]
    },
    {
        name: "scala",
        aliases: [
            "Scala",
            "scala",
            "SBT",
            "Sbt",
            "sbt",
            "Dotty",
            "dotty"
        ]
    },
    {
        name: "scheme",
        aliases: [
            "scheme",
            "Scheme"
        ]
    },
    {
        name: "scss",
        aliases: [
            "Sass",
            "sass",
            "scss"
        ]
    },
    {
        name: "shell",
        aliases: [
            "Shell",
            "sh"
        ]
    },
    {
        name: "sol",
        aliases: [
            "sol",
            "solidity",
            "Solidity"
        ]
    },
    {
        name: "aes",
        aliases: [
            "aes",
            "sophia",
            "Sophia"
        ]
    },
    {
        name: "sparql",
        aliases: [
            "sparql",
            "SPARQL"
        ]
    },
    {
        name: "sql",
        aliases: [
            "SQL"
        ]
    },
    {
        name: "st",
        aliases: [
            "StructuredText",
            "scl",
            "stl"
        ]
    },
    {
        name: "swift",
        aliases: [
            "Swift",
            "swift"
        ]
    },
    {
        name: "systemverilog",
        aliases: [
            "SV",
            "sv",
            "SystemVerilog",
            "systemverilog"
        ]
    },
    {
        name: "verilog",
        aliases: [
            "V",
            "v",
            "Verilog",
            "verilog"
        ]
    },
    {
        name: "tcl",
        aliases: [
            "tcl",
            "Tcl",
            "tcltk",
            "TclTk",
            "tcl/tk",
            "Tcl/Tk"
        ]
    },
    {
        name: "twig",
        aliases: [
            "Twig",
            "twig"
        ]
    },
    {
        name: "typescript",
        aliases: [
            "TypeScript",
            "ts",
            "typescript"
        ]
    },
    {
        name: "vb",
        aliases: [
            "Visual Basic",
            "vb"
        ]
    },
    {
        name: "wgsl",
        aliases: [
            "WebGPU Shading Language",
            "WGSL",
            "wgsl"
        ]
    },
    {
        name: "xml",
        aliases: [
            "XML",
            "xml"
        ]
    },
    {
        name: "yaml",
        aliases: [
            "YAML",
            "yaml",
            "YML",
            "yml"
        ]
    },
    {
        name: "json",
        aliases: [
            "JSON",
            "json"
        ]
    }
]


// CodeNoteInputWithVariables
export const CODE_BLOCK_WITH_VARIABLES_DEFAULT_LANGUAGE = "_auto";
export const CODE_BLOCK_WITH_VARIABLES_LANGUAGES: ProgrammingLanguage[] = [
    {
        name: "_auto"
    },
    {
        name: "1C",
        aliases: [
            "1c"
        ]
    },
    {
        name: "ABNF",
        aliases: [
            "abnf"
        ]
    },
    {
        name: "Ada",
        aliases: [
            "ada"
        ]
    },
    {
        name: "ActionScript",
        aliases: [
            "actionscript",
            "as"
        ]
    },
    {
        name: "AngelScript",
        aliases: [
            "angelscript",
            "asc"
        ]
    },
    {
        name: "Apache",
        aliases: [
            "apache",
            "apacheconf"
        ]
    },
    {
        name: "AppleScript",
        aliases: [
            "applescript",
            "osascript"
        ]
    },
    {
        name: "Arcade",
        aliases: [
            "arcade"
        ]
    },
    {
        name: "AsciiDoc",
        aliases: [
            "asciidoc",
            "adoc"
        ]
    },
    {
        name: "AspectJ",
        aliases: [
            "aspectj"
        ]
    },
    {
        name: "AutoHotkey",
        aliases: [
            "autohotkey"
        ]
    },
    {
        name: "AutoIt",
        aliases: [
            "autoit"
        ]
    },
    {
        name: "Awk",
        aliases: [
            "awk",
            "mawk",
            "nawk",
            "gawk"
        ]
    },
    {
        name: "Bash",
        aliases: [
            "bash",
            "sh",
            "zsh"
        ]
    },
    {
        name: "Basic",
        aliases: [
            "basic"
        ]
    },
    {
        name: "BNF",
        aliases: [
            "bnf"
        ]
    },
    {
        name: "Brainfuck",
        aliases: [
            "brainfuck",
            "bf"
        ]
    },
    {
        name: "C#",
        aliases: [
            "csharp",
            "cs"
        ]
    },
    {
        name: "C",
        aliases: [
            "c",
            "h"
        ]
    },
    {
        name: "C++",
        aliases: [
            "cpp",
            "hpp",
            "cc",
            "hh",
            "c++",
            "h++",
            "cxx",
            "hxx"
        ]
    },
    {
        name: "C/AL",
        aliases: [
            "cal"
        ]
    },
    {
        name: "Cache Object Script",
        aliases: [
            "cos",
            "cls"
        ]
    },
    {
        name: "CMake",
        aliases: [
            "cmake",
            "cmake.in"
        ]
    },
    {
        name: "Coq",
        aliases: [
            "coq"
        ]
    },
    {
        name: "CSP",
        aliases: [
            "csp"
        ]
    },
    {
        name: "CSS",
        aliases: [
            "css"
        ]
    },
    {
        name: "Cap’n Proto",
        aliases: [
            "capnproto",
            "capnp"
        ]
    },
    {
        name: "Clojure",
        aliases: [
            "clojure",
            "clj"
        ]
    },
    {
        name: "CoffeeScript",
        aliases: [
            "coffeescript",
            "coffee",
            "cson",
            "iced"
        ]
    },
    {
        name: "Crmsh",
        aliases: [
            "crmsh",
            "crm",
            "pcmk"
        ]
    },
    {
        name: "Crystal",
        aliases: [
            "crystal",
            "cr"
        ]
    },
    {
        name: "D",
        aliases: [
            "d"
        ]
    },
    {
        name: "Dart",
        aliases: [
            "dart"
        ]
    },
    {
        name: "Delphi",
        aliases: [
            "dpr",
            "dfm",
            "pas",
            "pascal"
        ]
    },
    {
        name: "Diff",
        aliases: [
            "diff",
            "patch"
        ]
    },
    {
        name: "Django",
        aliases: [
            "django",
            "jinja"
        ]
    },
    {
        name: "DNS Zone file",
        aliases: [
            "dns",
            "zone",
            "bind"
        ]
    },
    {
        name: "Dockerfile",
        aliases: [
            "dockerfile",
            "docker"
        ]
    },
    {
        name: "DOS",
        aliases: [
            "dos",
            "bat",
            "cmd"
        ]
    },
    {
        name: "dsconfig",
        aliases: [
            "dsconfig"
        ]
    },
    {
        name: "DTS (Device Tree)",
        aliases: [
            "dts"
        ]
    },
    {
        name: "Dust",
        aliases: [
            "dust",
            "dst"
        ]
    },
    {
        name: "EBNF",
        aliases: [
            "ebnf"
        ]
    },
    {
        name: "Elixir",
        aliases: [
            "elixir"
        ]
    },
    {
        name: "Elm",
        aliases: [
            "elm"
        ]
    },
    {
        name: "Erlang",
        aliases: [
            "erlang",
            "erl"
        ]
    },
    {
        name: "Excel",
        aliases: [
            "excel",
            "xls",
            "xlsx"
        ]
    },
    {
        name: "F#",
        aliases: [
            "fsharp",
            "fs",
            "fsx",
            "fsi",
            "fsscript"
        ]
    },
    {
        name: "FIX",
        aliases: [
            "fix"
        ]
    },
    {
        name: "Fortran",
        aliases: [
            "fortran",
            "f90",
            "f95"
        ]
    },
    {
        name: "G-Code",
        aliases: [
            "gcode",
            "nc"
        ]
    },
    {
        name: "Gams",
        aliases: [
            "gams",
            "gms"
        ]
    },
    {
        name: "GAUSS",
        aliases: [
            "gauss",
            "gss"
        ]
    },
    {
        name: "Gherkin",
        aliases: [
            "gherkin"
        ]
    },
    {
        name: "Go",
        aliases: [
            "go",
            "golang"
        ]
    },
    {
        name: "Golo",
        aliases: [
            "golo",
            "gololang"
        ]
    },
    {
        name: "Gradle",
        aliases: [
            "gradle"
        ]
    },
    {
        name: "GraphQL",
        aliases: [
            "graphql",
            "gql"
        ]
    },
    {
        name: "Groovy",
        aliases: [
            "groovy"
        ]
    },
    {
        name: "HTML, XML",
        aliases: [
            "xml",
            "html",
            "xhtml",
            "rss",
            "atom",
            "xjb",
            "xsd",
            "xsl",
            "plist",
            "svg"
        ]
    },
    {
        name: "HTTP",
        aliases: [
            "http",
            "https"
        ]
    },
    {
        name: "Haml",
        aliases: [
            "haml"
        ]
    },
    {
        name: "Handlebars",
        aliases: [
            "handlebars",
            "hbs",
            "html.hbs",
            "html.handlebars"
        ]
    },
    {
        name: "Haskell",
        aliases: [
            "haskell",
            "hs"
        ]
    },
    {
        name: "Haxe",
        aliases: [
            "haxe",
            "hx"
        ]
    },
    {
        name: "Hy",
        aliases: [
            "hy",
            "hylang"
        ]
    },
    {
        name: "Ini, TOML",
        aliases: [
            "ini",
            "toml"
        ]
    },
    {
        name: "Inform7",
        aliases: [
            "inform7",
            "i7"
        ]
    },
    {
        name: "IRPF90",
        aliases: [
            "irpf90"
        ]
    },
    {
        name: "JSON",
        aliases: [
            "json",
            "jsonc"
        ]
    },
    {
        name: "Java",
        aliases: [
            "java",
            "jsp"
        ]
    },
    {
        name: "JavaScript",
        aliases: [
            "javascript",
            "js",
            "jsx"
        ]
    },
    {
        name: "Julia",
        aliases: [
            "julia",
            "jl"
        ]
    },
    {
        name: "Julia REPL",
        aliases: [
            "julia-repl"
        ]
    },
    {
        name: "Kotlin",
        aliases: [
            "kotlin",
            "kt"
        ]
    },
    {
        name: "LaTeX",
        aliases: [
            "tex"
        ]
    },
    {
        name: "Leaf",
        aliases: [
            "leaf"
        ]
    },
    {
        name: "Lasso",
        aliases: [
            "lasso",
            "ls",
            "lassoscript"
        ]
    },
    {
        name: "Less",
        aliases: [
            "less"
        ]
    },
    {
        name: "LDIF",
        aliases: [
            "ldif"
        ]
    },
    {
        name: "Lisp",
        aliases: [
            "lisp"
        ]
    },
    {
        name: "LiveCode Server",
        aliases: [
            "livecodeserver"
        ]
    },
    {
        name: "LiveScript",
        aliases: [
            "livescript",
            "ls"
        ]
    },
    {
        name: "Lua",
        aliases: [
            "lua"
        ]
    },
    {
        name: "Makefile",
        aliases: [
            "makefile",
            "mk",
            "mak",
            "make"
        ]
    },
    {
        name: "Markdown",
        aliases: [
            "markdown",
            "md",
            "mkdown",
            "mkd"
        ]
    },
    {
        name: "Mathematica",
        aliases: [
            "mathematica",
            "mma",
            "wl"
        ]
    },
    {
        name: "Matlab",
        aliases: [
            "matlab"
        ]
    },
    {
        name: "Maxima",
        aliases: [
            "maxima"
        ]
    },
    {
        name: "Maya Embedded Language",
        aliases: [
            "mel"
        ]
    },
    {
        name: "Mercury",
        aliases: [
            "mercury"
        ]
    },
    {
        name: "MIPS Assembler",
        aliases: [
            "mips",
            "mipsasm"
        ]
    },
    {
        name: "Mizar",
        aliases: [
            "mizar"
        ]
    },
    {
        name: "Mojolicious",
        aliases: [
            "mojolicious"
        ]
    },
    {
        name: "Monkey",
        aliases: [
            "monkey"
        ]
    },
    {
        name: "Moonscript",
        aliases: [
            "moonscript",
            "moon"
        ]
    },
    {
        name: "N1QL",
        aliases: [
            "n1ql"
        ]
    },
    {
        name: "NSIS",
        aliases: [
            "nsis"
        ]
    },
    {
        name: "Nginx",
        aliases: [
            "nginx",
            "nginxconf"
        ]
    },
    {
        name: "Nim",
        aliases: [
            "nim",
            "nimrod"
        ]
    },
    {
        name: "Nix",
        aliases: [
            "nix"
        ]
    },
    {
        name: "OCaml",
        aliases: [
            "ocaml",
            "ml"
        ]
    },
    {
        name: "Objective C",
        aliases: [
            "objectivec",
            "mm",
            "objc",
            "obj-c",
            "obj-c++",
            "objective-c++"
        ]
    },
    {
        name: "OpenGL Shading Language",
        aliases: [
            "glsl"
        ]
    },
    {
        name: "OpenSCAD",
        aliases: [
            "openscad",
            "scad"
        ]
    },
    {
        name: "Oracle Rules Language",
        aliases: [
            "ruleslanguage"
        ]
    },
    {
        name: "Oxygene",
        aliases: [
            "oxygene"
        ]
    },
    {
        name: "PF",
        aliases: [
            "pf",
            "pf.conf"
        ]
    },
    {
        name: "PHP",
        aliases: [
            "php"
        ]
    },
    {
        name: "Parser3",
        aliases: [
            "parser3"
        ]
    },
    {
        name: "Perl",
        aliases: [
            "perl",
            "pl",
            "pm"
        ]
    },
    {
        name: "Plaintext",
        aliases: [
            "plaintext",
            "txt",
            "text",
            "normal",
            "none"
        ]
    },
    {
        name: "Pony",
        aliases: [
            "pony"
        ]
    },
    {
        name: "PostgreSQL &amp; PL/pgSQL",
        aliases: [
            "pgsql",
            "postgres",
            "postgresql"
        ]
    },
    {
        name: "PowerShell",
        aliases: [
            "powershell",
            "ps",
            "ps1"
        ]
    },
    {
        name: "Processing",
        aliases: [
            "processing"
        ]
    },
    {
        name: "Prolog",
        aliases: [
            "prolog"
        ]
    },
    {
        name: "Properties",
        aliases: [
            "properties"
        ]
    },
    {
        name: "Protocol Buffers",
        aliases: [
            "proto",
            "protobuf"
        ]
    },
    {
        name: "Puppet",
        aliases: [
            "puppet",
            "pp"
        ]
    },
    {
        name: "Python",
        aliases: [
            "python",
            "py",
            "gyp"
        ]
    },
    {
        name: "Python profiler results",
        aliases: [
            "profile"
        ]
    },
    {
        name: "Python REPL",
        aliases: [
            "python-repl",
            "pycon"
        ]
    },
    {
        name: "Q",
        aliases: [
            "k",
            "kdb"
        ]
    },
    {
        name: "QML",
        aliases: [
            "qml"
        ]
    },
    {
        name: "R",
        aliases: [
            "r"
        ]
    },
    {
        name: "ReasonML",
        aliases: [
            "reasonml",
            "re"
        ]
    },
    {
        name: "RenderMan RIB",
        aliases: [
            "rib"
        ]
    },
    {
        name: "RenderMan RSL",
        aliases: [
            "rsl"
        ]
    },
    {
        name: "Roboconf",
        aliases: [
            "graph",
            "instances"
        ]
    },
    {
        name: "Ruby",
        aliases: [
            "ruby",
            "rb",
            "gemspec",
            "podspec",
            "thor",
            "irb"
        ]
    },
    {
        name: "Rust",
        aliases: [
            "rust",
            "rs"
        ]
    },
    {
        name: "SAS",
        aliases: [
            "SAS",
            "sas"
        ]
    },
    {
        name: "SCSS",
        aliases: [
            "scss"
        ]
    },
    {
        name: "SQL",
        aliases: [
            "sql"
        ]
    },
    {
        name: "STEP Part 21",
        aliases: [
            "p21",
            "step",
            "stp"
        ]
    },
    {
        name: "Scala",
        aliases: [
            "scala"
        ]
    },
    {
        name: "Scheme",
        aliases: [
            "scheme"
        ]
    },
    {
        name: "Scilab",
        aliases: [
            "scilab",
            "sci"
        ]
    },
    {
        name: "Shell",
        aliases: [
            "shell",
            "console"
        ]
    },
    {
        name: "Smali",
        aliases: [
            "smali"
        ]
    },
    {
        name: "Smalltalk",
        aliases: [
            "smalltalk",
            "st"
        ]
    },
    {
        name: "SML",
        aliases: [
            "sml",
            "ml"
        ]
    },
    {
        name: "Stan",
        aliases: [
            "stan",
            "stanfuncs"
        ]
    },
    {
        name: "Stata",
        aliases: [
            "stata"
        ]
    },
    {
        name: "Stylus",
        aliases: [
            "stylus",
            "styl"
        ]
    },
    {
        name: "SubUnit",
        aliases: [
            "subunit"
        ]
    },
    {
        name: "Swift",
        aliases: [
            "swift"
        ]
    },
    {
        name: "Tcl",
        aliases: [
            "tcl",
            "tk"
        ]
    },
    {
        name: "Test Anything Protocol",
        aliases: [
            "tap"
        ]
    },
    {
        name: "Thrift",
        aliases: [
            "thrift"
        ]
    },
    {
        name: "TP",
        aliases: [
            "tp"
        ]
    },
    {
        name: "Twig",
        aliases: [
            "twig",
            "craftcms"
        ]
    },
    {
        name: "TypeScript",
        aliases: [
            "typescript",
            "ts",
            "tsx",
            "mts",
            "cts"
        ]
    },
    {
        name: "VB.Net",
        aliases: [
            "vbnet",
            "vb"
        ]
    },
    {
        name: "VBScript",
        aliases: [
            "vbscript",
            "vbs"
        ]
    },
    {
        name: "VHDL",
        aliases: [
            "vhdl"
        ]
    },
    {
        name: "Vala",
        aliases: [
            "vala"
        ]
    },
    {
        name: "Verilog",
        aliases: [
            "verilog",
            "v"
        ]
    },
    {
        name: "Vim Script",
        aliases: [
            "vim"
        ]
    },
    {
        name: "X++",
        aliases: [
            "axapta",
            "x++"
        ]
    },
    {
        name: "x86 Assembly",
        aliases: [
            "x86asm"
        ]
    },
    {
        name: "XL",
        aliases: [
            "xl",
            "tao"
        ]
    },
    {
        name: "XQuery",
        aliases: [
            "xquery",
            "xpath",
            "xq",
            "xqm"
        ]
    },
    {
        name: "YAML",
        aliases: [
            "yml",
            "yaml"
        ]
    },
    {
        name: "Zephir",
        aliases: [
            "zephir",
            "zep"
        ]
    },
]

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

    return `<input type="text" style="width: ${inputWidth}px" class="variableInput" placeholder="${placeholder}" />`;
}


// Other
/** Time the noteInput settings slide animation takes (in ms). */
export const BLOCK_SETTINGS_ANIMATION_DURATION = 150;
export const INVALID_INPUT_CLASS_NAME = "invalidInput";
export const MAX_TAG_INPUT_VALUE_LENGTH = 255;
export const MAX_NOTE_TITLE_VALUE_LENGTH = 255;
export const MAX_NOTE_INPUT_VALUE_LENGTH = 50_000;