"use client"

import { useDataQuery, useDataEngine } from "@dhis2/app-runtime"
import i18n from "@dhis2/d2-i18n"
import minisanteLogo from "./images/minisante_logo.png"
import rbcLogo from "./images/rbc_logo.png"
import  React from "react"
import {  Key, useState, useEffect, useRef } from "react"
import { Treemap, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@dhis2/ui"
import { useAuthorities } from "../../../context/AuthContext"
import { fetchTrackedEntities, fetchEvents } from "./BulletinService"
import { dimensionDataHardCoded } from "../../../constants/bulletinDimension"
import { Textarea } from "../../../components/ui/textarea"
import { BulletinAreaChart } from "./BulletinAreaCharts"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Download } from "lucide-react"

const datastoreQuery = {
  results: {
    resource: `dataStore/epide-bulletin/epide`,
  },
}

const dataF = [
  {
    name: "W1",
    "2023": 123,
    "2024": 3500,
    threshold: 5500,
  },
  // ... rest of the data
]

let dataM: any[] = []

const COLORSM = ["#3b82f6", "#ef4444", "#9ca3af"]

interface Attribute {
  attribute: string
  displayName: string
  value: string
}

interface TrackedEntityInstance {
  attributes: Attribute[]
}

const getRandomColor = () => {
  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 8)]
  }
  return color
}

let dataTreeMap: any[] = []

const CustomizedContent = ({ root, depth, x, y, width, height, index, colors, name, value }) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors,
          stroke: "#fff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
        {name}
      </text>
      <text x={x + width / 2} y={y + height / 2 - 7} textAnchor="middle" fill="#fff" fontSize={14}>
        {value}
      </text>
    </g>
  )
}

