import { useMapData } from '../../services/maps'
const MapViewer = ({ mapId }:{mapId:string}) => {

  const dhis2BaseUrl = "http://localhost:3000"
  const iframeUrl = `${dhis2BaseUrl}/dhis-web-maps/index.html?id=${mapId}&embedded=true`;
  return (
    <iframe
      src={iframeUrl}
      style={{ width: '100%', height: '80vh', border: 'none' }}
      title="DHIS2 Map"
      sandbox="allow-scripts allow-same-origin" // Security restriction
    />
  );
};

const MapHomepage = () => {
  const {data,error} = useMapData()
  console.log("hello maps",{data})
  return (
    <div>MapHomepage

   <MapViewer mapId='CT6oCXbpScK'  />
    </div>
  )
}

export default MapHomepage