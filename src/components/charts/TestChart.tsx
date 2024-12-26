import CustomOrganisationUnitTree from "../../pages/visualizers/Components/MetaDataModals/CustomOrganisationUnitTree";



function transformDataToPieChartFormat(data:any, colors:any) {
  const totals = {};
  const colorCount = colors.length; // Number of available colors

  // Calculate totals for each disease dynamically
  data.forEach((entry) => {
    for (const key in entry) {
      if (key !== "month") {
        totals[key] = (totals[key] || 0) + entry[key];
      }
    }
  });

  // Transform the totals into the desired array format with dynamic colors
  const transformedData = Object.entries(totals).map(([name, total], index) => ({
    name,
    total,
    fill: colors[index % colorCount], // Assign colors cyclically
  }));

  return transformedData;
}



const handleNodeSelect = (node) => {
  console.log('Selected node y:', node);
};
export function TestChart() {
  return (
   <h2>Hello test</h2>
  );
}