const ReportTemplate: React.FC = () => {
  const {
    analyticsData,
    isFetchAnalyticsDataLoading,
    visualTitleAndSubTitle,
    visualSettings,
    analyticsDimensions,
    fetchAnalyticsData,
    selectedDataSourceDetails,
  } = useAuthorities()
  const engine = useDataEngine()
  const [messages, setMessages] = useState<string[]>([])
  const [alertFromCommunity, setAlertFromCommunity] = useState<string[]>([])
  const [IBSHighlightMessage, setIBSHighlightMessage] = useState<string[]>([])
  const [totalEvents, setTotalEvents] = useState<number>(0)
  const [DiseaseData, setDiseasesMessage] = useState<string[]>([])
  const [DeathData, setDeathsMessage] = useState<string[]>([])
  const [pieChartDescription, setPieChartDescription] = useState<string>()
  const [deathDescription, setDeathDescription] = useState<string>()
  const [total, setTotal] = useState<number>(0)
  const [diseaseCount, setDiseaseCount] = useState<Record<string, number>>({})
  const [dataLoading, setDataLoading] = useState<boolean>(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [totalOrgUnit, setTotalOrgUnit] = useState<number>(0)
  const [showLanding, setShowLanding] = useState<boolean>(true)
  const [showDeaths, setShowDeath] = useState<number>(0)
  const [immediateReportableDiseasesNotes, setImmediateReportableDiseasesNotes] = useState<string[]>([])
  const [outbreakDescriptionNotes, setOutbreakDescriptionNotes] = useState<string[]>([])
  const [actionTakenNotes, setActionTakenNotes] = useState<string[]>([])
  const [completenessDescriptionNotes, setCompletenessDescriptionNotes] = useState<string[]>([])
  const [completenessNotes, setCompletenessNotes] = useState<string[]>([])
  const [currentImmediateReportableDiseasesNote, setCurrentImmediateReportableDiseasesNote] = useState("")
  const [currentOutbreakDescriptionNote, setCurrentOutbreakDescriptionNote] = useState("")
  const [currentActionTakenNote, setCurrentActionTakenNote] = useState("")
  const [currentCompletenessDescriptionNote, setCurrentCompletenessDescriptionNote] = useState("")
  const [currentCompletenessNote, setCurrentCompletenessNote] = useState("")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  // Improved PDF generation function
  const handleDownload = async () => {
    if (!contentRef.current || isGeneratingPDF) return

    try {
      setIsGeneratingPDF(true)

      // Clone the content to modify it for PDF
      const element = contentRef.current.cloneNode(true) as HTMLElement

      // First, make sure all saved notes are visible in the document
      // We'll keep the notes but remove the input elements

      // Process each form container to keep notes but remove inputs
      const formContainers = element.querySelectorAll(".form-container")
      formContainers.forEach((container) => {
        // Get all the notes content first (these are the saved notes)
        const notesContent = container.querySelector(".mb-4")

        // Create a new div to hold just the notes
        const notesOnlyDiv = document.createElement("div")
        notesOnlyDiv.className = "notes-for-pdf"

        // If there are saved notes, copy them to our new div
        if (notesContent) {
          notesOnlyDiv.innerHTML = notesContent.innerHTML
        }

        // Replace the entire form container with just the notes
        if (container.parentNode) {
          if (notesContent) {
            // Only replace if there are actual notes
            container.parentNode.replaceChild(notesOnlyDiv, container)
          } else {
            // If no notes, just remove the container
            container.parentNode.removeChild(container)
          }
        }
      })

      // Remove any remaining input elements that might not be in form containers
      const inputElements = element.querySelectorAll("textarea, button, input")
      inputElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })

      // Remove any empty divs that might have contained the form elements
      const emptyDivs = element.querySelectorAll("div:empty")
      emptyDivs.forEach((div) => {
        if (div.parentNode) {
          div.parentNode.removeChild(div)
        }
      })

      // Remove the fixed page height styling for PDF generation
      const pageSections = element.querySelectorAll(".page-section")
      pageSections.forEach((section) => {
        const sectionElement = section as HTMLElement
        sectionElement.style.minHeight = "auto"
        sectionElement.style.position = "relative"
        sectionElement.style.pageBreakAfter = "always"
        sectionElement.style.marginBottom = "20px"
      })

      // Create a temporary container for the modified content
      const tempContainer = document.createElement("div")
      tempContainer.appendChild(element)
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "-9999px"
      document.body.appendChild(tempContainer)

      // Create PDF with A4 size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Process each page section separately
      const sections = element.querySelectorAll(".page-section")

      if (sections.length > 0) {
        // Process each page section
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i] as HTMLElement

          // Add a new page for each section after the first one
          if (i > 0) {
            pdf.addPage()
          }

          const canvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            onclone: (clonedDoc) => {
              // Additional cleanup in the cloned document
              const clonedSections = clonedDoc.querySelectorAll(".page-section")
              clonedSections.forEach((section) => {
                // Remove all form elements
                const formElements = section.querySelectorAll("textarea, button, input, .form-container")
                formElements.forEach((el) => el.parentNode?.removeChild(el))
              })
            },
          })

          // Calculate the scaling to fit the page width
          const imgWidth = pdfWidth
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          // If the section is too tall for one page, split it across multiple pages
          if (imgHeight > pdfHeight) {
            let heightLeft = imgHeight
            let position = 0
            let pageCount = 0

            while (heightLeft > 0) {
              // Add image to current page
              pdf.addImage(
                canvas.toDataURL("image/jpeg", 1.0),
                "JPEG",
                0,
                position,
                imgWidth,
                imgHeight,
                undefined,
                "FAST",
              )

              heightLeft -= pdfHeight

              // Add new page if there's still content to add
              if (heightLeft > 0) {
                position -= pdfHeight
                pdf.addPage()
                pageCount++
              }
            }
          } else {
            // Content fits on a single page
            pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST")
          }
        }
      } else {
        // Fallback to processing the entire content if no page sections are found
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
        })

        const imgWidth = pdfWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // If content is taller than a page, split it across multiple pages
        if (imgHeight > pdfHeight) {
          let heightLeft = imgHeight
          let position = 0

          while (heightLeft > 0) {
            // Add image to current page
            pdf.addImage(
              canvas.toDataURL("image/jpeg", 1.0),
              "JPEG",
              0,
              position,
              imgWidth,
              imgHeight,
              undefined,
              "FAST",
            )

            // Reduce height left and move position
            heightLeft -= pdfHeight
            position -= pdfHeight

            // Add new page if there's still content to add
            if (heightLeft > 0) {
              pdf.addPage()
            }
          }
        } else {
          // Content fits on a single page
          pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST")
        }
      }

      // Save the PDF
      pdf.save(`Epidemiological_Bulletin_${weekNumber || "Report"}.pdf`)

      // Clean up
      document.body.removeChild(tempContainer)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating the PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Complete implementation with debugging and proper data formatting
  const renderAreaCharts = () => {
    const SelectedChart = BulletinAreaChart

    if (!SelectedChart || !analyticsData || !dimensionDataHardCoded) {
      console.log("Missing required data:", {
        hasChart: !!SelectedChart,
        hasAnalyticsData: !!analyticsData,
        hasDimensions: !!dimensionDataHardCoded,
      })
      return null
    }

    // Format data in the structure expected by the chart component
    const formatChartData = (diseaseId) => {
      // Filter rows for this specific disease
      const diseaseRows = analyticsData.rows.filter((row) => row[0] === diseaseId)

      if (diseaseRows.length === 0) {
        return []
      }

      // Sort by period to ensure chronological order
      diseaseRows.sort((a, b) => a[1].localeCompare(b[1]))
      const diseaseName = getDiseaseNameById(diseaseId)

      // Transform to the format expected by the chart component
      return diseaseRows.map((row) => ({
        dx: row[0],
        pe: row[1],
        month: analyticsData.metaData.items[row[1]]?.name || row[1], // Period name if available
        name: diseaseName,
        [diseaseName]: Number.parseFloat(row[2]),
      }))
    }

    

    // Get the disease IDs from the metadata
    const diseaseIds = analyticsData.metaData.dimensions.dx || dimensionDataHardCoded

    // Return an array of area charts, one for each disease ID
    return diseaseIds.map((diseaseId) => {
      const chartData = formatChartData(diseaseId)
      console.log("analyticsData", chartData)

      // If we have data for this disease ID, render a chart
      if (chartData.length > 0) {
        const diseaseName =
          analyticsData.metaData.items[diseaseId]?.name || getDiseaseNameById(diseaseId) || `Disease ${diseaseId}`

        return (
          <div key={diseaseId} className="mb-8">
            <SelectedChart
              data={chartData}
              visualTitleAndSubTitle={{
                ...visualTitleAndSubTitle,
                title: diseaseName,
              }}
              visualSettings={{
                ...visualSettings,
                // Make sure these settings are compatible with your chart component
                xAxis: {
                  ...visualSettings?.xAxis,
                  dataKey: "name", // Use period name for x-axis
                },
                yAxis: {
                  ...visualSettings?.yAxis,
                },
                series: [
                  {
                    dataKey: "value",
                    name: diseaseName,
                  },
                ],
              }}
            />
          </div>
        )
      }

      return (
        <div key={diseaseId} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">
            {analyticsData.metaData.items[diseaseId]?.name || getDiseaseNameById(diseaseId) || `Disease ${diseaseId}`}
          </h3>
          <div className="p-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">No data found</div>
        </div>
      )
    })
  }

  const getDiseaseNameById = (id) => {
    // Corrected disease mapping based on your JSON metadata
    const diseaseNames = {
      CxTT5NVd8o1: "Simple malaria",
      TnhQi1knkS7: "Flu syndrome",
      Efu7jw6Y45t: "Severe pneumonia under 5 years",
      KLdYJhoI1yM: "Rabies exposure",
      XCuqmbPR8vX: "COVID-19",
      j10s9Gfed0c: "Non bloody diarrhoea under 5 years",
    }

    return diseaseNames[id] || null
  }

  const saveNote = (
    noteType: "immediate" | "outbreak" | "actionTaken" | "completenessDescription" | "completeness",
    note: string,
    setNotes: React.Dispatch<React.SetStateAction<string[]>>,
    setCurrentNote: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (note.trim()) {
      switch (noteType) {
        case "immediate":
          setImmediateReportableDiseasesNotes((prev) => [...prev, note])
          break
        case "outbreak":
          setOutbreakDescriptionNotes((prev) => [...prev, note])
          break
        case "actionTaken":
          setActionTakenNotes((prev) => [...prev, note])
          break
        case "completenessDescription":
          setCompletenessDescriptionNotes((prev) => [...prev, note])
          break
        case "completeness":
          setCompletenessNotes((prev) => [...prev, note])
          break
      }

      // Clear the current note
      setCurrentNote("")
    }
  }

  function extractWeekData(weekString) {
    // Use a regular expression to match the week number and the dates
    const regex = /(Week \d+)\s+(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/
    const match = weekString?.match(regex)

    if (match) {
      const weekNumber = match[1] // First captured group (week number)
      const startDate = match[2] // Second captured group (start date)
      const endDate = match[3] // Third captured group (end date)

      return {
        weekNumber: weekNumber,
        startDate: startDate,
        endDate: endDate,
      }
    } else {
      return {
        weekNumber: null,
        startDate: null,
        endDate: null,
      }
    }
  }

  // Extract period data
  const selectedPeriod = analyticsData?.metaData?.dimensions?.pe || []
  const selectedItems = analyticsData?.metaData?.items || {}
  const key = selectedPeriod[selectedPeriod.length - 1]
  const value = selectedItems[key]
  const periodName = value?.name || ""
  const { startDate, endDate, weekNumber } = extractWeekData(periodName)

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true)
        const response = await fetchTrackedEntities(engine, "Hjw70Lodtf2", "U86iDWxDek8", startDate, endDate)
        const otherProgramResponse = await fetchEvents(engine, "Hjw70Lodtf2", "ecvn9SiIEXz", startDate, endDate)
        const malariaResponse = await fetchEvents(engine, "Hjw70Lodtf2", "zCy7bqFHOpa", startDate, endDate)
        dataM = response.pieChartData
        dataTreeMap = response.treeMapData.map((item) => ({ ...item, color: getRandomColor() }))
        setMessages([...malariaResponse.message, ...otherProgramResponse.message])
        setAlertFromCommunity([...malariaResponse.alertFromCommunity, ...otherProgramResponse.alertFromCommunity])
        setIBSHighlightMessage(response.IBSHighlightMessage)
        setTotalEvents(malariaResponse.totalEvents + otherProgramResponse.totalEvents)
        setDiseasesMessage(response.diseaseMessages)
        setDeathsMessage(response.deathMessages)
        setPieChartDescription(response.PieChartDescription)
        setDeathDescription(response.totalDeathMessages)
        setShowDeath(response.totalReportedDeaths)
        setTotal(response.total)
      } catch (err) {
        setDataError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [engine]) // Ensure that the engine is the only dependency

  const { error, loading, data } = useDataQuery(datastoreQuery)
  if (error) {
    return <span>{i18n.t("ERROR")}</span>
  }

  if (loading || dataLoading || isFetchAnalyticsDataLoading) {
    return <span>{i18n.t("Loading...")}</span>
  }

  return (
    <>
      {/* Fixed position download button that's always visible when scrolling */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          primary
          onClick={handleDownload}
          icon={<Download />}
          className="flex items-center gap-2 shadow-lg"
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? "Generating PDF..." : "Download Bulletin"}
        </Button>
      </div>

      <h1 className="text-center text-3xl font-bold uppercase tracking-wide my-6">Epidemiological Bulletin</h1>

      <div id="content-to-download" ref={contentRef} className="bg-white mx-auto mt-5 rounded-lg shadow-md max-w-4xl">
        {/* First page content - Cover page */}
        <div className="page-section p-5 pb-10" id="cover-page">
          {/* Header Logos */}
          <div className="flex justify-between mb-5">
            <img
              className="w-72"
              src={minisanteLogo || "/placeholder.svg"}
              alt="Republic of Rwanda Ministry of Health"
            />
            <img className="w-72" src={rbcLogo || "/placeholder.svg"} alt="Rwanda Biomedical Centre" />
          </div>

          {/* Title Section */}
          <div className="text-center p-5 rounded-lg mb-5 mt-10">
            <h2 className="text-5xl font-bold uppercase tracking-wide">{data?.results?.page1.titles[0]}</h2>
            <h3 className="text-2xl mt-4">{weekNumber}</h3>
            <h3 className="text-xl mt-2">
              {startDate} - {endDate}
            </h3>
            <div className="py-4 px-6 mt-4 inline-block">
              {/* <h3 className="text-3xl font-extrabold text-black">{title}</h3> */}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 rounded-lg mb-5 text-center">
            <h4 className="mb-2 text-xl text-center font-bold mb-2">{data?.results?.page1.titles[1]}</h4>
            <p className="m-0 text-black leading-relaxed text-xl">{data?.results?.page1.body_content[0]}</p>
            <p className="m-0 text-black leading-relaxed mt-4 text-xl mb-8">{data?.results?.page1.body_content[1]}</p>
          </div>

          {/* Additional Sections */}
          <div className="p-4 rounded-lg mb-5 text-center">
            <p>
              <span className="font-bold">{data?.results?.page1.titles[2]}:</span>{" "}
              {data?.results?.page1.body_content[2]}
            </p>
          </div>
        </div>

        {/* Page 2 - Surveillance Overview */}
        <div className="page-section p-5" id="surveillance-overview">
          <h1 className="bg-blue-400 text-xl text-center font-bold py-4 mb-5">{data?.results?.page2.main_titles[0]}</h1>
          <h2 className="text-md font-bold mb-2">{data?.results?.page2.main_titles[1]}:</h2>
          <ul className="list-disc pl-4">
            {totalEvents > 0 ? (
              <>
                <li>
                  <span className="font-bold">{data?.results?.page2.sub_titles[0]}:</span> {totalEvents} alerts:
                  {alertFromCommunity.length > 0 ? (
                    <span>
                      {alertFromCommunity.map((msg, index) => (
                        <span key={index}>{msg},</span>
                      ))}
                    </span>
                  ) : (
                    <p>No cases found.</p>
                  )}
                </li>
              </>
            ) : null}
            <li className="bold mr-5">
              <span className="font-bold">{data?.results?.page2.sub_titles[1]}:</span>{" "}
              {data?.results?.page2.body_content.Alert_from_EIOS[0]}
            </li>
            <ul className="list-disc pl-6">
              <li>{data?.results?.page2.body_content.Alert_from_EIOS[1]}</li>
              <li>{data?.results?.page2.body_content.Alert_from_EIOS[2]}</li>
            </ul>
            {total > 0 ? (
              <>
                <li className="font-bold">{data?.results?.page2.sub_titles[2]}</li>
                <ul>
                  {IBSHighlightMessage.length > 0 ? (
                    <ul className="list-disc pl-6">
                      {IBSHighlightMessage.map((msg, index) => (
                        <li key={index}>{msg}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No cases found.</p>
                  )}
                </ul>
              </>
            ) : null}
            <li className="font-bold">{data?.results?.page2.sub_titles[3]}</li>
            <ul className="list-disc pl-6">
              {data?.results?.page2?.body_content.outbreaks_updates.map((update: any, index) => (
                <li key={index}>{update}</li>
              ))}
            </ul>
            <li className="font-bold">{data?.results?.page2.sub_titles[4]}</li>
            <ul className="list-disc pl-6">
              <li>{data?.results?.page2?.body_content.completness[0]}</li>
            </ul>
          </ul>
        </div>

        {/* Page 3 - Community Based Surveillance */}
        <div className="page-section p-5" id="community-surveillance">
          <h1 className="bg-blue-400 text-xl text-center font-bold py-4 mb-5">
            {data?.results?.page3.main_titles[0]} {weekNumber}
          </h1>
          <div className="mb-4">
            <span className="font-bold">{data?.results?.page3.main_titles[1]}:</span>
            {data?.results?.page3?.body_content.description.map((parag: any, index: Key | null | undefined) => (
              <p key={index} className="mt-2">
                {parag}
              </p>
            ))}
          </div>

          <h2 className="font-bold mb-4">{data?.results?.page3.main_titles[2]}</h2>
          <ul className="list-disc pl-4">
            {totalEvents > 0 ? (
              <>
                <li>
                  <span className="font-bold">{data?.results?.page3.sub_titles[0]}:</span> {totalEvents} alerts
                </li>
                <ul className="list-disc pl-6">
                  {messages.length > 0 ? (
                    <ul>
                      {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No cases found.</p>
                  )}
                </ul>
              </>
            ) : null}

            <li>
              <span className="font-bold">{data?.results?.page3.sub_titles[1]}:</span>{" "}
              {data?.results?.page3.body_content.Alert_from_EIOS[0]}
            </li>
            <ul className="list-disc pl-6">
              {data?.results?.page3.body_content.Alert_from_EIOS.map((item: any, index: any) => {
                if (Array.isArray(item)) {
                  return (
                    <>
                      {item.map((alert, alertIndex) => (
                        <li key={alertIndex} className="text-gray-800">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <p>{alert.content}</p>
                        </li>
                      ))}
                    </>
                  )
                }
                return null
              })}
            </ul>
          </ul>
        </div>

        {/* Page 4 - Immediate Reportable Diseases */}
        {total > 0 ? (
          <div className="page-section p-5" id="immediate-reportable">
            <h1 className="bg-blue-400 text-xl text-center font-bold py-4 mb-5">
              {data?.results?.page4.main_titles[0]}
            </h1>
            <p>
              <span className="font-bold">{data?.results?.page4.sub_titles[0]}: </span>
              {data?.results?.page4?.body_content.description}
            </p>
            <h2 className="text-center font-bold my-4">IMMEDIATE REPORTABLE DISEASES – EPI{weekNumber}</h2>
            <p>During this Epi week, {total} cases of immediate reportable diseases were notified:</p>
            <ul className="list-disc pl-8">
              {DiseaseData.length > 0 ? (
                <ul>
                  {DiseaseData.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              ) : (
                <p>No cases found.</p>
              )}
            </ul>

            {/* Immediate Reportable Diseases Notes Section */}
            <div className="form-container p-4 rounded-lg mb-5">
              {/* Display saved notes */}
              {immediateReportableDiseasesNotes.length > 0 && (
                <div className="mb-4">
                  <h2 className="font-bold my-4">{data?.results?.page4?.sub_titles[1]}:</h2>
                  <ul className="list-disc pl-6">
                    {immediateReportableDiseasesNotes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Textarea
                label="IMMEDIATE REPORTABLE DISEASES Notes"
                name="immediateReportableDiseasesNotes"
                value={currentImmediateReportableDiseasesNote}
                onChange={(e) => setCurrentImmediateReportableDiseasesNote(e.target.value)}
                placeholder="Enter notes..."
              />
              <div className="mt-2">
                <Button
                  primary
                  onClick={() =>
                    saveNote(
                      "immediate",
                      currentImmediateReportableDiseasesNote,
                      setImmediateReportableDiseasesNotes,
                      setCurrentImmediateReportableDiseasesNote,
                    )
                  }
                >
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Page 5 - Weekly Reportable Diseases */}
        <div className="page-section p-5" id="weekly-reportable">
          <h2 className="text-center font-bold text-2xl my-4">WEEKLY REPORTABLE DISEASES – EPI {weekNumber}</h2>
          <p>
            <span className="font-bold">{data?.results?.pages.sub_titles[0]}</span>:{" "}
            {data?.results?.pages.reportable_description[0]}{" "}
          </p>
          <p className="mb-4">{data?.results?.pages.reportable_description[1]}</p>
          <h3 className="font-bold mt-4 mb-2">{data?.results?.pages.sub_titles[1]}</h3>

          <div className="mb-5">{renderAreaCharts()}</div>
        </div>

        {/* Page 6 - Deaths and Distribution */}
        {showDeaths > 0 ? (
          <div className="page-section p-5" id="deaths-distribution">
            <h2 className="text-center font-bold text-2xl my-4">
              DISTRIBUTION OF REPORTED DEATHS IN eIDSR – EPIDEMIOLOGICAL {weekNumber}
            </h2>
            <p className="mb-4">{pieChartDescription}</p>
            <div className="mb-6" style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataM}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {dataM &&
                      dataM.length > 0 &&
                      dataM.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORSM[index % COLORSM.length]} />
                      ))}
                  </Pie>
                  <Legend verticalAlign="bottom" layout="horizontal" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="mb-4">{deathDescription}</p>
            {DeathData.length > 0 ? (
              <ul className="list-disc pl-6 mb-6">
                {DeathData.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            ) : (
              <p className="mb-6">No cases found.</p>
            )}

            <h3 className="font-bold mb-4">{data?.results?.pages.sub_titles[2]}</h3>
            <div style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={dataTreeMap}
                  dataKey="value"
                  ratio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={<CustomizedContent />}
                />
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {/* Page 7 - Outbreak and Event Updates */}
        <div className="page-section p-5" id="outbreak-updates">
          <h1 className="bg-blue-400 text-xl text-center font-bold py-4 mb-5">{data?.results?.pages.main_titles[2]}</h1>
          <h2 className="font-bold mt-4 mb-4">{data?.results?.pages.sub_titles[3]}</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <tbody>
                <tr>
                  <td className="p-2 font-bold bg-slate-500 text-white border">Confirmed cases:</td>
                  <td className="p-2 border">4</td>
                  <td className="p-2 font-bold bg-slate-500 text-white border">Date reported:</td>
                  <td className="p-2 border">July 14, 2024</td>
                  <td className="p-2 font-bold bg-slate-500 text-white border">Risk assessment:</td>
                  <td className="p-2 border">Low</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-slate-500 text-white border">Suspected cases</td>
                  <td className="p-2 text-red-500 font-bold border">4</td>
                  <td className="p-2 font-bold bg-slate-500 text-white border">Source:</td>
                  <td className="p-2 border">eIDSR</td>
                  <td className="p-2 border" colSpan={2}></td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-slate-500 text-white border">Death(s)</td>
                  <td className="p-2 text-red-500 font-bold border">0</td>
                  <td className="p-2 font-bold bg-slate-500 text-white border">District/HFs:</td>
                  <td className="p-2 border">Kinyababa HC/ Butaro DH</td>
                  <td className="p-2 border" colSpan={2}></td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-slate-500 text-white border">Total cases</td>
                  <td className="p-2 text-green-500 font-bold border">13</td>
                  <td className="p-2 font-bold bg-slate-500 text-white border">Geoscope:</td>
                  <td className="p-2 border">Low</td>
                  <td className="p-2 border" colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-bold mt-6 mb-2">{data?.results?.pages.sub_titles[0]}</h3>
          {/* Outbreak Description Notes Section */}
          <div className="form-container mb-6">
            {outbreakDescriptionNotes.length > 0 && (
              <div className="mb-4">
                <ul className="list-disc pl-6">
                  {outbreakDescriptionNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <Textarea
              label="Outbreak Description Notes"
              name="outbreakDescriptionNotes"
              value={currentOutbreakDescriptionNote}
              onChange={(e) => setCurrentOutbreakDescriptionNote(e.target.value)}
              placeholder="Enter description..."
            />
            <div className="mt-2">
              <Button
                primary
                onClick={() =>
                  saveNote(
                    "outbreak",
                    currentOutbreakDescriptionNote,
                    setOutbreakDescriptionNotes,
                    setCurrentOutbreakDescriptionNote,
                  )
                }
              >
                Save Note
              </Button>
            </div>
          </div>

          <h3 className="font-bold mt-4 mb-2">{data?.results?.pages.sub_titles[4]}</h3>
          {/* Action Taken Notes Section */}
          <div className="form-container mb-6">
            {actionTakenNotes.length > 0 && (
              <div className="mb-4">
                <ul className="list-disc pl-6">
                  {actionTakenNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <Textarea
              label="Action Taken Notes"
              name="actionTakenNotes"
              value={currentActionTakenNote}
              onChange={(e) => setCurrentActionTakenNote(e.target.value)}
              placeholder="Enter notes..."
            />
            <div className="mt-2">
              <Button
                primary
                onClick={() =>
                  saveNote("actionTaken", currentActionTakenNote, setActionTakenNotes, setCurrentActionTakenNote)
                }
              >
                Save Note
              </Button>
            </div>
          </div>
        </div>

        {/* Page 8 - Completeness & Timeliness */}
        <div className="page-section p-5" id="completeness-timeliness">
          <h1 className="bg-blue-400 text-xl text-center font-bold py-4 mb-5">{data?.results?.pages.main_titles[3]}</h1>
          <p className="mb-4">{data?.results?.pages.body_content.completness_description[0]}</p>
          <ul className="list-disc pl-6 mb-6">
            {data?.results?.pages.body_content.timeless_completness.map((al: any, index) => (
              <li key={index}>{al}</li>
            ))}
          </ul>

          {/* Completeness Description Section */}
          <div className="form-container mb-6">
            {completenessDescriptionNotes.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Description:</h3>
                {completenessDescriptionNotes.map((note, index) => (
                  <p key={index}>{note}</p>
                ))}
              </div>
            )}

            <Textarea
              label="Completeness Description"
              name="completenessDescription"
              value={currentCompletenessDescriptionNote}
              onChange={(e) => setCurrentCompletenessDescriptionNote(e.target.value)}
              placeholder="Enter description..."
            />
            <div className="mt-2 mb-4">
              <Button
                primary
                onClick={() =>
                  saveNote(
                    "completenessDescription",
                    currentCompletenessDescriptionNote,
                    setCompletenessDescriptionNotes,
                    setCurrentCompletenessDescriptionNote,
                  )
                }
              >
                Save Description
              </Button>
            </div>
          </div>

          {/* Completeness Notes Section */}
          <div className="form-container mb-6">
            {completenessNotes.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Notes:</h3>
                <ul className="list-disc pl-6">
                  {completenessNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <Textarea
              label="Completeness Notes"
              name="completenessNotes"
              value={currentCompletenessNote}
              onChange={(e) => setCurrentCompletenessNote(e.target.value)}
              placeholder="Enter notes..."
            />
            <div className="mt-2">
              <Button
                primary
                onClick={() =>
                  saveNote("completeness", currentCompletenessNote, setCompletenessNotes, setCurrentCompletenessNote)
                }
              >
                Save Note
              </Button>
            </div>
          </div>

          {/* Completeness Table */}
          <div className="overflow-x-auto mt-6">
            <table className="table-auto w-full text-center text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th rowSpan={2} className="px-4 py-2 border">
                    Hospital catchment area
                  </th>
                  <th colSpan={14} className="px-4 py-2 border">
                    Completeness
                  </th>
                </tr>
                <tr>
                  {Array.from({ length: 14 }, (_, i) => (
                    <th key={i} className="px-2 py-1 border">
                      W{String(i + 1).padStart(2, "0")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">Area 1</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">85%</td>
                  <td className="border px-2 py-1 bg-orange-500 text-white">75%</td>
                  <td className="border px-2 py-1 bg-red-500 text-white">55%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">90%</td>
                  <td className="border px-2 py-1 bg-orange-500 text-white">65%</td>
                  <td className="border px-2 py-1 bg-red-500 text-white">50%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">80%</td>
                  <td className="border px-2 py-1 bg-orange-500 text-white">70%</td>
                  <td className="border px-2 py-1 bg-red-500 text-white">40%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">88%</td>
                  <td className="border px-2 py-1 bg-orange-500 text-white">60%</td>
                  <td className="border px-2 py-1 bg-red-500 text-white">45%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">92%</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Area 2</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">85%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">100%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">95%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">90%</td>
                  <td className="border px-2 py-1 bg-red-500 text-white">35%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">90%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">80%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">80%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">89%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">88%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">89%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">95%</td>
                  <td className="border px-2 py-1 bg-green-500 text-white">92%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReportTemplate

