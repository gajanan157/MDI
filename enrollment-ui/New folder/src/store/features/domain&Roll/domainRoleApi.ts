import { getApi, insurerApi } from "@/app/api/apiService";

export const fetchDomainRoleAPI = async (params: {
  isDomain: boolean;
  domainId?: string;
}): Promise<any> => {
  const query = new URLSearchParams({
    isDomain: String(params.isDomain),
    ...(params.domainId && { domainId: params.domainId }),
  });

  const res = await getApi(
    insurerApi,
    `v1/insurer-office/insurer-office-contact-assignment/contact-role-domain?${query.toString()}`
  );

  if (!res.success) {
    console.log("response error", res);
  }

  return res;
};
