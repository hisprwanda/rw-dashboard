import { useDataQuery, useDataEngine } from '@dhis2/app-runtime';
import i18n from '@dhis2/d2-i18n';
import minisanteLogo from './images/minisante_logo.png';
import rbcLogo from './images/rbc_logo.png';
import React,{ Key, useState, useEffect, useMemo,useRef } from 'react';
import React,{ Key, useState, useEffect, useMemo,useRef } from 'react';
import { Treemap,PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tab, Tabs, TabBar, Transfer, Button, Modal } from '@dhis2/ui';
import { useAuthorities } from '../../../context/AuthContext';
import { isValidInputData, transformDataForGenericChart } from '../../../lib/localGenericchartFormat';
import { fetchTrackedEntities, fetchEvents } from './BulletinService';
import { chartComponents } from '../../../constants/systemCharts';
import { dimensionDataHardCoded } from '../../../constants/bulletinDimension';
import { formatAnalyticsDimensions } from '../../../lib/formatAnalyticsDimensions';
import { Textarea } from "../../../components/ui/textarea";
import { BulletinAreaChart } from './BulletinAreaCharts';

import { dimensionDataHardCoded } from '../../../constants/bulletinDimension';
import { formatAnalyticsDimensions } from '../../../lib/formatAnalyticsDimensions';
import { Textarea } from "../../../components/ui/textarea";
import { BulletinAreaChart } from './BulletinAreaCharts';



const datastoreQuery = {
  results: {
    resource: `dataStore/epide-bulletin/epide`,
  },
};


const dataF = [
  {
    name: 'W1',
    '2023': 123,
    '2024': 3500,
    threshold: 5500,
  },
  {
    name: 'W2',
    '2023': 1313,
    '2024': 3700,
    threshold: 5200,
  },
  {
    name: 'W3',
    '2023': 1244,
    '2024': 3400,
    threshold: 4800,
  },
  {
    name: 'W4',
    '2023': 1312,
    '2024': 3400,
    threshold: 4000,
  },
  {
    name: 'W5',
    '2023': 1314,
    '2024': 2800,
    threshold: 4200,
  },
  {
    name: 'W6',
    '2023': 8900,
    '2024': 2400,
    threshold: 4300,
  },
  {
    name: 'W7',
    '2023': 9809,
    '2024': 2200,
    threshold: 4300,
  },
  {
    name: 'W8',
    '2023': 10000,
    '2024': 2100,
    threshold: 4400,
  },
  {
    name: 'W9',
    '2023': 9808,
    '2024': 2200,
    threshold: 4400,
  },
  {
    name: 'W10',
    '2023': 234,
    '20 24': 2000,
    threshold: 4500,
  },
];


let dataM: any[] = [];


const COLORSM = ['#3b82f6', '#ef4444', '#9ca3af'];


interface Attribute {
  attribute: string;
  displayName: string;
  value: string;
}

interface TrackedEntityInstance {
  attributes: Attribute[];
}

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 8)];
  }
  return color;
};


// const dataT = [
//   { name: "CHK(CHUK) HNR", value: 10 },
//   { name: "Gisenyi DH", value: 7 },
//   { name: "Nyagatare DH", value: 6 },
//   { name: "Gahini DH", value: 6 },
//   { name: "Butare Chu Hnr (huye)", value: 5 },
//   { name: "Kirehe DH", value: 5 },
//   { name: "Bushenge PH", value: 4 },
//   { name: "Ruhengeri RH", value: 4 },
//   { name: "Rwinkwavu DH", value: 3 },
//   { name: "Kibungo RH", value: 2 },
//   { name: "Kaduha DH", value: 1 },
//   { name: "Nyabikenke DH", value: 1 },
// ].map(item => ({ ...item, color: getRandomColor() }));

let dataTreeMap: any[] = [];


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
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + 7}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 - 7}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
      >
        {value}
      </text>
    </g>
  );
};


