export const PROVIDER_INWARD_GRID_STYLES = `
  .provider-inward-grid {
    --ag-cell-horizontal-padding: 10px;
    --ag-header-height: 36px;
    --ag-row-height: 38px;
    --ag-background-color: #ffffff;
    --ag-header-background-color: #f8fafc;
    --ag-odd-row-background-color: #ffffff;
    --ag-border-color: #e2e8f0;
    --ag-row-border-color: #f1f5f9;
  }
  .provider-inward-grid .ag-header-row {
    height: 36px !important;
    min-height: 36px !important;
  }
  .provider-inward-grid .ag-header-cell {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .provider-inward-grid .ag-header-cell-label,
  .provider-inward-grid .ag-header-cell-text {
    font-size: 11px !important;
    font-weight: 600 !important;
    color: #475569 !important;
    letter-spacing: 0.035em !important;
    text-transform: uppercase !important;
    line-height: normal !important;
  }
  .provider-inward-grid .ag-header-cell-comp-wrapper {
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
    width: 100% !important;
  }
  .provider-inward-grid .ag-header-cell-center .ag-header-cell-comp-wrapper,
  .provider-inward-grid .ag-header-cell-center .ag-header-cell-label {
    justify-content: center !important;
    text-align: center !important;
  }
  .provider-inward-grid .ag-header {
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%) !important;
    border-bottom: 1.5px solid #e2e8f0 !important;
  }
  .provider-inward-grid .ag-row {
    border-bottom: 1px solid #f1f5f9 !important;
    background-color: #ffffff !important;
    transition: background-color 0.15s ease !important;
  }
  .provider-inward-grid .ag-row:hover {
    background-color: #f8fafc !important;
  }
  .provider-inward-grid .ag-row-selected {
    background-color: #eff6ff !important;
  }
  .provider-inward-grid .ag-cell {
    display: flex !important;
    align-items: center !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    font-size: 11.5px !important;
    color: #334155 !important;
  }
  .provider-inward-grid .ag-cell-wrapper {
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
    width: 100% !important;
  }
  .provider-inward-grid .ag-cell.ag-cell-center .ag-cell-wrapper {
    justify-content: center !important;
  }
  .provider-inward-grid .ag-root-wrapper {
    border: none !important;
    border-radius: 0 !important;
    background-color: #ffffff !important;
  }
  .provider-inward-grid .ag-root {
    background-color: #ffffff !important;
  }
  .provider-inward-grid .ag-body-viewport {
    background-color: #ffffff !important;
  }
`;
