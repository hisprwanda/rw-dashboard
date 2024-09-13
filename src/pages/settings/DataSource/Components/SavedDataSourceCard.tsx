import React from 'react';

type SavedDataProps = {
    data: {
        id: string;
        type: string;
        description: string;
        instanceName: string;
        authentication: {
            url: string;
            username: string;
            password: string;
        };
        isCurrentDHIS2: boolean;
    };
};

const SavedDataSourceCard: React.FC<SavedDataProps> = ({ data }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Instance Name: {data.instanceName}</h3>
                <p className="text-lg text-gray-600 mb-2">Data Source Type: {data.type}</p>
                {data.isCurrentDHIS2 && (
                    <span className="inline-block mt-2 px-4 py-1 text-sm font-medium bg-green-100 text-green-600 rounded-full">
                        Current DHIS2
                    </span>
                )}
            </div>
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">Description</h4>
                <p className="text-base text-gray-700">{data.description || 'No description provided'}</p>
            </div>
            <div className="border-t border-gray-300 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Authentication Details</h4>
                <p className="text-base text-gray-700 mb-2">
                    <strong>URL:</strong> {data.authentication.url}
                </p>
                <p className="text-base text-gray-700 mb-2">
                    <strong>Username:</strong> {data.authentication.username}
                </p>
                <p className="text-base text-gray-700 mb-2">
                    <strong>Password:</strong> {data.authentication.password}
                </p>
            </div>
        </div>
    );
};

export default SavedDataSourceCard;
