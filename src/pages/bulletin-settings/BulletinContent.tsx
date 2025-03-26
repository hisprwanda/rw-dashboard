import React, { useEffect, useState } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { fetchTrackedEntities, fetchEvents } from '../report/components/BulletinService';

interface Attribute {
    attribute: string;
    displayName: string;
    value: string;
}

interface TrackedEntityInstance {
    attributes: Attribute[];
}

const BulletinContent: React.FC = () => {
    const engine = useDataEngine(); 
    const [messages, setMessages] = useState<string[]>([]);
    const [totalEvents, setTotalEvents] = useState<number>(0);
    const [trackedData, settrackedData] = useState<TrackedEntityInstance[] | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [diseaseCount, setDiseaseCount] = useState<Record<string, number>>({});
    const [dataLoading, setdataLoading] = useState<boolean>(true);
    const [dataError, setdataError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchTrackedEntities(engine, 'BPZcHDS6OO0', 'U86iDWxDek8');
                const otherProgramResponse = await fetchEvents(engine, 'Hjw70Lodtf2', 'ecvn9SiIEXz');
                const malariaResponse = await fetchEvents(engine, 'Hjw70Lodtf2', 'zCy7bqFHOpa');
                console.log("impuruza Program", otherProgramResponse)
                console.log("malaria Program", malariaResponse)
                
                setMessages([...malariaResponse.message, ...otherProgramResponse.message]);
                setTotalEvents(malariaResponse.totalEvents + otherProgramResponse.totalEvents);
                settrackedData(response.instances);
                setDiseaseCount(response.occurenceCount);
                setTotal(response.total);
            } catch (err) {
                setdataError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setdataLoading(false);
            }
        };

        console.log("mewetertertressages", messages)

        loadData();
    }, [engine]);

    if (dataLoading) return <p>Loading...</p>;
    if (dataError) return <p>Error: {dataError}</p>;

    return (
        <div>
            <h2 className='font-bold'>IDSR Immediate Report: {total}</h2>
            <ul>
                {Object.entries(diseaseCount).map(([disease, count]) => (
                    <li key={disease}>{count} cases of {disease} reported</li>
                ))}
            </ul>
            <div>
                <h1 className='font-bold'>Impuruza Cases</h1>
                {messages.length > 0 ? (
                    <ul>
                        {messages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No cases found.</p>
                )}
                <h3>Total Events: {totalEvents}</h3>
            </div>
        </div>
    );
};

export default BulletinContent;

