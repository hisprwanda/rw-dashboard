import React, { useState, useEffect } from 'react'
import { MultiSelectField, MultiSelectOption } from '@dhis2/ui'
import { useAuthorities } from '../../../../context/AuthContext'

interface OrganizationUnitLevelsProps {
    isUseCurrentUserOrgUnits: boolean
    isDataModalBeingUsedInMap?: boolean
}

const OrganizationUnitLevels: React.FC<OrganizationUnitLevelsProps> = ({
    isUseCurrentUserOrgUnits,
    isDataModalBeingUsedInMap,
}) => {
    const {
        currentUserInfoAndOrgUnitsData,
        setSelectedOrganizationUnitsLevels,
        selectedOrganizationUnitsLevels,
        selectedLevel,
        setSelectedLevel,
    } = useAuthorities()

    // states

    const orgUnitLevels =
        currentUserInfoAndOrgUnitsData?.orgUnitLevels?.organisationUnitLevels || []
    const handleChange = ({ selected }: { selected: string[] }) => {
        const selectedLevelsAsNumbers = selected.map(Number)
        setSelectedLevel(selectedLevelsAsNumbers)

        const selectedLevelIds = orgUnitLevels
            .filter((level) => selected.includes(String(level.level)))
            .map((level) => (isDataModalBeingUsedInMap ? level.level : level.id))

        setSelectedOrganizationUnitsLevels(selectedLevelIds)
    }

    return (
        <MultiSelectField
            disabled={isUseCurrentUserOrgUnits}
            className="w-full  z-50 bg-white"
            label="Choose Organisation Unit Levels"
            onChange={handleChange}
            selected={selectedLevel ? selectedLevel.map(String) : []}
            placeholder="Select levels"
        >
            {orgUnitLevels.map((level) => (
                <MultiSelectOption
                    key={level.id}
                    value={String(level.level)}
                    label={level.displayName}
                />
            ))}
        </MultiSelectField>
    )
}

export default OrganizationUnitLevels
