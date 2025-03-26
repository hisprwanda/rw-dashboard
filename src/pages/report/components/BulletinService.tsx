import { useDataEngine } from '@dhis2/app-runtime';

interface Attribute {
    attribute: string;
    displayName: string;
    value: string;
}

interface TrackedEntityInstance {
    attributes: Attribute[];
}

interface EventDataValue {
    dataElement: string;
    value: string;
}

interface ApiResponseTrackedEntities {
    trackedEntities: {
        total: number;
        instances: TrackedEntityInstance[];
    };
}

interface ApiResponseOrgUnit {
    displayName: string;
}

interface ApiResponseEvents {
    trackerEvents: {
        total: number;
        instances: EventDataValue[];
    };
}
export const fetchOrgUnitName = async (engine: any, orgUnitId: string): Promise<string> => {
    try {
        const response = await engine.query({
            orgUnit: {
                resource: `organisationUnits/${orgUnitId}`,
                params: {
                    fields: 'displayName',
                },
            },
        });
        return response.orgUnit.displayName || orgUnitId;
    } catch (error) {
        console.error(`Error fetching org unit name for ID ${orgUnitId}:`, error);
        return orgUnitId;
    }
};

export const fetchTrackedEntities = async (
    engine: any,
    orgUnit: string,
    program: string,
    enrollmentEnrolledAfter: string,
    enrollmentEnrolledBefore: string
): Promise<{ 
    diseaseMessages: string[];
    deathMessages: string[];
    publicEventMessages: string[];
    IBSHighlightMessage: string[];
    PieChartDescription: string;
    totalDeathMessages: string;
    totalReportedDeaths: number;
    treeMapData: { name: string; value: number }[];
    pieChartData: { name: string; value: number }[];
    total: number; 
    totalOrgUnits: Record<string, number>;
}> => {
    try {
        const result: ApiResponseTrackedEntities = await engine.query({
            trackedEntities: {
                resource: 'tracker/trackedEntities',
                params: {
                    enrollmentEnrolledAfter,
                    enrollmentEnrolledBefore,
                    orgUnit,
                    program,
                    fields: 'orgUnit,attributes[attribute,displayName,value]',
                    totalPages: true,
                    ouMode: 'DESCENDANTS',
                    skipPaging: true
                },
            },
        });
        
        const diseaseCounts: Record<string, number> = {};
        const deathCounts: Record<string, Record<string, number>> = {}; // Store death type counts per orgUnit
        const publicEventCounts: Record<string, number> = {};
        const uniqueOrgUnits: Record<string, Set<string>> = {};
        const totalDeathTypes: Record<string, number> = {}; // Track overall death type counts

        result.trackedEntities.instances.forEach((instance) => {
            let currentOrgUnit = instance.orgUnit;
            let category: string | null = null;
            let diseaseType: string | null = null;

            instance.attributes.forEach((attr) => {
                if (attr.attribute === 'uOTHyxNv2W4') {
                    const value = attr.value.toLowerCase();
                    diseaseType = attr.value;
                    if (value.includes("death")) {
                        category = 'deaths';
                    } else if (value.includes("public health event")) {
                        category = 'publicEvents';
                    } else {
                        category = 'diseases';
                    }
                }
            });
            
            if (category && diseaseType) {
                if (!uniqueOrgUnits[diseaseType]) {
                    uniqueOrgUnits[diseaseType] = new Set();
                }
                uniqueOrgUnits[diseaseType].add(currentOrgUnit);
                
                if (category === 'deaths') {
                    if (!deathCounts[currentOrgUnit]) {
                        deathCounts[currentOrgUnit] = {};
                    }
                    if (!deathCounts[currentOrgUnit][diseaseType]) {
                        deathCounts[currentOrgUnit][diseaseType] = 0;
                    }
                    deathCounts[currentOrgUnit][diseaseType] += 1;
                    
                    if (!totalDeathTypes[diseaseType]) {
                        totalDeathTypes[diseaseType] = 0;
                    }
                    totalDeathTypes[diseaseType] += 1;
                } else if (category === 'publicEvents') {
                    if (!publicEventCounts[diseaseType]) {
                        publicEventCounts[diseaseType] = 0;
                    }
                    publicEventCounts[diseaseType] += 1;
                } else {
                    if (!diseaseCounts[diseaseType]) {
                        diseaseCounts[diseaseType] = 0;
                    }
                    diseaseCounts[diseaseType] += 1;
                }
            }
        });

        let diseaseMessages: string[] = [];
        let deathMessages: string[] = [];
        let publicEventMessages: string[] = [];
        let IBSHighlightMessage: string[] = [];
        let allDiseases: string[] = [];
        let totalDeaths = 0;
        let totalPublicEvents = 0;
        let treeMapData: { name: string; value: number }[] = [];
        let pieChartData: { name: string; value: number }[] = [];
        
        Object.entries(diseaseCounts).forEach(([disease, count]) => {
            const uniqueOrgUnitCount = uniqueOrgUnits[disease]?.size || 0;
            diseaseMessages.push(`${count} cases of ${disease.replace(/_/g, ' ')} reported by ${uniqueOrgUnitCount} HFs`);
            allDiseases.push(disease);
        });

        const reportingFacilities = new Set<string>();
        for (const [orgUnit, deathTypes] of Object.entries(deathCounts)) {
            const deathsInUnit = Object.values(deathTypes).reduce((sum, count) => sum + count, 0);
            totalDeaths += deathsInUnit;
            reportingFacilities.add(orgUnit);
            const orgUnitName = await fetchOrgUnitName(engine, orgUnit);
            const deathDetails = Object.entries(deathTypes)
                .map(([deathType, count]) => `${count} were ${deathType}`)
                .join(', ');
            deathMessages.push(`${deathsInUnit} deaths were reported by ${orgUnitName} (${deathDetails})`);
            treeMapData. push({name: orgUnitName, value: deathsInUnit})
        }


        const totalDeathMessages = `${totalDeaths} deaths were reported from ${reportingFacilities.size} health facilities as follows:`;
        const totalReportedDeaths = totalDeaths;

        Object.entries(publicEventCounts).forEach(([eventType, count]) => {
            const uniqueOrgUnitCount = uniqueOrgUnits[eventType]?.size || 0;
            totalPublicEvents += count;
            publicEventMessages.push(`${count} cases of ${eventType} reported by ${uniqueOrgUnitCount} HFs`);
        });
        
        // Determine most reported death types
        const sortedDeathTypes = Object.entries(totalDeathTypes).sort((a, b) => b[1] - a[1]);
        const topDeathTypes = sortedDeathTypes.slice(0, 2).map(([type]) => type).join(' and ');

        if (result.trackedEntities.instances.length > 0) {
            IBSHighlightMessage.push(`${result.trackedEntities.instances.length} immediate reportable events were notified by health facilities countrywide. These include: ${allDiseases.join(', ')}.`);
        }
        // Check if there are any reported deaths
        if (totalDeaths > 0) {
            IBSHighlightMessage.push(`A total of ${totalDeaths} deaths were reported through the electronic Integrated Disease Surveillance and Response (eIDSR) system. Most of the deaths were ${topDeathTypes}.`);
        }
        // Check if there are any public events reported
        if (totalPublicEvents > 0) {
            IBSHighlightMessage.push(`A total of ${totalPublicEvents} public events were reported.`);
        }

        // Prepare PieChart Data
        pieChartData = sortedDeathTypes.map(([type, count]) => ({ name: type, value: count }));

        // Pie Chart Description
        const pieChartDescription = `As summarized in the Pie Chart below, a total number of ${totalDeaths} deaths were reported through the electronic Integrated Disease Surveillance and Response (eIDSR) system. ${sortedDeathTypes.map(([type, count]) => `${count} (${((count / totalDeaths) * 100).toFixed(2)}%) were ${type}`).join(', ')}.`;

        return {
            diseaseMessages,
            deathMessages,
            publicEventMessages,
            IBSHighlightMessage,
            PieChartDescription: pieChartDescription,
            pieChartData,
            treeMapData,
            totalDeathMessages,
            totalReportedDeaths,
            total: result.trackedEntities.instances.length,
            totalOrgUnits: Object.fromEntries(
                Object.entries(uniqueOrgUnits).map(([key, orgUnitSet]) => [key, orgUnitSet.size])
            ),
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
};



export const fetchEvents = async (
    engine: any,
    orgUnit: string,
    program: string,
    enrollmentEnrolledAfter: string,
    enrollmentEnrolledBefore: string
): Promise<{ message: string[]; totalEvents: number; totalOrgUnits: Record<string, number>; alertFromCommunity: string[] }> => {
    try {
        const result: ApiResponseEvents = await engine.query({
            trackerEvents: {
                resource: 'tracker/events',
                params: {
                    orgUnit,
                    program,
                    fields: 'orgUnit,dataValues[dataElement,value]',
                    totalPages: true,
                    ouMode: 'DESCENDANTS',
                    enrollmentEnrolledAfter,
                    enrollmentEnrolledBefore
                    // skipPaging: true
                },
            },
        });

        let totalMalariaCases = 0;
        const occurenceCount: { [key: string]: number } = {};
        const uniqueOrgUnits: { [key: string]: Set<string> } = {}; // Track unique orgUnits per disease
        let signalLocation: string | null = null;
        let signalCode: string | null = null;
        let malariaCases = 0;
        let malariaCode: string | null = null;
        const malariaOrgUnits = new Set<string>(); // Track unique orgUnits for Malaria

        result.trackerEvents.instances.forEach((event) => {
            let currentOrgUnit = event.orgUnit; // Get the orgUnit of the event
            
            event.dataValues.forEach((dataValue: any) => {
                if (dataValue.dataElement === 'ockM6peJ7Pe') {
                    signalCode = dataValue.value;
                }
                if (dataValue.dataElement === 'OEVkQ1ds77r') {
                    signalLocation = dataValue.value;
                }

                if (dataValue.dataElement === 'kAnIYiYs5ni') {
                    malariaCode = dataValue.value;
                }

                if (dataValue.dataElement === 'B84KCmNtKPl') {
                    malariaCases = parseInt(dataValue.value, 10) || 0;
                }
            });

            // If both signalCode and signalLocation are found, update the count
            if (signalCode && signalLocation) {
                const key = `${signalCode}-${signalLocation}`;
                
                if (!occurenceCount[key]) {
                    occurenceCount[key] = 0;
                }
                occurenceCount[key] += 1;

                // Track unique orgUnits per signal
                if (!uniqueOrgUnits[key]) {
                    uniqueOrgUnits[key] = new Set();
                }
                uniqueOrgUnits[key].add(currentOrgUnit);
            }

            if (malariaCode) {
                if (malariaCode === 'Malaria') {
                    totalMalariaCases += malariaCases;
                    malariaOrgUnits.add(currentOrgUnit); // Track unique orgUnits for Malaria
                } else {
                    occurenceCount[malariaCode] = (occurenceCount[malariaCode] || 0) + 1;
                    
                    if (!uniqueOrgUnits[malariaCode]) {
                        uniqueOrgUnits[malariaCode] = new Set();
                    }
                    uniqueOrgUnits[malariaCode].add(currentOrgUnit);
                }
            }
        });

        let messages: string[] = [];
        let alertFromCommmunityMessage: string[] = [];

        if (totalMalariaCases > 0) {
            messages.push(`${totalMalariaCases} cases of Malaria reported by ${malariaOrgUnits.size} villages`);
            alertFromCommmunityMessage.push(`${totalMalariaCases} malaria cases `);
        }

        Object.entries(occurenceCount).forEach(([disease, count]) => {
            const uniqueOrgUnitCount = uniqueOrgUnits[disease]?.size || 0;
            messages.push(`${count} cases of ${disease.replace(/_/g, ' ')} reported by ${uniqueOrgUnitCount} villages`);
            alertFromCommmunityMessage.push(`${count} ${disease.replace(/_/g, ' ')} cases`);
        });

        return {
            message: messages,
            totalEvents: result.trackerEvents.total,
            totalOrgUnits: Object.fromEntries(
                Object.entries(uniqueOrgUnits).map(([disease, orgUnitSet]) => [disease, orgUnitSet.size])
            ),
            alertFromCommunity: alertFromCommmunityMessage,
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
};




