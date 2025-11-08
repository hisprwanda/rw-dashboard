# Data Source Synchronization Fix

## Problem Analysis

When users switched data sources in the visualizer app, the organization unit data was not synchronizing correctly. This caused several issues:

### Issues Identified:

1. **Loading State Mismatch**

   - The `OrganizationModal` only received `orgUnitLoading` (from current instance)
   - When switching to external data source, `isFetchExternalUserInfoAndOrgUnitDataLoading` was not tracked
   - Users would see stale data while external data was loading

2. **Stale Data Display**

   - Old organization data remained visible while new data was being fetched
   - No clear indication that data was being refreshed
   - Modal could be opened before new data arrived

3. **Async Race Conditions**

   - Data fetching happened asynchronously but state updates were not synchronized
   - `setSelectedDataSourceDetails` was called before data was fetched
   - Reset function was called before fetch completed

4. **Error State Not Propagated**

   - External org unit fetch errors (`fetchExternalOrgUnitError`) were not passed to modal
   - Users couldn't see if external data fetch failed

5. **Incomplete State Resets**
   - Selected org units from previous data source persisted
   - Organization unit groups and levels were not cleared immediately

## Solutions Implemented

### 1. Fixed Loading State Synchronization (`VisualizersPage.tsx`)

**Before:**

```tsx
<OrganizationModal
  data={currentUserInfoAndOrgUnitsData}
  loading={orgUnitLoading} // Only current instance
  error={fetchOrgUnitError}
  setIsShowOrganizationUnit={setIsShowOrganizationUnit}
/>
```

**After:**

```tsx
<OrganizationModal
  data={currentUserInfoAndOrgUnitsData}
  loading={orgUnitLoading || isFetchExternalUserInfoAndOrgUnitDataLoading} // Both sources
  error={fetchOrgUnitError || fetchExternalOrgUnitError} // Both errors
  setIsShowOrganizationUnit={setIsShowOrganizationUnit}
/>
```

### 2. Enhanced Data Source Change Handler

**Before:**

```tsx
const handleDataSourceOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedValue = e.target.value;
  setSelectedDataSourceOption(selectedValue);

  // Create details
  let newSelectedDetails = {};

  if (selectedValue === currentInstanceId) {
    newSelectedDetails = {
      /* ... */
    };
    fetchCurrentInstanceData(selectedDimensionItemType); // Fire and forget
    fetchCurrentUserAndOrgUnitData(); // Fire and forget
  } else {
    newSelectedDetails =
      savedDataSource?.dataStore?.entries?.find(/*...*/)?.value || {};
    fetchExternalDataItems(/*...*/); // Fire and forget
    fetchExternalUserInfoAndOrgUnitData(/*...*/); // Fire and forget
  }

  setSelectedDataSourceDetails(newSelectedDetails); // Called before fetch completes!
  resetOtherValuesToDefaultExceptDataSource(); // Called before fetch completes!
};
```

**After:**

```tsx
const handleDataSourceOnChange = async (
  e: React.ChangeEvent<HTMLSelectElement>
) => {
  const selectedValue = e.target.value;

  // Step 1: Update data source option
  setSelectedDataSourceOption(selectedValue);

  // Step 2: Clear old data immediately to prevent stale data display
  setCurrentUserInfoAndOrgUnitsData(null);

  // Step 3: Determine details and update BEFORE fetching
  let newSelectedDetails: any = {};

  if (selectedValue === currentInstanceId) {
    newSelectedDetails = {
      instanceName: systemInfo?.title?.applicationTitle || "",
      isCurrentInstance: true,
    };
    setSelectedDataSourceDetails(newSelectedDetails);

    // Wait for all data to be fetched
    await Promise.all([
      fetchCurrentInstanceData(selectedDimensionItemType),
      fetchCurrentUserAndOrgUnitData(),
    ]);
  } else {
    newSelectedDetails =
      savedDataSource?.dataStore?.entries?.find(
        (item: any) => item.key === selectedValue
      )?.value || {};
    setSelectedDataSourceDetails(newSelectedDetails);

    // Wait for all data to be fetched
    await Promise.all([
      fetchExternalDataItems(
        newSelectedDetails.url,
        newSelectedDetails.token,
        selectedDimensionItemType
      ),
      fetchExternalUserInfoAndOrgUnitData(
        newSelectedDetails.url,
        newSelectedDetails.token
      ),
    ]);
  }

  // Step 4: Reset after data is fetched and ready
  resetOtherValuesToDefaultExceptDataSource();
};
```

