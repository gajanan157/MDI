export interface ParentBranch {
  id: string;
  name: string;
}

export interface ParentBranchResponse {
  status: string;
  message: string;
  statusCode: number;
  data: ParentBranch[];
}
