export enum Impact {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export type Issue = {
  path: string;
  context?:string;
  extra: {
    dataflow_trace?: {
      intermediate_vars?: [
        {
          content: string;
          location: {
            start: {
              col: number;
              line: number;
              offset: number;
            };
          };
        }
      ];
    };
    metavars: {
      $SQL?: {
        propagated_value?: {
          svalue_start?: {
            line: number;
          };
        };
      };
    };
    metadata: {
      impact: Impact;
      cwe: string;
      owasp: string[];
    };
    message: string;
    lines: string;
  };
  end: {
    col: number;
    line: number;
    offset: number;
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
