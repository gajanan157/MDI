import { AddressSection } from "@/app/pages/AdminDepartment/tpa/AddressSection";
import DropdownSelect from "@/components/shared/form/DropdownSelect";
import FormLayout from "@/components/shared/form/FormLayout";
import { Input } from "@/components/ui";
import SectionTitle from "@/components/ui/SectionTitle";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import React from "react";
import AddServiceModal from "./AddServiceModal";
import ContactUpdateForm from "./Contact-Update/ContactUpdateForm";
import ContactPopup from "./NewContactPop/ContactPopup";
import OfficeContactPersonSection from "./OfficeContactPersonSection";
import OfficeFormActionButtons from "./OfficeFormActionButtons";
import OfficeServicesSection from "./OfficeServicesSection";
import { useAddOfficeForm } from "./useAddOfficeForm";

export interface LocationState {
  mode?: "view" | "edit" | "create";
}

const AddOfficeForm: React.FC = () => {
  const form = useAddOfficeForm();

  return (
    <>
      <FormLayout
        onSubmit={form.handleSubmit(form.handleFormSubmit)}
        FormClassName="w-full px-6 pt-2 lg:pt-2 max-w-8xl mx-auto"
      >
        <div className="space-y-3">
          <div className="from-primary/10 via-primary/5 to-background border-primary/20 rounded-xl border bg-linear-to-br p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <SectionTitle
                  title={form.t("officeAdd.sectionTitle")}
                  icon={<BuildingOfficeIcon className="h-5 w-5 text-blue-500" />}
                />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
                  <DropdownSelect
                    label={form.t("officeAdd.insuranceCompany")}
                    defaultValue={form.t("officeAdd.placeholders.insuranceCompany")}
                    name_key="icName"
                    options={form.insuranceCompanyOptions}
                    control={form.control}
                    rules={{ required: "Insurance company is required" }}
                    name="icName"
                    errors={form.errors.icName}
                    className="h-[42px] rounded-lg"
                    disabled={form.readOnly || form.isSubmitting}
                    isRequired
                  />
                  <DropdownSelect
                    label={form.t("officeAdd.officeType")}
                    defaultValue={form.t("officeAdd.officeType")}
                    name_key="officeType"
                    options={form.officeTypeOptions}
                    control={form.control}
                    name="officeType"
                    errors={form.errors.officeType}
                    className="h-[42px] rounded-lg"
                    disabled={form.readOnly || form.isSubmitting || form.headOfficeLocked}
                    isRequired
                  />
                  <Input
                    label={form.t("officeAdd.officeName")}
                    placeholder={form.t("officeAdd.placeholders.officeName")}
                    {...form.officeNameRegistration}
                    error={form.errors.officeName?.message}
                    disabled={form.readOnly || form.isSubmitting}
                    isRequired
                    ref={form.mergeRefs(form.insurerOfficeNameRef, form.officeNameRegistration.ref)}
                  />
                  <Input
                    label={form.t("officeAdd.officeCode")}
                    placeholder={form.t("officeAdd.placeholders.officeCode")}
                    {...form.officeCodeRegistration}
                    error={form.errors.officeCode?.message}
                    disabled={form.readOnly || form.isSubmitting}
                    isRequired
                    ref={form.mergeRefs(form.insurerOfficeNameRef, form.officeCodeRegistration.ref)}
                  />
                  <div className="bg-muted/30 flex items-center gap-2 rounded-lg px-3">
                    <input
                      type="checkbox"
                      id="isUnderwriting"
                      {...form.register("underwritingCenter")}
                      className="border-input text-primary focus:ring-primary h-4 w-4 rounded focus:ring-offset-0"
                      disabled={
                        form.readOnly || form.isSubmitting || form.officeTypeWatch === "UO"
                      }
                    />
                    <label
                      htmlFor="isUnderwriting"
                      className="input-label cursor-pointer text-sm font-medium"
                    >
                      {form.t("officeAdd.underwriting")}
                    </label>
                  </div>
                  {form.showReportingOfficeType && (
                    <DropdownSelect
                      label={form.t("officeAdd.reportingOfficeType")}
                      defaultValue={form.t("officeAdd.placeholders.reportingOfficeType")}
                      name_key="superiorOfficeType"
                      options={form.reportingOfficeTypeOptions}
                      control={form.control}
                      name="superiorOfficeType"
                      errors={form.errors.superiorOfficeType}
                      className="h-[42px] rounded-lg"
                      disabled={form.readOnly || form.isSubmitting}
                      isRequired
                    />
                  )}
                  {form.showReportingOffice && (
                    <DropdownSelect
                      label={form.t("officeAdd.reportingOffice")}
                      defaultValue={form.t("officeAdd.reportingOffice")}
                      name_key="superiorOffice"
                      options={form.reportingOfficeOptions}
                      control={form.control}
                      name="superiorOffice"
                      errors={form.errors.superiorOffice}
                      className="h-[42px] rounded-lg"
                      disabled={form.readOnly || form.isSubmitting}
                      isRequired
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <AddressSection
            isDisable={!form.editing}
            register={form.register}
            control={form.control}
            errors={form.errors}
            setValue={form.setValue}
            watch={form.watch}
          />

          <OfficeServicesSection
            title={form.t("serviceDetails.title")}
            addLabel={form.t("serviceDetails.addService")}
            noDataLabel={form.t("serviceDetails.noData")}
            bothAllocationLabel={form.t("serviceDetails.allocation.both")}
            readOnly={form.readOnly}
            readOnlyClassName={form.readOnlyClassName}
            servicesError={form.servicesError}
            servicesData={form.servicesData}
            labels={{
              action: form.t("serviceDetails.table.action"),
              serviceName: form.t("serviceDetails.table.serviceName"),
              startDate: form.t("serviceDetails.table.startDate"),
              endDate: form.t("serviceDetails.table.endDate"),
              servicingAllocation: form.t("serviceDetails.table.servicingAllocation"),
              edit: form.t("serviceDetails.actions.edit"),
              remove: form.t("serviceDetails.actions.remove"),
            }}
            onAdd={form.handleOpenModal}
            onEdit={form.handleEditService}
            onDelete={form.handleDeleteService}
          />

          <OfficeContactPersonSection
            title={form.t("contactPerson.title")}
            addLabel={form.t("contactPerson.addButton")}
            noDataLabel={form.t("contactPerson.table.noData")}
            mobileerror={form.mobileerror}
            contactPersonFields={form.contactPersonFields}
            labels={{
              action: form.t("contactPerson.table.action"),
              fullName: form.t("contactPerson.table.fullName"),
              designation: form.t("contactPerson.table.designation"),
              department: form.t("contactPerson.table.department"),
              priority: form.t("contactPerson.table.priority"),
              edit: form.t("contactPerson.actions.edit"),
              remove: form.t("contactPerson.actions.remove"),
            }}
            onAdd={form.handleOpenAddContact}
            onEdit={form.handleEditContact}
            onRemove={form.handleRemoveContact}
          />

          {form.canWrite && (
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6">
              <p className="text-muted-foreground flex min-w-0 shrink-0 items-center gap-2 text-sm" />
              <OfficeFormActionButtons
                isEditMode={form.isEditMode}
                editing={form.editing}
                isSubmitting={form.isSubmitting}
                isCreatePending={Boolean((form.createOffice as { isPending?: boolean })?.isPending)}
                onCancel={form.onCancel}
                onEdit={form.onEdit}
                labels={{
                  cancel: form.t("branchForm.buttons.cancel"),
                  updating: form.t("office.buttons.updating"),
                  updateOffice: form.t("office.buttons.updateOffice"),
                  edit: form.t("office.buttons.edit"),
                  creating: form.t("office.buttons.creating"),
                  createOffice: form.t("office.buttons.createOffice"),
                }}
              />
            </div>
          )}
        </div>
      </FormLayout>

      <ContactUpdateForm
        setIsAssign={form.setIsAssign}
        selectedObj={form.assignObj}
        isOpen={form.isOpen}
        onClose={form.close}
      />
      {form.openContactModal && (
        <ContactPopup
          editData={form.editIndex !== null ? form.contactPersonFields[form.editIndex] : null}
          editIndex={form.editIndex}
          setContactPersonFields={form.setContactPersonFields}
          openContactModal={form.openContactModal}
          setOpenContactModal={form.setOpenContactModal}
        />
      )}
      {form.openServiceModal && (
        <AddServiceModal
          isOpen={form.openServiceModal}
          onClose={() => form.setOpenServiceModal(false)}
          onSubmit={form.handleAddService}
          defaultValues={form.editIndex2 !== null ? form.servicesData[form.editIndex2] : null}
        />
      )}
    </>
  );
};

export default AddOfficeForm;
