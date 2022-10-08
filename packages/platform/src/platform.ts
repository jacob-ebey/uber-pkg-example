export type SignFunction = (value: string, secret: string) => Promise<string>;

export type UnsignFunction = (
  cookie: string,
  secret: string
) => Promise<string | false>;

export type PlatformInfo = {
  name: string;
  version?: string;
};

export {};
