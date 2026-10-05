import * as Yup from "yup"
import dayjs from "dayjs"

export const policySchema = Yup.object().shape({
  // 1️⃣ Insurer Details
  insurerName: Yup.string().required("Insurer Name is required"),
  productName: Yup.string().required("Product Name is required"),
  uinNumber: Yup.string().required("UIN Number is required"),
  uoCode: Yup.string().required("UO Code is required"),
  underwritingBranch: Yup.string().required("Underwriting Branch is required"),
  servicingBranch: Yup.string().required("Servicing Branch is required"),

  // 2️⃣ Corporate Details
  corporate: Yup.object({
    groupName: Yup.string().required("Group Name is required"),
    corporateName: Yup.string().required("Corporate Name is required"),
    address: Yup.string().required("Address is required"),
    pinCode: Yup.string()
      .matches(/^\d{6}$/, "Enter valid 6 digit pin code")
      .required("Pin Code is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    sector: Yup.string().required("Sector is required"),
    corporateId: Yup.string().required("Corporate ID is required"),
  }),

  // 3️⃣ Broker Details
  broker: Yup.object({
    brokerName: Yup.string().required("Broker Name required"),
    brokerCode: Yup.string().required("Broker Code required"),
    brokerEmail: Yup.string()
      .email("Enter valid email")
      .required("Email required"),
    brokerMobile: Yup.string()
      .matches(/^\d{10}$/, "Enter valid 10 digit mobile")
      .required("Mobile required"),
  }),

  // 4️⃣ SPOC Details
  spoc: Yup.object({
    spocName: Yup.string().required("Spoc Name required"),
    spocEmail: Yup.string()
      .email("Enter valid email")
      .required("Spoc Email required"),
    spocContact: Yup.string()
      .matches(/^\d{10}$/, "Enter valid 10 digit number")
      .required("Spoc Contact required"),
  }),

  // 5️⃣ HR Details
  hr: Yup.object({
    hrName: Yup.string().required("HR Name required"),
    hrEmail: Yup.string().email().required("HR Email required"),
    hrContact: Yup.string()
      .matches(/^\d{10}$/, "Enter valid mobile")
      .required("Contact required"),
    physicalCard: Yup.string().required(),
    welcomeMail: Yup.string().required(),
  }),

  // 6️⃣ Policy Details
  policy: Yup.object({
    policyType: Yup.string().required("Policy Type required"),
    policyNumber: Yup.string().required("Policy Number required"),
    totalInsured: Yup.number().required(),
    totalDependent: Yup.number().required(),
    netPremium: Yup.number().required(),
    gst: Yup.number().required(),
    totalPremium: Yup.number().required(),
    riskStartDate: Yup.date().required(),
    riskEndDate: Yup.date()
      .required()
      .test(
        "one-year-policy",
        "Policy duration must be exactly 1 year",
        function (value) {
          const { riskStartDate } = this.parent
          if (!riskStartDate || !value) return false
          return dayjs(value).diff(dayjs(riskStartDate), "day") === 365
        }
      ),
    remarks: Yup.string(),
  }),

  // 7️⃣ Document Section
  document: Yup.object({
    vipTagging: Yup.string().required(),
    documentType: Yup.string().required(),
    documentRemarks: Yup.string(),
  }),
})
