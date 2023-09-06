type DependencyIssue = {
  fileName: string;
  filePath: string;
  relatedDependencies?: ReletedDependency[];
  packages?: Package[];
  vulnerabilities?: Vulnerability[];
  language: string;
};

type ReletedDependency = {
  fileName: string;
  filePath: string;
};

type Vulnerability = {
  cvssv3: {
    attackVector: string;
    attackComplexity: string;
    confidentialityImpact: string;
    integrityImpact: string;
    availabilityImpact: string;
  };
  severity: string;
  description: string;
  references: Reference[];
};

type Reference = {
  source: string;
  url: string;
  name: string;
};

type Package = {
  id: string;
  url: string;
};

type Issue = {
  fileName: string;
  filePath: string;
  packages?: Package[];
  vulnerabilities: Vulnerability;
  language: string;
};
