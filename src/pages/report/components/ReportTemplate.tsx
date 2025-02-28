import { useDataQuery } from '@dhis2/app-runtime';
import i18n from '@dhis2/d2-i18n';
import minisanteLogo from './images/minisante_logo.png';
import rbcLogo from './images/rbc_logo.png';
import { Key, useState, useEffect, useMemo } from 'react';
import { Treemap,PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tab, Tabs, TabBar, Transfer, Button, Modal } from '@dhis2/ui';
import { useAuthorities } from '../../../context/AuthContext';
import { isValidInputData, transformDataForGenericChart } from '../../../lib/localGenericchartFormat';


const datastoreQuery = {
  results: {
    resource: `dataStore/epide-bulletin/epide`,
  },
};

const fixedPeriodQuery = {
  results: {
    resource: `periodTypes`,
  },
};

const relativePeriodQuery = {
  results: {
    resource: `periodTypes/relativePeriodTypes`,
  },
};

const dataF = [
  {
    name: 'W1',
    '2023': 0,
    '2024': 3500,
    threshold: 5500,
  },
  {
    name: 'W2',
    '2023': 0,
    '2024': 3700,
    threshold: 5200,
  },
  {
    name: 'W3',
    '2023': 0,
    '2024': 3400,
    threshold: 4800,
  },
  {
    name: 'W4',
    '2023': 0,
    '2024': 3400,
    threshold: 4000,
  },
  {
    name: 'W5',
    '2023': 0,
    '2024': 2800,
    threshold: 4200,
  },
  {
    name: 'W6',
    '2023': 0,
    '2024': 2400,
    threshold: 4300,
  },
  {
    name: 'W7',
    '2023': 0,
    '2024': 2200,
    threshold: 4300,
  },
  {
    name: 'W8',
    '2023': 0,
    '2024': 2100,
    threshold: 4400,
  },
  {
    name: 'W9',
    '2023': 0,
    '2024': 2200,
    threshold: 4400,
  },
  {
    name: 'W10',
    '2023': 0,
    '20 24': 2000,
    threshold: 4500,
  },
];

const dataM = [
  { name: 'Maternal death', value: 4 },
  { name: 'Perinatal death', value: 77 },
  { name: 'Under 5 years death', value: 19 },
];

const COLORSM = ['#3b82f6', '#ef4444', '#9ca3af'];

const dataTree = [
  {
    name: 'CHK(CHUK) HNR',
    value: 10,
    color: '#4085e3',
  },
  {
    name: 'Gahini DH',
    value: 6,
    color: '#a4a4a4',
  },
  {
    name: 'Nyagatare DH',
    value: 6,
    color: '#ffd700',
  },
  {
    name: 'Kirehe DH',
    value: 5,
    color: '#5cb85c',
  },
  {
    name: 'Butare Chu Hnr (huye)',
    value: 5,
    color: '#4085e3',
  },
  {
    name: 'Kibilizi DH',
    value: 3,
    color: '#888888',
  },
  {
    name: 'Nemba DH',
    value: 3,
    color: '#a0522d',
  },
  {
    name: 'Rwanda Military Hospital',
    value: 3,
    color: '#2980b9',
  },
  {
    name: 'Rwinkwavu DH',
    value: 3,
    color: '#558b2f',
  },
  {
    name: 'Bushenge PH',
    value: 4,
    color: '#4085e3',
  },
  {
    name: 'Ruhengeri RH',
    value: 4,
    color: '#a0522d',
  },
  {
    name: 'Kibungo RH',
    value: 2,
    color: '#4085e3',
  },
  {
    name: 'Kigeme DH',
    value: 2,
    color: '#f59e58',
  },
  {
    name: 'Nyanza DH',
    value: 2,
    color: '#cccccc',
 },
  {
    name: 'Gikongoro DH',
    value: 2,
    color: '#ff6347',
  },
  {
    name: 'Mugina DH',
    value: 1,
    color: '#4682b4',
  },
  {
    name: 'Kigali DH',
    value: 1,
    color: '#6a5acd',
  },
];

const dataT = [
  { name: "CHK(CHUK) HNR", value: 10, fill: "#4C78A8" }, // Blue
  { name: "Gisenyi DH", value: 7, fill: "#F58518" }, // Orange
  { name: "Nyagatare DH", value: 6, fill: "#ECA82D" }, // Yellow
  { name: "Gahini DH", value: 6, fill: "#D4D4D4" }, // Gray
  { name: "Butare Chu Hnr (huye)", value: 5, fill: "#4C84D8" }, // Light Blue
  { name: "Kirehe DH", value: 5, fill: "#7BC87C" }, // Green
  { name: "Bushenge PH", value: 4, fill: "#384E92" }, // Dark Blue
  { name: "Ruhengeri RH", value: 4, fill: "#AD5A5A" }, // Reddish Brown
  { name: "Rwinkwavu DH", value: 3, fill: "#6BAA75" }, // Olive Green
  { name: "Kibungo RH", value: 2, fill: "#A4C1E3" }, // Light Blue
  { name: "Kaduha DH", value: 1, fill: "#7C8FBA" }, // Dark Gray Blue
  { name: "Nyabikenke DH", value: 1, fill: "#BFA834" }, // Olive Yellow
];


