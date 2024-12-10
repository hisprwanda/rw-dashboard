import React, { useState } from 'react';
import { useQuery } from 'react-query'; // For data fetching
import axios from 'axios'; // For API calls

// Custom tree node component
const TreeNode = ({ node, onExpand, selected, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            onExpand(node);
        }
    };

    return (
        <div style={{ marginLeft: 20 }}>
            <div
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                }}
                onClick={() => onSelect(node)}
            >
                {node.children ? (
                    <span onClick={handleExpand}>
                        {isExpanded ? '-' : '+'}
                    </span>
                ) : (
                    <span style={{ width: 10 }}></span>
                )}
                <span
                    style={{
                        paddingLeft: 10,
                        fontWeight: selected?.id === node.id ? 'bold' : 'normal',
                    }}
                >
                    {node.displayName}
                </span>
            </div>
            {isExpanded &&
                node.children &&
                node.children.map((child) => (
                    <TreeNode
                        key={child.id}
                        node={child}
                        onExpand={onExpand}
                        selected={selected}
                        onSelect={onSelect}
                    />
                ))}
        </div>
    );
};

// Main tree component
const CustomOrganisationUnitTree = ({ apiUrl, token, rootOrgUnitId, onNodeSelect }) => {
    const [treeData, setTreeData] = useState({});
    const [selectedNode, setSelectedNode] = useState(null);

    const fetchOrgUnit = async (parentId) => {
        const response = await axios.get(`${apiUrl}/organisationUnits/${parentId}`, {
            params: {
                fields: 'id,displayName,path,children[id,displayName,path]',
                paging: false,
            },
            headers: {
                Authorization: `ApiToken ${token}`,
            },
        });
        return response.data;
    };

    const { isLoading, isError, data, refetch } = useQuery(
        ['orgUnit', rootOrgUnitId],
        () => fetchOrgUnit(rootOrgUnitId),
        {
            enabled: !!rootOrgUnitId,
            onSuccess: (data) => {
                setTreeData({ [rootOrgUnitId]: data });
            },
        }
    );

    const handleExpand = async (node) => {
        if (!treeData[node.id]) {
            const data = await fetchOrgUnit(node.id);
            setTreeData((prev) => ({
                ...prev,
                [node.id]: data,
            }));
        }
    };

    const handleSelect = (node) => {
        setSelectedNode(node);
        onNodeSelect(node);
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading organisation units</div>;

    return (
        <div>
            <h3>Organisation Unit Tree</h3>
            {treeData[rootOrgUnitId]?.children.map((child) => (
                <TreeNode
                    key={child.id}
                    node={child}
                    onExpand={handleExpand}
                    selected={selectedNode}
                    onSelect={handleSelect}
                />
            ))}
        </div>
    );
};

export default CustomOrganisationUnitTree;
