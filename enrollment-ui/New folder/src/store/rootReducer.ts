import { combineReducers } from "@reduxjs/toolkit";
import insurerReducer from "../store/features/insurer/insurerSlice";
import contactPersonReducer from "../store/features/insurer/contactPersonSlice";

import insurerOfficeReducer from "../store/features/insurerOffice/insurerOfficeSlice";
import tpaReducer from "../store/features/tpa/tpaSlice";
import escalationReducer from "../store/features/escalationMatrix/matrixSlice";
import brokerReducer from "../store/features/Broker/BrokerSlice";
import parentBranchsReducer from "../store/features/parentBranches/parentBranchesSlice";
import insurerListReducer from "../store/features/insurerList/insurerListSlice";
import stateCityReducer from "../store/features/stateCity/stateCitySlice";
import mbmDashboardReducer from "../store/features/mbmDashboard/mbmDashboardSlice";
import masterProductReducer from "../store/features/masterProduct/masterProductSlice";
import makerCheckerReducer from "../store/features/makerChecker/makerCheckerSlice";
import globalLoadingReducer from "../store/features/globalLoading/globalLoadingSlice";
import officeHierarchyReducer from "../store/features/officeHierarchy/officeHierarchySlice";
import DomainRoleSliceReducer from "../store/features/domain&Roll/domainRoleSlice";
import providerManagementReducer from "../store/features/providerManagement/providersSlice";
import providerRohiniReducer from "../store/features/providerRohini/providerRohiniSlice";
import excludedProviderReducer from "../store/features/excludedProvider/excludedProviderSlice";
import providerListReducer from "../store/features/provider/providerSlice";
import providerClinicalSpecialtiesReducer from "../store/features/providerClinicalSpecialties/providerClinicalSpecialtiesSlice";
import providerMastersReducer from "../store/features/providerMasters/providerMastersSlice";
import providerInfrastructureReducer from "../store/features/providerInfrastructure/providerInfrastructureSlice";
import providerManpowerReducer from "../store/features/providerManpower/providerManpowerSlice";
import providerFacilityReducer from "../store/features/providerFacility/providerFacilitySlice";
import providerAgreementReducer from "../store/features/providerAgreement/providerAgreementSlice";
import providerOwnerReducer from "../store/features/providerOwner/providerOwnerSlice";
import providerDetailReducer from "../store/features/providerDetail/providerDetailSlice";
import providerRestrictionReducer from "../store/features/providerRestriction/providerRestrictionSlice";
import bulkIcMappingReducer from "../store/features/bulkIcMapping/bulkIcMappingSlice";
import bulkBankDetailsReducer from "../store/features/bulkBankDetails/bulkBankDetailsSlice";
import providerIcCorporateMappingReducer from "../store/features/providerIcCorporateMapping/providerIcCorporateMappingSlice";
import LimitTypeMasterReducer from "../store/features/LimitTypeMaster/LimitTypeMasterSlice";
import discountTypeMasterReducer from "../store/features/discountTypeMaster/discountTypeMasterSlice";
import discountSubtypeMasterReducer from "../store/features/discountSubtypeMaster/discountSubtypeMasterSlice";
import discountInclusionExclusionMasterReducer from "../store/features/discountInclusionExclusionMaster/discountInclusionExclusionMasterSlice";
import providerDiscountConfigurationReducer from "../store/features/providerDiscountConfiguration/providerDiscountConfigurationSlice";

const rootReducer = combineReducers({
  insurer: insurerReducer,
  insurerOffice: insurerOfficeReducer,
  tpa: tpaReducer,
  contactPerson: contactPersonReducer,
  parentBranchs: parentBranchsReducer,
  insurerList: insurerListReducer,
  stateCity: stateCityReducer,
  mbmDashboard: mbmDashboardReducer,
  masterProduct: masterProductReducer,
  makerChecker: makerCheckerReducer,
  globalLoading: globalLoadingReducer,
  officeHierarchy: officeHierarchyReducer,
  matrix: escalationReducer,
  broker: brokerReducer,
  domain: DomainRoleSliceReducer,
  providerManagement: providerManagementReducer,
  providerRohini: providerRohiniReducer,
  excludedProvider: excludedProviderReducer,
  providerList: providerListReducer,
  providerClinicalSpecialties: providerClinicalSpecialtiesReducer,
  providerMasters: providerMastersReducer,
  providerInfrastructure: providerInfrastructureReducer,
  providerManpower: providerManpowerReducer,
  providerFacility: providerFacilityReducer,
  providerAgreement: providerAgreementReducer,
  providerOwner: providerOwnerReducer,
  providerDetail: providerDetailReducer,
  providerRestriction: providerRestrictionReducer,
  bulkIcMapping: bulkIcMappingReducer,
  bulkBankDetails: bulkBankDetailsReducer,
  providerIcCorporateMapping: providerIcCorporateMappingReducer,
  limitTypeMasterReducer : LimitTypeMasterReducer,
  discountTypeMaster: discountTypeMasterReducer,
  discountSubtypeMaster: discountSubtypeMasterReducer,
  discountInclusionExclusionMaster: discountInclusionExclusionMasterReducer,
  providerDiscountConfiguration: providerDiscountConfigurationReducer,
});

export default rootReducer;