const ReportTemplate = () => {
    const {analyticsData,reportAnalyticsDimensions} = useAuthorities()

        const { chartData, chartConfig, error:transformAnalyticsError } = useMemo(() => {
            if (!isValidInputData(analyticsData)) {
                return { chartData: [], chartConfig: {}, error: "no data found" };
            }
    
            try {
                const transformedData = transformDataForGenericChart(analyticsData);
                //const config = generateChartConfig(data,visualSettings.visualColorPalette);
                return { chartData: transformedData,  error: null };
            } catch (err) {
                return { chartData: [], error: (err as Error).message };
            }
        }, [analyticsData]);



    const { error, loading, data } = useDataQuery(datastoreQuery);
  const { data: data1 } = useDataQuery(fixedPeriodQuery);
  const { data: data2 } = useDataQuery(relativePeriodQuery);

  const [groupedData, setGroupedData] = useState<any>({});
  const relativePeriodTypes = data2?.results || [];
  const [periodType, setPeriodType] = useState('');
  const periodTypes = data1?.results?.periodTypes || [];

  const [availablePeriods, setAvailablePeriods] = useState<any[]>([]); // For Transfer component
  const [selectedPeriods, setSelectedPeriods] = useState<any[]>([]); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    console.log("relati", relativePeriodTypes)
    if (relativePeriodTypes) {
      const grouped = {
        days: [],
        weeks: [],
        biweeks: [],
        months: [],
        bimonths: [],
        quarters: [],
        sixmonths: [],
        financialYears: [],
        years: [],
      };
      relativePeriodTypes.forEach((item: any) => {
        if (item.includes('DAY')) grouped.days.push(item);
        else if (item.includes('WEEK') && !item.includes('BIWEEK')) grouped.weeks.push(item);
        else if (item.includes('BIWEEK')) grouped.biweeks.push(item);
        else if (item.includes('MONTH') && !item.includes('BIMONTH')&& !item.includes('SIX_MONTH')&& !item.includes('SIXMONTHS')) grouped.months.push(item);
        else if (item.includes('BIMONTH')) grouped.bimonths.push(item);
        else if (item.includes('QUARTER')) grouped.quarters.push(item);
        else if (item.includes('SIX_MONTH') || item.includes('SIXMONTHS')) grouped.sixmonths.push(item);
        else if (item.includes('FINANCIAL_YEAR')) grouped.financialYears.push(item);
        else if (item.includes('YEAR') && !item.includes('FINANCIAL_YEAR')) grouped.years.push(item);
      });

      setGroupedData(grouped);
    }
  }, [relativePeriodTypes]);

   useEffect(()=>{
    console.log("check",analyticsData)
    console.log("chartData",chartData)
   },[analyticsData,chartData])


  useEffect(() => {
    // When periodType changes, update availablePeriods
    if (groupedData[periodType.toLowerCase()]) {
      setAvailablePeriods(
        groupedData[periodType.toLowerCase()].map((item: string) => ({
          label: item.replace(/_/g, ' ').toLowerCase(), // Display text
          value: item, // Unique identifier
        }))
       
      );
    } else {
      setAvailablePeriods([]); // Reset if no data
    }
  }, [periodType, groupedData]);

  console.log("item", availablePeriods)
  

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('relative');
    const FixedAvailablePeriods = [
      { value: 'Weekly', label: 'weekly' },
      { value: 'Last month', label: 'Last month' },
      { value: 'Last 3 months', label: 'Last 3 months' },
      { value: 'Last 6 months', label: 'Last 6 months' },

    ];

    const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newYear = parseInt(event.target.value);
      setSelectedYear(newYear);
      // setAvailablePeriods(generateMonthsForYear(newYear));
  };

  if (error) {
    return <span>{i18n.t('ERROR')}</span>;
  }

  if (loading) {
    return <span>{i18n.t('Loading...')}</span>;
  }
 

   const title = reportAnalyticsDimensions?.pe?.join(",")
  return (
    <>
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
            <div className="py-4 px-6 mt-4 inline-block">
              <h3 className="text-3xl font-extrabold text-black">{title}</h3>
              {/* <h4 className="text-xl font-semibold mt-2 text-black">2024</h4> */}
              {/* <p className="text-lg mt-2 text-black">(08-14 July 2024)</p> */}
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
              <li> <span className='font-bold'>{data?.results?.page2.sub_titles[0]}:</span> {data?.results?.page2.body_content.alert_community[0]}</li>
              <li className='bold mr-5'> <span className='font-bold'>{data?.results?.page2.sub_titles[1]}:</span> {data?.results?.page2.body_content.Alert_from_EIOS[0]}</li>
              <ul className='list-disc pl-6'>
                <li>{data?.results?.page2.body_content.Alert_from_EIOS[1]}</li>
                <li>{data?.results?.page2.body_content.Alert_from_EIOS[2]}</li>
              </ ul>
              <li className='font-bold'>{data?.results?.page2.sub_titles[2]}</li>
              <ul className='list-disc pl-6'>
                {data?.results?.page2?.body_content.indicator_highlights.map((highlight: any, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
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
            <h1 className='bg-blue-400 text-xl text-center font-bold py-4 mb-5'>{data?.results?.page3.main_titles[0]}</h1>
            <p className='mb-4'>
              <span className='font-bold'>{data?.results?.page3.main_titles[1]}:</span>
              {data?.results?.page3?.body_content.description.map((parag: any, index: Key | null | undefined) => (
                <p key={index}>{parag}</p>
              ))}
            </p>
    
            <h1 className='font-bold mb-4 '>{data?.results?.page3.main_titles[2]}</h1>
            <ul className='list-disc pl-4'>
              <li>
                <span className='font-bold'>{data?.results?.page3.sub_titles[0]}:</span> {data?.results?.page3.body_content.alert_community[0]}
              </li>
              <ul className='list-disc pl-6'>
                  {data?.results?.page3.body_content.alert_community.slice(-4).map((al: any, index) => (
                    <li  key={index}>{al}</li>
                  ))}
                </ul>
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
          <div className="p-4 rounded-lg mb-2">
            <h1 className='bg-blue-400 text-xl text-center font-bold py-4 mb-5'>{data?.results?.page4.main_titles[0]}</h1>
            <p>
              <span className='font-bold'>{data?.results?.page4.sub_titles[0]}: </span>
              {data?.results?.page4?.body_content.description}
            </p>
            <h1 className='text-center font-bold my-4'>{data?.results?.page4.main_titles[1]}</h1>
            <p>{data?.results?.page4.body_content.alert_community}</p>
            <ul className='list-disc pl-8'>
              {data?.results?.page4?.body_content.cases.map((caseC: any, index) => (
                <li key={index}>{caseC}</li>
              ))}
            </ul>
            <h2 className='font-bold my-4'>{data?.results?.page4?.sub_titles[1]}:</h2>
            <ul className='list-disc pl-8'>
              {data?.results?.page4?.body_content.notes.map((note: any, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
         {/* other pages*/}
          <div className="p-4 rounded-lg mb-5">
            <h1 className='text-center font-bold my-4'>{data?.results?.pages.main_titles[0]}</h1>
            <p><span className='font-bold'>{data?.results?.pages.sub_titles[0]}</span>: {data?.results?.pages.reportable_description[0]} </p>
            <p> {data?.results?.pages.reportable_description[1]}</p>       
            <h2 className='font-bold mt-4'>{data?.results?.pages.sub_titles[1]}</h2>
            <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={dataF}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="2023" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="2024" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="threshold" stroke="red" fill="none" strokeWidth={2} />
                  </AreaChart>
           </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-lg mb-5">
            <h1 className='text-center font-bold my-4'>{data?.results?.pages.main_titles[1]}</h1>
            <p> {data?.results?.pages.body_content.distribution[0]}</p>   
            <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dataM}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {dataM.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORSM[index % COLORSM.length]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" layout="horizontal" />
                    </PieChart>
           </ResponsiveContainer>    
            <ul className='list-disc pl-6'>
                  {data?.results?.pages.body_content.deaths_reported.map((al: any, index) => (
                    <li  key={index}>{al}</li>
                  ))}
                </ul>
          </div>
          <div className="p-4 rounded-lg mb-5">
          <h2 className='font-bold '>{data?.results?.pages.sub_titles[2]}</h2>
           <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={dataT}
                  dataKey="value"
                  nameKey="name"
                  stroke="#fff"
                  isAnimationActive
                />
           </ResponsiveContainer>

          </div>
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
              <p className='mb-4'>{data?.results?.pages.outbreak_description}</p>
              <h2 className='font-bold mt-4'>{data?.results?.pages.sub_titles[4]}</h2>
              <ul className='list-disc pl-6'>
                      {data?.results?.pages.body_content.action_taken.map((al: any, index) => (
                        <li  key={index}>{al}</li>
                      ))}
                </ul>

          </div>
          <div className="p-4 rounded-lg mb-5">
              <h1 className='bg-blue-400 text-xl text-center font-bold py-4 mb-5'>{data?.results?.pages.main_titles[3]}</h1>
              <p>{data?.results?.pages.body_content.completness_description[0]}</p>
              <ul className='list-disc pl-6'>
                      {data?.results?.pages.body_content.timeless_completness.map((al: any, index) => (
                        <li  key={index}>{al}</li>
                      ))}
                </ul>
                <p className='mt-4'>{data?.results?.pages.body_content.completness_description[1]}</p>
                <p className='mt-4'>
                  <span><h2 className='font-bold'>{data?.results?.pages.sub_titles[5]}:</h2></span>
                  {data?.results?.pages.body_content.notes}
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

export default ReportTemplate