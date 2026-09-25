import { useAuthorities } from '../../../../context/AuthContext'
import { useDataEngine } from '@dhis2/app-runtime'
import { CircularLoader } from '@dhis2/ui'
import { useQueryClient } from '@tanstack/react-query'
import React, { useState, useEffect, useCallback } from 'react'
import { orgUnitChildrenQuery } from '@/features/org-units'

const CustomOrganisationUnitTree = ({
    apiUrl,
    token,
    rootOrgUnitId,
    onNodeSelect,
    parentName,
    realParentId,
}) => {
    const { isUseCurrentUserOrgUnits, setSelectedOrganizationUnits, selectedOrganizationUnits } =
        useAuthorities()
    const [treeData, setTreeData] = useState({})
    const [expanded, setExpanded] = useState([])
    const [loading, setLoading] = useState({})
    const [error, setError] = useState(null)
    const [isOpenRealParent, setIsOpenRealParent] = useState(false)
    const engine = useDataEngine()
    const queryClient = useQueryClient()

    // Fetch organization units with correct query parameters
    const fetchOrgUnits = useCallback(
        async (parentId) => {
            try {
                setLoading((prev) => ({ ...prev, [parentId]: true }))

                // Cached per instance + parent, shared with every other tree.
                const children = await queryClient.fetchQuery(
                    orgUnitChildrenQuery(
                        engine,
                        { isCurrentInstance: false, url: apiUrl, token },
                        parentId
                    )
                )

                // Update tree data with new children
                setTreeData((prev) => ({
                    ...prev,
                    [parentId]: children,
                }))

                return children
            } catch (err) {
                setError(`Failed to fetch organization units: ${err.message}`)
                return []
            } finally {
                setLoading((prev) => {
                    const newLoading = { ...prev }
                    delete newLoading[parentId]
                    return newLoading
                })
            }
        },
        [apiUrl, token, engine, queryClient]
    )

    // Initialize tree with root node
    useEffect(() => {
        fetchOrgUnits(rootOrgUnitId)
    }, [fetchOrgUnits, rootOrgUnitId])

    // Handle node expansion
    const handleExpand = async (nodeId) => {
        if (expanded.includes(nodeId)) {
            setExpanded((prev) => prev.filter((id) => id !== nodeId))
        } else {
            setExpanded((prev) => [...prev, nodeId])
            if (!treeData[nodeId]) {
                await fetchOrgUnits(nodeId)
            }
        }
    }

    // Handle checkbox selection
    const handleCheck = (nodeId) => {
        setSelectedOrganizationUnits((prev) => {
            const newChecked = prev.includes(nodeId)
                ? prev.filter((id) => id !== nodeId)
                : [...prev, nodeId]

            // Call the callback with selected nodes
            const selectedNodes = newChecked.map((id) => {
                // Find the node data in our tree
                for (const children of Object.values(treeData)) {
                    const node = children.find((child) => child.id === id)
                    if (node) return node
                }
                return { id }
            })

            onNodeSelect(selectedNodes)
            return newChecked
        })
    }

    // Render a single node
    const renderNode = (node) => {
        const isExpanded = expanded.includes(node.id)
        const isChecked = selectedOrganizationUnits?.includes(node.id)
        const isLoading = loading[node.id]
        const children = treeData[node.id] || []
        const hasChildren = children.length > 0 || !treeData[node.id] // Assume it has children if we haven't loaded them yet

        return (
            <div key={node.id} className="ml-6">
                <div className="flex items-center ">
                    {/* Expansion button */}
                    <button
                        onClick={() => handleExpand(node.id)}
                        className="w-4 h-4 mr-1 flex items-center justify-center border rounded hover:bg-gray-100"
                    >
                        <span className="text-lg">{isExpanded ? '−' : '+'}</span>
                    </button>

                    {/* Checkbox */}
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheck(node.id)}
                        className="mr-2"
                        disabled={isUseCurrentUserOrgUnits}
                    />

                    {/* Node name */}
                    {isLoading ? (
                        <span className="text-lg">
                            <CircularLoader small />
                        </span>
                    ) : (
                        <span className="text-lg">{node.displayName}</span>
                    )}
                </div>

                {/* Children */}
                {isExpanded && (
                    <div className="ml-2 border-l border-gray-200">
                        {children.map((child) => renderNode(child))}
                    </div>
                )}
            </div>
        )
    }

    // Render root level
    const renderTree = () => {
        const rootNodes = treeData[rootOrgUnitId] || []

        if (error) {
            return <div className="text-red-500 p-4">{error}</div>
        }

        if (!rootNodes.length && loading[rootOrgUnitId]) {
            return (
                <div className="flex justify-center p-4">
                    <CircularLoader small />
                </div>
            )
        }

        return rootNodes.map((node) => renderNode(node))
    }

    return (
        <div className="w-full max-w-xl border rounded-lg p-4">
            <div className="flex items-center ">
                {/* Expansion button */}
                <button
                    onClick={() => setIsOpenRealParent((prev) => !prev)}
                    className="w-4 h-4 mr-1 flex items-center justify-center border rounded hover:bg-gray-100"
                >
                    <span className="text-lg">{isOpenRealParent ? '−' : '+'}</span>
                </button>

                {/* Checkbox */}
                <input type="checkbox" className="mr-2" disabled={isUseCurrentUserOrgUnits} />
                <p className="text-lg">{parentName}</p>
            </div>
            {isOpenRealParent && renderTree()}
        </div>
    )
}

export default CustomOrganisationUnitTree
