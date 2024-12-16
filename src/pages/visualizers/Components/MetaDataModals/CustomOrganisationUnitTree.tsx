import React, { useState } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import axios from 'axios';
import { CircularLoader } from '@dhis2/ui'; // Optional loader

const CustomOrganisationUnitTree = ({ apiUrl, token, rootOrgUnitId, onNodeSelect }) => {
    const [treeNodes, setTreeNodes] = useState([]);
    const [checked, setChecked] = useState([]);
    const [expanded, setExpanded] = useState([]);
    const [loadingNodes, setLoadingNodes] = useState({}); // Track loading for each node

    // Function to map organisation units to CheckboxTree-compatible nodes
    const mapOrgUnitsToTreeNodes = (orgUnits) => {
        return orgUnits.map((orgUnit) => ({
            value: orgUnit.id, // Unique identifier for the node
            label: orgUnit.displayName, // Display name for the node
            children: orgUnit.hasChildren ? [] : null, // Set empty array for children if node has children; otherwise null
        }));
    };

    // Function to fetch organisation units
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

    // Function to handle expanding nodes
    const handleExpand = async (nodeIds) => {
        const newNodes = [...expanded, ...nodeIds];
        setExpanded(newNodes);

        for (const nodeId of nodeIds) {
            // Check if already expanded
            if (!treeNodes.find((node) => node.value === nodeId)?.children.length) {
                setLoadingNodes((prev) => ({ ...prev, [nodeId]: true })); // Mark as loading
                const children = await fetchOrgUnits(nodeId);
                const mappedChildren = mapOrgUnitsToTreeNodes(children);

                // Update tree nodes with fetched children
                setTreeNodes((prev) =>
                    prev.map((node) =>
                        node.value === nodeId ? { ...node, children: mappedChildren } : node
                    )
                );
                setLoadingNodes((prev) => ({ ...prev, [nodeId]: false })); // Unmark as loading
            }
        }
    };

    // Initial fetch for root org unit
    React.useEffect(() => {
        const initializeTree = async () => {
            const rootChildren = await fetchOrgUnits(rootOrgUnitId);
            setTreeNodes(mapOrgUnitsToTreeNodes(rootChildren));
        };

        initializeTree();
    }, [rootOrgUnitId]);

    // Handle checkbox changes
    const handleCheck = (checkedNodes) => {
        setChecked(checkedNodes);
        const selectedNodes = treeNodes.filter((node) => checkedNodes.includes(node.value));
        onNodeSelect(selectedNodes);
    };

    return (
        <div>
            <h3>Organisation Units</h3>
            {treeNodes.length === 0 ? (
                <CircularLoader />
            ) : (
                <CheckboxTree
                    nodes={treeNodes}
                    checked={checked}
                    expanded={expanded}
                    onCheck={handleCheck}
                    onExpand={handleExpand}
                    iconsClass="fa5" // Use FontAwesome icons
                    showNodeIcon={false} // Disable folder/file icons
                    icons={{
                        check: <span className="fa fa-check-square" />, // Custom icons
                        uncheck: <span className="fa fa-square-o" />,
                        expandClose: <span className="fa fa-plus-square" />,
                        expandOpen: <span className="fa fa-minus-square" />,
                        halfCheck: <span className="fa fa-minus-square" />,
                    }}
                />
            )}
        </div>
    );
};

export default CustomOrganisationUnitTree;
