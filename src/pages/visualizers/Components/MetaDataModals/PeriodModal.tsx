import React from "react"
import { useEffect, useState } from "react"
import { useAuthorities } from "../../../../context/AuthContext"
import { formatAnalyticsDimensions } from "../../../../lib/formatAnalyticsDimensions"
import Button from "../../../../components/Button"
import { IoSaveOutline } from "react-icons/io5"
import { dimensionDataHardCoded } from "../../../../constants/bulletinDimension"

const groupedPeriods = {
  days: ["TODAY", "YESTERDAY", "LAST_3_DAYS", "LAST_7_DAYS", "LAST_14_DAYS", "LAST_30_DAYS"],
  weeks: ["THIS_WEEK", "LAST_WEEK", "LAST_4_WEEKS", "LAST_12_WEEKS", "LAST_52_WEEKS"],
  biweeks: ["THIS_BIWEEK", "LAST_BIWEEK", "LAST_4_BIWEEKS"],
  months: ["THIS_MONTH", "LAST_MONTH", "LAST_3_MONTHS", "LAST_6_MONTHS", "LAST_12_MONTHS", "MONTHS_THIS_YEAR"],
  bimonths: ["THIS_BIMONTH", "LAST_BIMONTH", "LAST_6_BIMONTHS"],
  quarters: ["THIS_QUARTER", "LAST_QUARTER", "LAST_4_QUARTERS", "QUARTERS_THIS_YEAR"],
  sixmonths: ["THIS_SIX_MONTH", "LAST_SIX_MONTH", "LAST_2_SIXMONTHS"],
  financialYears: ["THIS_FINANCIAL_YEAR", "LAST_FINANCIAL_YEAR", "LAST_5_FINANCIAL_YEARS"],
  years: [
    "THIS_YEAR",
    "LAST_YEAR",
    "LAST_5_YEARS",
    "LAST_10_YEARS",
    "LAST_5_FINANCIAL_YEARS",
    "LAST_10_FINANCIAL_YEARS",
  ],
}

const fixedPeriodTypes = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Weekly (Start Wednesday)", value: "weeklyWed" },
  { label: "Weekly (Start Thursday)", value: "weeklyThu" },
  { label: "Weekly (Start Saturday)", value: "weeklySat" },
  { label: "Weekly (Start Sunday)", value: "weeklySun" },
  { label: "Bi-weekly", value: "biWeekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Bi-monthly", value: "biMonthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Six-monthly", value: "sixMonthly" },
  { label: "Six-monthly April", value: "sixMonthlyApril" },
  { label: "Yearly", value: "yearly" },
  { label: "Financial Year (April)", value: "financialApril" },
  { label: "Financial Year (July)", value: "financialJuly" },
  { label: "Financial Year (October)", value: "financialOct" },
]