### 3. Updated Organization Unit Button Loading State

**Before:**

```tsx
<Button
  disabled={
    isFetchCurrentInstanceDataItemsLoading ||
    isFetchExternalInstanceDataItemsLoading
  }
  variant="source"
  text={`${isFetchCurrentInstanceDataItemsLoading || isFetchExternalInstanceDataItemsLoading ? "Loading.." : `${i18n.t("Organization Unit")} `} `}
  onClick={handleShowOrganizationUnitModal}
/>
```

**After:**

```tsx
<Button
  disabled={
    isFetchCurrentInstanceDataItemsLoading ||
    isFetchExternalInstanceDataItemsLoading ||
    orgUnitLoading ||
    isFetchExternalUserInfoAndOrgUnitDataLoading
  }
  variant="source"
  text={`${
    isFetchCurrentInstanceDataItemsLoading ||
    isFetchExternalInstanceDataItemsLoading ||
    orgUnitLoading ||
    isFetchExternalUserInfoAndOrgUnitDataLoading
      ? "Loading.."
      : `${i18n.t("Organization Unit")} `
  } `}
  onClick={handleShowOrganizationUnitModal}
/>
```

### 4. Added External Org Unit Error Tracking

**Before:**

```tsx
const {
  fetchExternalUserInfoAndOrgUnitData,
  loading: isFetchExternalUserInfoAndOrgUnitDataLoading,
} = useExternalOrgUnitData();
```

**After:**

```tsx
const {
  fetchExternalUserInfoAndOrgUnitData,
  loading: isFetchExternalUserInfoAndOrgUnitDataLoading,
  error: fetchExternalOrgUnitError, // Now tracked
} = useExternalOrgUnitData();
```

### 5. Auto-Clear Selections on Data Source Change

Added to `OrganisationUnitSelector.tsx`:

```tsx
// Reset org unit selections when data source changes
useEffect(() => {
  // Clear selections when switching between data sources
  handleDeselectAll();
  setSelectedOrgUnitGroups([]);
}, [selectedDataSourceDetails]);
```

## Benefits

1. ✅ **No More Stale Data**: Old org unit data is cleared immediately when switching sources
2. ✅ **Accurate Loading States**: All loading indicators properly reflect actual data fetch status
3. ✅ **Error Visibility**: Users can see if external data fetch fails
4. ✅ **Clean State Transitions**: Org unit selections are properly reset when switching sources
5. ✅ **Race Condition Free**: All async operations complete before state updates
6. ✅ **Synchronized UI**: Buttons and modals reflect the true state of data fetching

## Testing Checklist

- [ ] Switch from current instance to external data source
- [ ] Verify old org unit data clears immediately
- [ ] Verify loading indicator shows while fetching
- [ ] Verify new org unit tree displays after fetch completes
- [ ] Switch back to current instance
- [ ] Verify org unit selections are cleared on switch
- [ ] Test with slow network to verify loading states
- [ ] Test with invalid external data source to verify error handling
- [ ] Open org unit modal while data is loading
- [ ] Verify modal shows loading state, not stale data

## Technical Details

### Key Changes:

- Made `handleDataSourceOnChange` async with `await`
- Used `Promise.all()` to wait for parallel data fetches
- Added `setCurrentUserInfoAndOrgUnitsData(null)` to clear stale data
- Combined loading states with `||` operator
- Combined error states with `||` operator
- Added `useEffect` to clear selections on data source change

### Files Modified:

1. `src/pages/visualizers/VisualizersPage.tsx` - Main data source handling
2. `src/components/OrganisationUnitTree/OrganisationUnitSelector.tsx` - Selection clearing
3. `src/hooks/useResetAnalyticsStatesTDefault.ts` - Minor cleanup
