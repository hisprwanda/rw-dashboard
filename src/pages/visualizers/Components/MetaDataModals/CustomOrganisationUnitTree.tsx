import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularLoader } from '@dhis2/ui';

const CustomOrganisationUnitTree = ({ apiUrl, token, rootOrgUnitId, onNodeSelect }) => {
    const [treeNodes, setTreeNodes] = useState([]);
    const [checked, setChecked] = useState([]);
    const [expanded, setExpanded] = useState([]);
    const [loadingNodes, setLoadingNodes] = useState({}); // Track loading for each node

    // Function to map organisation units to tree nodes
    const mapOrgUnitsToTreeNodes = (orgUnits) => {
        return orgUnits.map((orgUnit) => ({
            id: orgUnit.id,
            displayName: orgUnit.displayName,
            children: orgUnit.hasChildren ? [] : null,
            hasChildren: orgUnit.hasChildren,
        }));
    };

    // Fetch organisation units
    const fetchOrgUnits = async (parentId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/organisationUnits/${parentId}`, {
                params: {
                    fields: 'id,displayName,hasChildren,children[id,displayName,hasChildren]',
                    paging: false,
                },
                headers: {
                    Authorization: `ApiToken ${token}`,
                },
            });
            return response.data.children;
        } catch (error) {
            console.error('Error fetching organisation units:', error);
            return [];
        }
    };

    // Handle expanding nodes
    const handleExpand = async (nodeId) => {
        if (expanded.includes(nodeId)) {
            setExpanded((prev) => prev.filter((id) => id !== nodeId));
        } else {
            setExpanded((prev) => [...prev, nodeId]);

            if (treeNodes.find((node) => node.id === nodeId)?.children?.length === 0) {
                setLoadingNodes((prev) => ({ ...prev, [nodeId]: true }));
                const children = await fetchOrgUnits(nodeId);
                const mappedChildren = mapOrgUnitsToTreeNodes(children);

                setTreeNodes((prev) =>
                    prev.map((node) =>
                        node.id === nodeId ? { ...node, children: mappedChildren } : node
                    )
                );
                setLoadingNodes((prev) => ({ ...prev, [nodeId]: false }));
            }
        }
    };

    // Handle checkbox changes
    const handleCheck = (nodeId) => {
        console.log("hello node Id",nodeId)
        setChecked((prev) =>
            prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
        );
        const selectedNodes = treeNodes.filter((node) => checked.includes(node.id));
        onNodeSelect(selectedNodes);
    };

    // Initialize tree with root org unit
    useEffect(() => {
        const initializeTree = async () => {
            const rootChildren = await fetchOrgUnits(rootOrgUnitId);
            setTreeNodes(mapOrgUnitsToTreeNodes(rootChildren));
        };

        initializeTree();
    }, [rootOrgUnitId]);

    // Render tree nodes
    const renderTreeNodes = (nodes) => {
        return nodes.map((node) => (
            <div key={node.id} style={{ marginLeft: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {node.hasChildren && (
                        <button
                            onClick={() => handleExpand(node.id)}
                            style={{
                                marginRight: 8,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                        >
                            {expanded.includes(node.id) ? '-' : '+'}
                        </button>
                    )}
                   
                    <input
                        type="checkbox"
                        checked={checked.includes(node.id)}
                        onChange={() => handleCheck(node.id)}
                    />
                    <span style={{ marginLeft: 8 }}>{node.displayName}</span>
                </div>
                {loadingNodes[node.id] && <CircularLoader />}
                {expanded.includes(node.id) && node.children && renderTreeNodes(node.children)}
            </div>
        ));
    };

    return (
        <div>
            <h3>Organisation Units</h3>
            {treeNodes.length === 0 ? (
                <CircularLoader />
            ) : (
                <div>{renderTreeNodes(treeNodes)}</div>
            )}
        </div>
    );
};

export default CustomOrganisationUnitTree;
