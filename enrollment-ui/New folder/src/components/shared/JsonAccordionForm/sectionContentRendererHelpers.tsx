import ArraySectionContent from "./ArraySectionContent";
import ObjectSectionContent from "./ObjectSectionContent";
import SimpleValueSectionContent from "./SimpleValueSectionContent";
import type { SectionContentRendererProps } from "./SectionContentRenderer";

type SectionValueRendererProps = SectionContentRendererProps & {
  isFlatArray: boolean;
};

function renderArraySectionContent(
  props: SectionValueRendererProps,
  isFlatArray: boolean,
) {
  const {
    fieldKey,
    searchText,
    activeMatchPath,
    matchedPaths,
    actualDataWithoutChangeValue,
    value,
    formState,
    isEditing,
    newlyAddedFields,
    hasCheckerRole,
    hasBothRoles,
    hasMakerRole,
    checkerCanAct,
    shouldEnableComments,
    shouldEnableStatus,
    userRole,
    fieldStatus,
    onFieldStatusChange,
    getComments,
    onAddComment,
    onDeleteComment,
    userId,
    isMaker,
    newlyAddedArrayItems,
    onFormStateChange,
    onSetValue,
    onRemoveField,
    onNewlyAddedArrayItemsChange,
    actualDataWithoutChange,
    onSourceClick,
    openPaths,
    newlyAddedTableRows,
    newlyAddedTableColumns,
    onNewlyAddedTableRowsChange,
    onNewlyAddedTableColumnsChange,
  } = props;

  return (
    <ArraySectionContent
      fieldKey={fieldKey}
      searchText={searchText}
      activeMatchPath={activeMatchPath}
      matchedPaths={matchedPaths}
      actualDataWithoutChangeValue={actualDataWithoutChangeValue}
      value={value}
      formState={formState}
      isEditing={isEditing}
      isFlatArray={isFlatArray}
      isNewlyAdded={newlyAddedFields.has(fieldKey)}
      hasCheckerRole={hasCheckerRole}
      hasBothRoles={hasBothRoles}
      hasMakerRole={hasMakerRole}
      checkerCanAct={checkerCanAct}
      shouldEnableComments={shouldEnableComments}
      shouldEnableStatus={shouldEnableStatus}
      userRole={userRole}
      fieldStatus={fieldStatus}
      onFieldStatusChange={onFieldStatusChange}
      getComments={getComments}
      onAddComment={onAddComment}
      onDeleteComment={onDeleteComment}
      userId={userId}
      isMaker={isMaker}
      newlyAddedArrayItems={newlyAddedArrayItems}
      onFormStateChange={onFormStateChange}
      onSetValue={onSetValue}
      onRemoveField={onRemoveField}
      onNewlyAddedArrayItemsChange={onNewlyAddedArrayItemsChange}
      rootData={actualDataWithoutChange}
      onRootDataChange={onFormStateChange}
      onSourceClick={onSourceClick}
      openPaths={openPaths}
      newlyAddedTableRows={newlyAddedTableRows}
      newlyAddedTableColumns={newlyAddedTableColumns}
      onNewlyAddedTableRowsChange={onNewlyAddedTableRowsChange}
      onNewlyAddedTableColumnsChange={onNewlyAddedTableColumnsChange}
    />
  );
}

export function renderSectionValueContent(props: SectionValueRendererProps) {
  const { value, isFlatArray } = props;

  if (Array.isArray(value)) {
    return renderArraySectionContent(props, isFlatArray);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const {
      fieldKey,
      searchText,
      activeMatchPath,
      matchedPaths,
      openPaths,
      actualDataWithoutChangeValue,
      formState,
      isEditing,
      isMaker,
      shouldEnableSectionComments,
      isApproved,
      hasMakerRole,
      hasCheckerRole,
      hasBothRoles,
      checkerCanAct,
      userRole,
      rowId,
      shouldEnableComments,
      shouldEnableStatus,
      errors,
      newlyAddedFields,
      onFormStateChange,
      onSetValue,
      onAddFieldInObject,
      onRemoveFieldInObject,
      fieldStatus,
      onFieldStatusChange,
      actualDataWithoutChange,
      onSourceClick,
      onAddField,
      getComments,
      onAddComment,
      onDeleteComment,
      userId,
    } = props;

    return (
      <ObjectSectionContent
        fieldKey={fieldKey}
        searchText={searchText}
        activeMatchPath={activeMatchPath}
        matchedPaths={matchedPaths}
        openPaths={openPaths}
        actualDataWithoutChangeValue={actualDataWithoutChangeValue}
        value={value}
        formState={formState}
        isEditing={isEditing}
        isMaker={isMaker}
        shouldEnableSectionComments={shouldEnableSectionComments}
        isApproved={isApproved}
        hasMakerRole={hasMakerRole}
        hasCheckerRole={hasCheckerRole}
        hasBothRoles={hasBothRoles}
        checkerCanAct={checkerCanAct}
        userRole={userRole}
        rowId={rowId}
        shouldEnableComments={shouldEnableComments}
        shouldEnableStatus={shouldEnableStatus}
        errors={errors}
        newlyAddedFields={newlyAddedFields}
        onFormStateChange={onFormStateChange}
        onSetValue={onSetValue}
        onAddField={onAddFieldInObject}
        onRemoveField={onRemoveFieldInObject}
        fieldStatus={fieldStatus}
        onFieldStatusChange={onFieldStatusChange}
        rootData={actualDataWithoutChange}
        onRootDataChange={onFormStateChange}
        onSourceClick={onSourceClick}
        onAddFieldAtPath={onAddField}
        getComments={getComments}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        userId={userId}
      />
    );
  }

  const {
    fieldKey,
    searchText,
    activeMatchPath,
    actualDataWithoutChangeValue,
    formState,
    isEditing,
    newlyAddedFields,
    hasCheckerRole,
    hasBothRoles,
    hasMakerRole,
    checkerCanAct,
    isApproved,
    isMaker,
    errors,
    shouldEnableComments,
    fieldStatus,
    onFieldStatusChange,
    userRole,
    actualDataWithoutChange,
    onFormStateChange,
    onSetValue,
    onRemoveField,
    onSourceClick,
    value: simpleValue,
  } = props;

  return (
    <SimpleValueSectionContent
      fieldKey={fieldKey}
      searchText={searchText}
      activeMatchPath={activeMatchPath}
      actualDataWithoutChangeValue={actualDataWithoutChangeValue}
      value={simpleValue}
      formState={formState}
      isEditing={isEditing}
      isNewlyAdded={newlyAddedFields.has(fieldKey)}
      hasCheckerRole={hasCheckerRole}
      hasBothRoles={hasBothRoles}
      hasMakerRole={hasMakerRole}
      checkerCanAct={checkerCanAct}
      isApproved={isApproved}
      isMaker={isMaker}
      errors={errors}
      shouldEnableComments={shouldEnableComments}
      fieldStatus={fieldStatus}
      onFieldStatusChange={onFieldStatusChange}
      userRole={userRole}
      rootData={actualDataWithoutChange}
      onRootDataChange={onFormStateChange}
      onFormStateChange={onFormStateChange}
      onSetValue={onSetValue}
      onRemoveField={onRemoveField}
      onSourceClick={onSourceClick}
    />
  );
}