const TabButton = ({ selected, onClick, children }) => (
  <button
    onClick={(e) => {
      // Stop event propagation to prevent it from bubbling up
      e.stopPropagation()
      e.preventDefault()
      onClick()
    }}
    className={`px-4 py-2 font-medium rounded-t-lg ${
      selected ? "bg-white border-b-2 border-primary text-primary" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
)

const TransferList = ({ 
  availableOptions, 
  selectedOptions, 
  onSelect, 
  onDeselect, 
  isPeriodInBulletin = false, 
  onSelectAll, 
  onDeselectAll 
}) => {
  // Determine if select buttons should be disabled (for bulletin mode with 1+ selections)
  const isSelectDisabled = isPeriodInBulletin && selectedOptions.length > 0
  const hasAvailableOptions = availableOptions.length > 0
  const hasSelectedOptions = selectedOptions.length > 0

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Available Periods</h3>
          {hasAvailableOptions && !isPeriodInBulletin && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onSelectAll()
              }}
               className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition duration-200"
            >
              Select All
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {availableOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                // Stop event propagation
                e.stopPropagation()
                e.preventDefault()
                onSelect(option)
              }}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded ${
                isSelectDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSelectDisabled}
            >
              {option.label}
            </button>
          ))}
        </div>
        {isPeriodInBulletin && selectedOptions.length > 0 && (
          <div className="mt-2 text-sm text-red-600">Only one weekly period can be selected</div>
        )}
      </div>
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Selected Periods</h3>
          {hasSelectedOptions && !isPeriodInBulletin && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onDeselectAll()
              }}
               className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition duration-200"
            >
              Deselect All
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                // Stop event propagation
                e.stopPropagation()
                e.preventDefault()
                onDeselect(option)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex justify-between items-center"
            >
              <span>{option.label}</span>
              <span className="text-red-500">×</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface PeriodPickerProps {
  setIsShowPeriod?: any
  onUpdate?: any
  isDataModalBeingUsedInMap?: boolean
  isAnalyticsDataHardCoded?: boolean
  setDataSubmitted?: (submitted: boolean) => void
  isPeriodInBulletin?: boolean // New prop for filtering to only weekly
}

const PeriodPicker: React.FC<PeriodPickerProps> = ({
  onUpdate,
  setIsShowPeriod,
  isDataModalBeingUsedInMap,
  isAnalyticsDataHardCoded,
  setDataSubmitted,
  isPeriodInBulletin = false, // Default to false
}) => {
  const {
    analyticsDimensions,
    setAnalyticsDimensions,
    fetchAnalyticsData,
    analyticsPayloadDeterminer,
    isFetchAnalyticsDataLoading,
    selectedDataSourceDetails,
    selectedOrganizationUnits,
    selectedOrgUnitGroups,
    selectedOrganizationUnitsLevels,
    isUseCurrentUserOrgUnits,
    isSetPredifinedUserOrgUnits
  } = useAuthorities()
  const [selectedTab, setSelectedTab] = useState(isPeriodInBulletin ? "fixed" : "relative")
  const [selectedPeriodGroup, setSelectedPeriodGroup] = useState("days")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedPeriodType, setSelectedPeriodType] = useState(isPeriodInBulletin ? "weekly" : "monthly")
  const [availablePeriods, setAvailablePeriods] = useState([])
  const [allPeriodOptions, setAllPeriodOptions] = useState(new Map())

  // Get filtered period types based on isPeriodInBulletin prop
  const getFilteredPeriodTypes = () => {
    if (isPeriodInBulletin) {
      // Show all period types with "weekly" in their value
      return fixedPeriodTypes.filter(
        (type) =>
          type.value === "weekly" ||
          type.value === "weeklyWed" ||
          type.value === "weeklyThu" ||
          type.value === "weeklySat" ||
          type.value === "weeklySun" ||
          type.value === "biWeekly",
      )
    }
    return fixedPeriodTypes
  }

  const generateFixedPeriods = (year, periodType) => {
    const periods = []
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    switch (periodType) {
      case "daily":
        for (let day = 1; day <= 31; day++) {
          const formattedDay = day.toString().padStart(2, "0")
          periods.push({
            label: `${year}-${formattedDay}`,
            value: `${year}${formattedDay}`,
          })
        }
        break

      case "weekly":
        for (let week = 1; week <= 52; week++) {
          const formattedWeek = week.toString().padStart(2, "0")
          periods.push({
            label: `Week ${week}, ${year}`,
            value: `${year}W${formattedWeek}`,
          })
        }
        break

      case "weeklyWed":
        for (let week = 1; week <= 52; week++) {
          periods.push({
            label: `Week ${week} (Wed), ${year}`,
            value: `${year}WedW${week}`,
          })
        }
        break

      case "weeklyThu":
        for (let week = 1; week <= 52; week++) {
          periods.push({
            label: `Week ${week} (Thu), ${year}`,
            value: `${year}ThuW${week}`,
          })
        }
        break

      case "weeklySat":
        for (let week = 1; week <= 52; week++) {
          periods.push({
            label: `Week ${week} (Sat), ${year}`,
            value: `${year}SatW${week}`,
          })
        }
        break

      case "weeklySun":
        for (let week = 1; week <= 52; week++) {
          periods.push({
            label: `Week ${week} (Sun), ${year}`,
            value: `${year}SunW${week}`,
          })
        }
        break

      case "biWeekly":
        for (let biWeek = 1; biWeek <= 26; biWeek++) {
          periods.push({
            label: `Bi-week ${biWeek}, ${year}`,
            value: `${year}BiW${biWeek}`,
          })
        }
        break

      case "monthly":
        months.forEach((month, index) => {
          periods.push({
            label: `${month} ${year}`,
            value: `${year}${(index + 1).toString().padStart(2, "0")}`,
          })
        })
        break

      case "biMonthly":
        for (let i = 0; i < 6; i++) {
          periods.push({
            label: `${months[i * 2]}-${months[i * 2 + 1]} ${year}`,
            value: `${year}${(i + 1).toString()}B`,
          })
        }
        break

      case "quarterly":
        for (let quarter = 1; quarter <= 4; quarter++) {
          periods.push({
            label: `Q${quarter} ${year}`,
            value: `${year}Q${quarter}`,
          })
        }
        break

      case "sixMonthly":
        periods.push(
          {
            label: `January-June ${year}`,
            value: `${year}S1`,
          },
          {
            label: `July-December ${year}`,
            value: `${year}S2`,
          },
        )
        break

      case "sixMonthlyApril":
        periods.push(
          {
            label: `April-September ${year}`,
            value: `${year}AprilS1`,
          },
          {
            label: `October-March ${year}`,
            value: `${year}AprilS2`,
          },
        )
        break

      case "yearly":
        periods.push({
          label: year.toString(),
          value: year.toString(),
        })
        break

      case "financialApril":
        periods.push({
          label: `April ${year} - March ${year + 1}`,
          value: `${year}April`,
        })
        break

      case "financialJuly":
        periods.push({
          label: `July ${year} - June ${year + 1}`,
          value: `${year}July`,
        })
        break

      case "financialOct":
        periods.push({
          label: `October ${year} - September ${year + 1}`,
          value: `${year}Oct`,
        })
        break
    }

    return periods
  }

  const filterRelativePeriods = (group) => {
    const periods = groupedPeriods[group] || []
    return periods.map((period) => ({
      label: period.replace(/_/g, " "),
      value: period,
      type: "relative",
    }))
  }

  const updateAvailablePeriods = () => {
    let newPeriods
    if (selectedTab === "relative") {
      newPeriods = filterRelativePeriods(selectedPeriodGroup)
    } else {
      newPeriods = generateFixedPeriods(selectedYear, selectedPeriodType)
    }

    // Update all period options map
    const newOptionsMap = new Map(allPeriodOptions)
    newPeriods.forEach((period) => {
      newOptionsMap.set(period.value, period)
    })
    setAllPeriodOptions(newOptionsMap)

    // Filter out already selected periods from available periods
    setAvailablePeriods(newPeriods.filter((period) => !analyticsDimensions?.pe?.includes(period.value)))
  }

  const handleTabChange = (tab) => {
    setSelectedTab(tab)
    updateAvailablePeriods()
  }

  const handlePeriodSelect = (period) => {
    // For bulletin mode, replace the existing selection with the new one
    let newSelectedPeriods

    if (isPeriodInBulletin) {
      // Replace any existing selection with the new one
      newSelectedPeriods = [period.value]
    } else {
      // Normal behavior - add to existing selections
      newSelectedPeriods = [...(analyticsDimensions.pe || []), period.value]
    }

    setAnalyticsDimensions((prev) => ({
      ...prev,
      pe: newSelectedPeriods,
    }))

    // Update available periods
    if (isPeriodInBulletin) {
      // If in bulletin mode, move all currently selected periods back to available list
      // then remove the newly selected period
      const currentSelected = analyticsDimensions.pe || []
      const allCurrentPeriods = [...availablePeriods]

      currentSelected.forEach((periodValue) => {
        const periodObject = allPeriodOptions.get(periodValue)
        if (periodObject) {
          allCurrentPeriods.push(periodObject)
        }
      })

      // Remove the newly selected period from available list
      setAvailablePeriods(allCurrentPeriods.filter((p) => p.value !== period.value))
    } else {
      // Normal behavior
      setAvailablePeriods((prev) => prev.filter((p) => p.value !== period.value))
    }
  }

  const handlePeriodDeselect = (period) => {
    const newSelectedPeriods = analyticsDimensions?.pe?.filter((value) => value !== period.value)

    setAnalyticsDimensions((prev) => ({
      ...prev,
      pe: newSelectedPeriods,
    }))

    // Add back to available periods if appropriate
    if (
      (selectedTab === "relative" && period.type === "relative") ||
      (selectedTab === "fixed" && period.type !== "relative")
    ) {
      setAvailablePeriods((prev) => [...prev, period])
    }
  }

  // Handle selecting all available periods
  const handleSelectAll = () => {
    // Skip this functionality in bulletin mode
    if (isPeriodInBulletin) return

    // Get all available period values
    const availablePeriodValues = availablePeriods.map(period => period.value)
    
    // Combine with existing selections
    const newSelectedPeriods = [
      ...(analyticsDimensions.pe || []),
      ...availablePeriodValues
    ]

    // Update analytics dimensions
    setAnalyticsDimensions(prev => ({
      ...prev,
      pe: newSelectedPeriods
    }))

    // Clear available periods
    setAvailablePeriods([])
  }

  // Handle deselecting all periods
  const handleDeselectAll = () => {
    // Skip this functionality in bulletin mode
    if (isPeriodInBulletin) return

    // Get current selected periods to add back to available
    const currentSelected = analyticsDimensions.pe || []
    const periodsToAddBack = []

    // For each selected period, determine if it should be added back to available list
    currentSelected.forEach(periodValue => {
      const periodObject = allPeriodOptions.get(periodValue)
      if (periodObject) {
        const isRelativePeriod = periodObject.type === "relative"
        
        // Add period back if it matches the current tab
        if ((selectedTab === "relative" && isRelativePeriod) || 
            (selectedTab === "fixed" && !isRelativePeriod)) {
          periodsToAddBack.push(periodObject)
        }
      }
    })

    // Clear selected periods
    setAnalyticsDimensions(prev => ({
      ...prev,
      pe: []
    }))

    // Add periods back to available list
    setAvailablePeriods(prev => [...prev, ...periodsToAddBack])
  }

  const handleUpdate = async (e) => {
    // Stop event propagation
    e.stopPropagation()
    e.preventDefault()

    onUpdate?.(analyticsDimensions.pe)
    if (isAnalyticsDataHardCoded) {
      analyticsDimensions.dx = dimensionDataHardCoded
    }
    const checking = await fetchAnalyticsData({dimension:formatAnalyticsDimensions(analyticsDimensions), instance:selectedDataSourceDetails,analyticsPayloadDeterminer,
      selectedOrganizationUnits,
      selectedOrgUnitGroups,
      selectedOrganizationUnitsLevels,
      isUseCurrentUserOrgUnits,
      isSetPredifinedUserOrgUnits
    })
    console.log("period modal fetched analytics", checking)
    setDataSubmitted?.(true)
    setIsShowPeriod && setIsShowPeriod(false)
  }

  // Initialize component with appropriate defaults based on isPeriodInBulletin
  useEffect(() => {
    if (isPeriodInBulletin) {
      setSelectedTab("fixed")

      // Don't force 'weekly' as the period type
      // setSelectedPeriodType('weekly');

      // If there are multiple periods selected and we're in bulletin mode,
      // keep only the first one
      if (analyticsDimensions?.pe && analyticsDimensions.pe.length > 1) {
        const firstPeriod = analyticsDimensions.pe[0]
        setAnalyticsDimensions((prev) => ({
          ...prev,
          pe: [firstPeriod],
        }))
      }
    }
  }, [isPeriodInBulletin])

  useEffect(() => {
    updateAvailablePeriods()
  }, [selectedTab, selectedPeriodGroup, selectedYear, selectedPeriodType])

  // Get selected period objects with labels
  const selectedPeriodObjects = (analyticsDimensions?.pe || []).map((periodValue) => {
    const periodObject = allPeriodOptions.get(periodValue)
    return periodObject || { value: periodValue, label: periodValue } // Fallback if not found
  })

  // Get filtered period types
  const filteredPeriodTypes = getFilteredPeriodTypes()

  return (
    <div
      className="w-full max-w-4xl p-6 bg-white rounded-lg shadow"
      onClick={(e) => {
        // Stop event propagation to prevent closing the parent dialog
        e.stopPropagation()
      }}
    >
      {/* Hide the tab selection when in bulletin mode */}
      {!isPeriodInBulletin && (
        <div className="flex gap-2 mb-6 border-b">
          <TabButton selected={selectedTab === "relative"} onClick={() => handleTabChange("relative")}>
            Relative periods
          </TabButton>
          <TabButton selected={selectedTab === "fixed"} onClick={() => handleTabChange("fixed")}>
            Fixed periods
          </TabButton>
        </div>
      )}

      {selectedTab === "relative" && !isPeriodInBulletin && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Period group</label>
          <select
            value={selectedPeriodGroup}
            onChange={(e) => {
              // Stop event propagation
              e.stopPropagation()
              setSelectedPeriodGroup(e.target.value)
              updateAvailablePeriods()
            }}
            className="w-full p-2 border rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {Object.keys(groupedPeriods).map((group) => (
              <option key={group} value={group}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {(selectedTab === "fixed" || isPeriodInBulletin) && (
        <div className="flex gap-3">
          {/* Period Type - only show if not in bulletin or show but disabled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period Type</label>
            <select
              value={selectedPeriodType}
              onChange={(e) => {
                // Stop event propagation
                e.stopPropagation()
                setSelectedPeriodType(e.target.value)
                updateAvailablePeriods()
              }}
              className="w-full p-2 border rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
              // disabled={isPeriodInBulletin} // Remove this line to enable selection in bulletin mode
            >
              {filteredPeriodTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => {
                // Stop event propagation
                e.stopPropagation()
                setSelectedYear(Number.parseInt(e.target.value, 10))
                updateAvailablePeriods()
              }}
              className="w-full p-2 border rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <TransferList
        availableOptions={availablePeriods}
        selectedOptions={selectedPeriodObjects}
        onSelect={handlePeriodSelect}
        onDeselect={handlePeriodDeselect}
        isPeriodInBulletin={isPeriodInBulletin}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />

      {!isDataModalBeingUsedInMap && (
        <div className="flex justify-end mt-6">
          <Button
            text={isFetchAnalyticsDataLoading ? "Loading" : "Update"}
            onClick={handleUpdate}
            variant="primary"
            type="button"
            icon={<IoSaveOutline />}
            disabled={isPeriodInBulletin && (!analyticsDimensions?.pe || analyticsDimensions.pe.length === 0)}
          />
        </div>
      )}
    </div>
  )
}

export default PeriodPicker