const ReportTemplate : React.FC = () => {
  const {analyticsData,isFetchAnalyticsDataLoading,visualTitleAndSubTitle,visualSettings, analyticsDimensions,fetchAnalyticsData,selectedDataSourceDetails} = useAuthorities()
  const engine = useDataEngine(); 
  const [messages, setMessages] = useState<string[]>([]);
  const [alertFromCommunity, setAlertFromCommunity] = useState<string[]>([]);
  const [IBSHighlightMessage, setIBSHighlightMessage] = useState<string[]>([]);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [DiseaseData, setDiseasesMessage] = useState<string[]>([]);
  const [DeathData, setDeathsMessage] = useState<string[]>([]);
  const [pieChartDescription, setPieChartDescription] = useState<string>();
  const [deathDescription, setDeathDescription] = useState<string>();
  const [total, setTotal] = useState<number>(0);
  const [diseaseCount, setDiseaseCount] = useState<Record<string, number>>({});
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [totalOrgUnit, setTotalOrgUnit] = useState<number>(0);
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [showDeaths, setShowDeath] = useState<number>(0);

// Complete implementation with debugging and proper data formatting
const renderAreaCharts = () => {
  const SelectedChart = BulletinAreaChart;
  
  if (!SelectedChart || !analyticsData || !dimensionDataHardCoded) {
    console.log("Missing required data:", { 
      hasChart: !!SelectedChart, 
      hasAnalyticsData: !!analyticsData, 
      hasDimensions: !!dimensionDataHardCoded 
    });
    return null;
  }
  
  // Format data in the structure expected by the chart component
  const formatChartData = (diseaseId) => {
    // Filter rows for this specific disease
    const diseaseRows = analyticsData.rows.filter(row => row[0] === diseaseId);
    console.log("disease rows", diseaseRows)
    
    if (diseaseRows.length === 0) {
      console.log(`No data found for disease ID: ${diseaseId}`);
      return [];
    }
    
    // Sort by period to ensure chronological order
    diseaseRows.sort((a, b) => a[1].localeCompare(b[1]));
    const diseaseName = getDiseaseNameById(diseaseId);
    
    // Transform to the format expected by the chart component
    return diseaseRows.map(row => ({
      dx: row[0],
      pe: row[1],
      month: analyticsData.metaData.items[row[1]]?.name || row[1], // Period name if available
      name: diseaseName,
      [diseaseName]: parseFloat(row[2]),
      // Include any other properties your chart component expects
    }));
  };
  
  // Get the disease IDs from the metadata
  const diseaseIds = analyticsData.metaData.dimensions.dx || dimensionDataHardCoded;
  
  console.log("Rendering charts for diseases:", diseaseIds);
  
  // Return an array of area charts, one for each disease ID
  return diseaseIds.map(diseaseId => {
    const chartData = formatChartData(diseaseId);
    
    console.log(`Disease ${diseaseId} data points: ${chartData.length}`);
    console.log("the chartData should be like thus", chartData)
    console.log("the analytics data was like ths", analyticsData)
    
    // If we have data for this disease ID, render a chart
    if (chartData.length > 0) {
      const diseaseName = analyticsData.metaData.items[diseaseId]?.name || 
                          getDiseaseNameById(diseaseId) || 
                          `Disease ${diseaseId}`;
      
      return (
        <div key={diseaseId} className="mb-8">
          {/* <h3 className="text-lg font-semibold mb-2">{diseaseName}</h3> */}
          <SelectedChart 
            data={chartData} 
            visualTitleAndSubTitle={{
              ...visualTitleAndSubTitle,
              title: diseaseName
            }} 
            visualSettings={{
              ...visualSettings,
              // Make sure these settings are compatible with your chart component
              xAxis: {
                ...visualSettings?.xAxis,
                dataKey: 'name'  // Use period name for x-axis
              },
              yAxis: {
                ...visualSettings?.yAxis,
              },
              series: [
                {
                  dataKey: 'value',
                  name: diseaseName,
                  // Add any other series properties needed
                }
              ]
            }} 
          />
        </div>
      );
    }
    
    return (
      <div key={diseaseId} className="mb-8">
        <h3 className="text-lg font-semibold mb-2">
          {/* {analyticsData.metaData.items[diseaseId]?.name || getDiseaseNameById(diseaseId) || `Disease ${diseaseId}`} */}
        </h3>
        <div className="p-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          No data found
        </div>
      </div>
    );
  });
};

const getDiseaseNameById = (id) => {
  // Corrected disease mapping based on your JSON metadata
  const diseaseNames = {
    "CxTT5NVd8o1": "Simple malaria",
    "TnhQi1knkS7": "Flu syndrome",
    "Efu7jw6Y45t": "Severe pneumonia under 5 years",
    "KLdYJhoI1yM": "Rabies exposure",
    "XCuqmbPR8vX": "COVID-19",
    "j10s9Gfed0c": "Non bloody diarrhoea under 5 years"
  };
  
  return diseaseNames[id] || null;
};

function extractWeekData(weekString) {
  // Use a regular expression to match the week number and the dates
  const regex = /(Week \d+)\s+(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/;
  const match = weekString.match(regex);

  if (match) {
      const weekNumber = match[1]; // First captured group (week number)
      const startDate = match[2]; // Second captured group (start date)
      const endDate = match[3]; // Third captured group (end date)

      return {
          weekNumber: weekNumber,
          startDate: startDate,
          endDate: endDate
      };
  } else {
      return {
          weekNumber: null,
          startDate: null,
          endDate: null
      };
  }
}

const selectedPeriod = analyticsData.metaData.dimensions.pe;
const selectedItems = analyticsData.metaData.items;
const key = selectedPeriod[0];
const value = selectedItems[key];
const periodName = value.name
const {startDate, endDate, weekNumber} = extractWeekData(periodName);
console.log("week number", weekNumber)
console.log("startDate", startDate)
console.log("endDate", endDate)



  useEffect(() => {
      const loadData = async () => {
          try {
            setDataLoading(true);
              const response = await fetchTrackedEntities(engine, 'Hjw70Lodtf2', 'U86iDWxDek8', startDate, endDate);
              const otherProgramResponse = await fetchEvents(engine, 'Hjw70Lodtf2', 'ecvn9SiIEXz',startDate, endDate);
              const malariaResponse = await fetchEvents(engine, 'Hjw70Lodtf2', 'zCy7bqFHOpa', startDate, endDate);
              dataM = response.pieChartData
              dataTreeMap = response.treeMapData.map(item => ({ ...item, color: getRandomColor() }))              
              setMessages([...malariaResponse.message, ...otherProgramResponse.message]);
              setAlertFromCommunity([...malariaResponse.alertFromCommunity, ...otherProgramResponse.alertFromCommunity])
              setIBSHighlightMessage(response.IBSHighlightMessage)
              setTotalEvents(malariaResponse.totalEvents + otherProgramResponse.totalEvents);
              setDiseasesMessage(response.diseaseMessages);
              setDeathsMessage(response.deathMessages)
              setPieChartDescription(response.PieChartDescription);
              setDeathDescription(response.totalDeathMessages)
              setShowDeath(response.totalReportedDeaths)
              setTotal(response.total);
          } catch (err) {
              setDataError(err instanceof Error ? err.message : 'An unknown error occurred');
          } finally {
              setDataLoading(false);
          }

          console.log("this is the total", total)
          console.log("IBSHighlightMessage",IBSHighlightMessage)
          
      };

        loadData();
    }, [engine]); // Ensure that the engine is the only dependency




  const { error, loading, data } = useDataQuery(datastoreQuery);
  if (error) {
    return <span>{i18n.t('ERROR')}</span>;
  }

  if (loading ||  dataLoading || isFetchAnalyticsDataLoading) {
    return <span>{i18n.t('Loading...')}</span>;
  }
 
  return (
    <>
    {/* <DisplayAreaCharts/> */}

        {/* <button className="bg-blue-400" onClick={downloadPDF}>Download</button> */}
      
        <h1 className=' text-center text-3xl font-bold uppercase tracking-wide my-6'>Epidemological Bulletin</h1>
        <div id="content-to-download" className='bg-white p-5 mx-auto mt-5 rounded-lg shadow-md max-w-4xl'>
          {/* Header Logos */}
          <div className="flex justify-between mb-5">
            <img className='w-72' src={minisanteLogo} alt="Republic of Rwanda Ministry of Health" />
            <img  className='w-72' src={rbcLogo}  alt="Rwanda Biomedical Centre" />
          </div>
    
          {/* Title Section */}
          <div className="text-center p-5 rounded-lg mb-5 mt-10">
            <h2 className="text-5xl font-bold uppercase tracking-wide">
              {data?.results?.page1.titles[0]}
            </h2>
            <h3>{weekNumber}</h3>
            <h3>{startDate} - {endDate}</h3>
            <div className="py-4 px-6 mt-4 inline-block">
              {/* <h3 className="text-3xl font-extrabold text-black">{title}</h3> */}
            </div>
          </div>
    
          {/* Content Section */}
          <div className="p-4 rounded-lg mb-5 text-center">
            <h4 className="mb-2 text-xl text-center font-bold mb-2">{data?.results?.page1.titles[1]}</h4>
            <p className=" m-0 text-black leading-relaxed text-xl">
              {data?.results?.page1.body_content[0]}
            </p>
            <p className=" m-0 text-black leading-relaxed mt-4 text-xl mb-8">
              {data?.results?.page1.body_content[1]}
            </p>
          </div>
    
          {/* Additional Sections */}
          <div className="p-4 rounded-lg mb-5 text-center">
            <p>
              <span className="bold">{data?.results?.page1.titles[2]}:</span> {data?.results?.page1.body_content[2]}
            </p>
          </div>
          
          
          {/* Page 2 */}
          <div className="p-4 rounded-lg mb-5">
            <h1 className='bg-blue-400 text-xl text-center font-bold py-4 mb-5'>{data?.results?.page2.main_titles[0]}</h1>
            <h2 className='text-md font-bold mb-2'>{data?.results?.page2.main_titles[1]}:</h2>
           <ul className='list-disc pl-4'>
            {totalEvents > 0 ? (
              <>
              <li> <span className='font-bold'>{data?.results?.page2.sub_titles[0]}:</span> {totalEvents} alerts: 
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
            ): null}
              <li className='bold mr-5'> <span className='font-bold'>{data?.results?.page2.sub_titles[1]}:</span> {data?.results?.page2.body_content.Alert_from_EIOS[0]}</li>
              <ul className='list-disc pl-6'>
                <li>{data?.results?.page2.body_content.Alert_from_EIOS[1]}</li>
                <li>{data?.results?.page2.body_content.Alert_from_EIOS[2]}</li>
              </ ul>
              {total > 0 ? (
                <>
                    <li className='font-bold'>{data?.results?.page2.sub_titles[2]}</li>
                    <ul>
                      {IBSHighlightMessage.length > 0 ? (
                            <ul className='list-disc pl-6'>
                                {IBSHighlightMessage.map((msg, index) => (
                                    <li key={index}>{msg}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No cases found.</p>
                        )} 
                    </ul>
                </>
              ): null  }
              <li className='font-bold'>{data?.results?.page2.sub_titles[3]}</li>
              <ul className='list-disc pl-6'>
                {data?.results?.page2?.body_content.outbreaks_updates.map((update: any, index) => (
                  <li key={index}>{update}</li>
                ))}
              </ul>
              <li className='font-bold'>{data?.results?.page2.sub_titles[4]}</li>
              <ul className='list-disc pl-6'>
                <li>{data?.results?.page2?.body_content.completness[0]}</li>
              </ul>
            </ul>
        
          </div>
    
          {/* Page 3 */}
          <div className="p-4 rounded-lg mb-5">
            <h1 className='bg-blue-400 text-xl text-center font-bold py-4 mb-5'>{data?.results?.page3.main_titles[0]} {weekNumber}</h1>
            <p className='mb-4'>
              <span className='font-bold'>{data?.results?.page3.main_titles[1]}:</span>
              {data?.results?.page3?.body_content.description.map((parag: any, index: Key | null | undefined) => (
                <p key={index}>{parag}</p>
              ))}
            </p>
    
            <h1 className='font-bold mb-4 '>{data?.results?.page3.main_titles[2]}</h1>
            <ul className='list-disc pl-4'>
              {totalEvents > 0 ? (
                <>
                    <li>
                      <span className='font-bold'>{data?.results?.page3.sub_titles[0]}:</span> {totalEvents} alerts
                    </li>
                    <ul className='list-disc pl-6'>
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
              ): null}

              <li>
              <span className='font-bold'>{data?.results?.page3.sub_titles[1]}:</span> {data?.results?.page3.body_content.Alert_from_EIOS[0]}
              </li>
              <ul className="list-disc pl-6">
                  {data?.results?.page3.body_content.Alert_from_EIOS.map((item: any, index: any) => {
                    if (Array.isArray(item)) {
                      return (
                        <>
                          {item.map((alert, alertIndex) => (
                            <li key={alertIndex} className="text-gray-800">
                              <h2 className="font-semibold">{alert.title}</h2>
                              <p>{alert.content}</p>
                            </li>
                          ))}
                        </>
                      );
                    }
                  })}
                </ul>
            </ul>
          </div>
    
          {/* Page 4 */}
          {
            total > 0 ? (
              <div className="p-4 rounded-lg mb-2">
              <h1 className='bg-blue-400 text-xl text-center font-bold py-4 mb-5'>{data?.results?.page4.main_titles[0]}</h1>
              <p>
                <span className='font-bold'>{data?.results?.page4.sub_titles[0]}: </span>
                {data?.results?.page4?.body_content.description}
              </p>
              <h1 className='text-center font-bold my-4'>IMMEDIATE REPORTABLE DISEASES – EPI{weekNumber}</h1>
              <p>During this Epi week, {total} cases of immediate reportable diseases were notified:</p>
              <ul className='list-disc pl-8'>
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
              <h2 className='font-bold my-4'>{data?.results?.page4?.sub_titles[1]}:</h2>
              <Textarea
                          label="IMMEDIATE REPORTABLE DISEASES Notes"
                          name="immediateReportableDiseasesNotes"
                          // value={formData.immediateReportableDiseasesNotes}
                          // onChange={handleChange}
                          placeholder="Enter notes..."
                        />
              {/* <ul className='list-disc pl-8'>
                {data?.results?.page4?.body_content.notes.map((note: any, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul> */}
            </div>
            ): null
          }
       
         {/* other pages*/}
          <div className="p-4 rounded-lg mb-5">
            <h1 className='text-center font-bold my-4'>WEEKLY REPORTABLE DISEASES – EPI {weekNumber}</h1>
            <p><span className='font-bold'>{data?.results?.pages.sub_titles[0]}</span>: {data?.results?.pages.reportable_description[0]} </p>
            <p> {data?.results?.pages.reportable_description[1]}</p>       
            <h2 className='font-bold mt-4'>{data?.results?.pages.sub_titles[1]}</h2>

           <div className="p-4 rounded-lg mb-5">{renderAreaCharts()}</div>
          </div>
    {
      showDeaths > 0 ? (
    <div>
          <div className="p-4 rounded-lg mb-5">
            <h1 className='text-center font-bold my-4'>DISTRIBUTION OF REPORTED DEATHS IN eIDSR – EPIDEMIOLOGICAL {weekNumber}</h1>
            <p> {pieChartDescription}</p>   
            <ResponsiveContainer width="100%" height={300}>
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
                      {dataM && dataM.length > 0 && dataM.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORSM[index % COLORSM.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" layout="horizontal" />
                  </PieChart>
            </ResponsiveContainer>
            <p>{deathDescription}</p>
           {DeathData.length > 0 ? (
                            <ul className='list-disc pl-6'>
                                {DeathData.map((msg, index) => (
                                    <li key={index}>{msg}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No cases found.</p>
                        )} 
          </div>
          <div className="p-4 rounded-lg mb-5">
          <h2 className='font-bold '>{data?.results?.pages.sub_titles[2]}</h2>
           <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={dataTreeMap}
                  dataKey="value"
                  ratio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={<CustomizedContent/>}
      />
           </ResponsiveContainer>

          </div>
          </div>
      ) : null
    }
          
          <div className="p-4 rounded-lg mb-5">
              <h1 className='bg-blue-400 text-xl text-center font-bold py-4 mb-5'>{data?.results?.pages.main_titles[2]}</h1>
              <h2 className='font-bold mt-4'>{data?.results?.pages.sub_titles[3]}</h2>
              <table className="w-full table-auto">
                    <tbody>
                        <tr>
                            <td className="p-2 font-bold bg-slate-500">Confirmed cases:</td>
                            <td className="p-2">4</td>
                            <td className="p-2 font-bold bg-slate-500">Date reported:</td>
                            <td className="p-2">July 14, 2024</td>
                            <td className="p-2 font-bold bg-slate-500">Risk assessment:</td>
                            <td className="p-2">Low</td>
                        </tr>
                        <tr>
                            <td className="p-2 font-bold bg-slate-500">Suspected cases</td>
                            <td className="p-2 text-red-500 font-bold">4</td>
                            <td className="p-2 font-bold bg-slate-500">Source:</td>
                            <td className="p-2"> eIDSR</td>
                            <td className="p-2"></td>
                        </tr>
                        <tr>
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                            <td className="p-2"></td>
                        </tr>
                        <tr>
                            <td className="p-2 font-bold bg-slate-500">Death(s)</td>
                            <td className="p-2 text-red-500 font-bold">0</td>
                            <td className="p-2 font-bold bg-slate-500">District/HFs:</td>
                            <td className="p-2">Kinyababa HC/ Butaro
                                DH</td>
                            <td className=" p-2"></td>
                        </tr>
                        <tr className='mx-3'>
                            <td className="p-2 font-bold bg-slate-500">Total cases</td>
                            <td className="p-2 text-green-500 font-bold">13</td>
                            <td className="p-2 font-bold bg-slate-500">Geoscope:</td>
                            <td className="p-2">Low</td>
                            <td className="p-2"></td>
                        </tr>
                    </tbody>
               </table>
              <h2 className='font-bold mt-4'>{data?.results?.pages.sub_titles[0]}</h2>
              <Textarea
                        label="IMMEDIATE REPORTABLE DISEASES Notes"
                        name="immediateReportableDiseasesNotes"
                        // value={formData.immediateReportableDiseasesNotes}
                        // onChange={handleChange}
                        placeholder="Enter description..."
                      />
              {/* <p className='mb-4'>{data?.results?.pages.outbreak_description}</p> */}
              <h2 className='font-bold mt-4'>{data?.results?.pages.sub_titles[4]}</h2>
              <Textarea
                        label="IMMEDIATE REPORTABLE DISEASES Notes"
                        name="immediateReportableDiseasesNotes"
                        // value={formData.immediateReportableDiseasesNotes}
                        // onChange={handleChange}
                        placeholder="Enter notes..."
                      />
              {/* <ul className='list-disc pl-6'>
                      {data?.results?.pages.body_content.action_taken.map((al: any, index) => (
                        <li  key={index}>{al}</li>
                      ))}
                </ul> */}

          </div>
          <div className="p-4 rounded-lg mb-5">
              <h1 className='bg-blue-400 text-xl text-center font-bold py-4 mb-5'>{data?.results?.pages.main_titles[3]}</h1>
              <p>{data?.results?.pages.body_content.completness_description[0]}</p>
              <ul className='list-disc pl-6'>
                      {data?.results?.pages.body_content.timeless_completness.map((al: any, index) => (
                        <li  key={index}>{al}</li>
                      ))}
                </ul>
                {/* {/* <p className='mt-4'>{data?.results?.pages.body_content.completness_description[1]}</p> */}
                <Textarea
                        label="IMMEDIATE REPORTABLE DISEASES Notes"
                        name="immediateReportableDiseasesNotes"
                        // value={formData.immediateReportableDiseasesNotes}
                        // onChange={handleChange}
                        placeholder="Enter notes..."
                      />
                <p className='mt-4'>
                  <span><h2 className='font-bold'>{data?.results?.pages.sub_titles[5]}:</h2></span>
                  {/* {data?.results?.pages.body_content.notes} */}
                  <Textarea
                        label="IMMEDIATE REPORTABLE DISEASES Notes"
                        name="immediateReportableDiseasesNotes"
                        // value={formData.immediateReportableDiseasesNotes}
                        // onChange={handleChange}
                        placeholder="Enter notes..."
                      />
                </p> 

          </div>
         

    <table className="table-auto w-full text-center text-sm">
            <thead className="bg-gray-100">
                <tr>
                    <th rowspan="2" className="px-4 py-2">Hospital catchment area</th>
                    <th colspan="28" className="px-4 py-2">Completeness</th>
                </tr>
                <tr>
                    <th className="px-2 py-1">W01</th>
                    <th className="px-2 py-1">W02</th>
                    <th className="px-2 py-1">W03</th>
                    <th className="px-2 py-1">W04</th>
                    <th className="px-2 py-1">W05</th>
                    <th className="px-2 py-1">W06</th>
                    <th className="px-2 py-1">W07</th>
                    <th className="px-2 py-1">W08</th>
                    <th className="px-2 py-1">W09</th>
                    <th className="px-2 py-1">W10</th>
                    <th className="px-2 py-1">W11</th>
                    <th className="px-2 py-1">W12</th>
                    <th className="px-2 py-1">W13</th>
                    <th className="px-2 py-1">W14</th>
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
                    <td className="border px-2 py-1 bg-orange-500 text-white">68%</td>
                </tr>
                <tr>
                    <td className="border px-4 py-2">Area 1</td>
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
                    <td className="border px-2 py-1 bg-green-500 text-white">98%</td>
                </tr>
            </tbody>
      </table>

      </div>
      
  </>
  )
}

export default ReportTemplate;
