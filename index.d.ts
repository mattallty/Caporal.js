declare class Caporal {
    INTEGER: number;
    INT: number;
    FLOAT: number;
    BOOL: number;
    BOOLEAN: number;
    STRING: number;
    LIST: number;
    ARRAY: number;
    REPEATABLE: number;
    REQUIRED: number;

    version(ver: string): Caporal;
    version(): string;

    name(name: string): Caporal;
    name(): string;

    description(name: string): Caporal;
    description(): string;

    logger(logger: Logger): Caporal;
    logger(): Logger;

    bin(name: string): Caporal;
    bin(): string;

    help(helpText: string, helpOptions?: helpOptions): Caporal;

    command(synopsis: string, description: string): Command;

    action(cb: ActionCallback): Caporal;

    option(synopsis: string, description: string, validator?: ValidatorArg, defaultValue?: any, required?: boolean): Caporal;

    argument(synopsis: string, description: string, validator?: ValidatorArg, defaultValue?: any): Command;

    parse(argv: string[]): any;
    fatalError(error: Error): void;
}

type helpOptions = {
    indent?: boolean,
    name?: string
};

type ActionCallback = (args: { [k: string]: any },
                       options: { [k: string]: any },
                       logger: Logger) => void;

type ValidatorArg = string[]|string|RegExp|ValidatorFn|Number;
type ValidatorFn = (str: string) => any;

declare interface Logger {
    debug(str: string|object): void;
    debug(format: string, ...mixed: any[]): void;
    info(str: string|object): void;
    info(format: string, ...mixed: any[]): void;
    log(str: string|object): void;
    log(format: string, ...mixed: any[]): void;
    warn(str: string|object): void;
    warn(format: string, ...mixed: any[]): void;
    error(str: string|object): void;
    error(format: string, ...mixed: any[]): void;
}

declare interface Command {
    help(helpText: string, helpOptions?: helpOptions): Command;

    argument(synopsis: string, description: string, validator?: ValidatorArg, defaultValue?: any): Command;

    command(synospis: string, description: string): Command;

    option(synopsis: string, description: string, validator?: ValidatorArg, defaultValue?: any, required?: boolean): Command;

    action(cb: ActionCallback): Command;

    alias(alias: string): Command;

    complete(cb: AutocompleteCallback): Command;

    visible(): boolean;
    visibile(visibility: boolean): Command;
}

type AutocompleteCallback = () => string[] | Promise<string[]>;
declare module 'caporal' {
    const caporal: Caporal;
    export = caporal;
}
