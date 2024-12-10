import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query'; // For data fetching
import axios from 'axios'; // For API calls
import { CircularLoader } from '@dhis2/ui';
import { useAuthorities } from '../../../../context/AuthContext';


// Custom tree node component
const TreeNode = ({ node, onExpand, selectedNodes, onSelect }) => {
    const {isUseCurrentUserOrgUnits}  = useAuthorities()

    useEffect(()=>{
        console.log("hello test",isUseCurrentUserOrgUnits)
    },[isUseCurrentUserOrgUnits])
    const [isExpanded, setIsExpanded] = useState(false);

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded && !node.childrenFetched) {
            onExpand(node);
        }
    };

    const handleCheckboxChange = () => {
        onSelect(node);
    };

    return (
        <div style={{ marginLeft: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {node.hasChildren && (
                    <span
                        style={{
                            cursor: 'pointer',
                            paddingRight: 5,
                            userSelect: 'none',
                        }}
                        onClick={handleExpand}
                    >
                        {isExpanded ? '-' : '+'}
                    </span>
                )}
                <input
                    type="checkbox"
                    checked={selectedNodes.some((selected) => selected.id === node.id)}
                    onChange={handleCheckboxChange}
                    disabled={isUseCurrentUserOrgUnits}
                />
                <span style={{ paddingLeft: 10 }}>{node.displayName}</span>
            </div>
            {isExpanded &&
                node.children &&
                node.children.map((child) => (
                    <TreeNode
                        key={child.id}
                        node={child}
                        onExpand={onExpand}
                        selectedNodes={selectedNodes}
                        onSelect={onSelect}
                    />
                ))}
        </div>
    );
};

// Main tree component
const CustomOrganisationUnitTree = ({ apiUrl, token, rootOrgUnitId, onNodeSelect,parentName }) => {
    const [treeData, setTreeData] = useState({});
    const [selectedNodes, setSelectedNodes] = useState([]);

    const fetchOrgUnit = async (parentId) => {
        const response = await axios.get(`${apiUrl}/api/organisationUnits/${parentId}`, {
            params: {
                fields: 'id,displayName,path,hasChildren,children[id,displayName,path,hasChildren]',
                paging: false,
            },
            headers: {
                Authorization: `ApiToken ${token}`,
            },
        });
        return response.data;
    };

    const { isLoading, isError } = useQuery(
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
            const updatedNode = { ...node, children: data.children, childrenFetched: true };
            setTreeData((prev) => ({
                ...prev,
                [node.id]: updatedNode,
            }));
        }
    };

    const handleSelect = (node) => {
        setSelectedNodes((prev) => {
            const isAlreadySelected = prev.some((selected) => selected.id === node.id);
            const updatedSelection = isAlreadySelected
                ? prev.filter((selected) => selected.id !== node.id)
                : [...prev, node];
            onNodeSelect(updatedSelection);
            return updatedSelection;
        });
    };

    if (isLoading) return <CircularLoader/>
    if (isError) return <div>Error fetching external organisation units</div>;

    return (
        <div>
            <h3>{parentName}</h3>
            {treeData[rootOrgUnitId]?.children?.map((child) => (
                <TreeNode
                    key={child?.id}
                    node={child}
                    onExpand={handleExpand}
                    selectedNodes={selectedNodes}
                    onSelect={handleSelect}
                />
            ))}
        </div>
    );
};

export default CustomOrganisationUnitTree;
