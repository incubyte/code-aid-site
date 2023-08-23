export enum Impact {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export type Issue = {
  path: string;
  extra: {
    metadata: {
      impact: Impact;
      cwe: string;
      owasp: string[];
    };
    message: string;
    lines: string;
  };
  language: string;
};

export type SecurityIssuesMetadata = {
  impact: {
    [key: string]: number;
  };
  language: {
    [key: string]: number;
  };
};
