// NearByShips.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip } from 'react-leaflet';
import axios from 'axios';
import bbox from '@turf/bbox';
import './css/NearByShips.css';
import { Icon } from 'leaflet';
import customMarkerIcon from './vessel_icon/cargo_ship_fast.svg';
import customMarkerIconWhale from './images/whale.png';
import 'leaflet-rotatedmarker';
function NearByShips() {
  const [vesselData, setVesselData] = useState([]);
  const [vesselDdetail, setVesselDdetail] = useState([]);
  const [whaleDetail, setwhaleDetail] = useState([]);
  const [geojsonData, setGeojsonData] = useState(null);
  const [formattedDate, setFormattedDate] = useState('');

  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ top: 75, left: 10 });
  const [initialPosition, setInitialPosition] = useState({ top: 75, left: 10 });
  const markerRefs = useRef([]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setInitialPosition({
      top: position.top,
      left: position.left,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const dx = e.clientX - initialPosition.x;
      const dy = e.clientY - initialPosition.y;
      setPosition({
        top: initialPosition.top + dy,
        left: initialPosition.left + dx,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };


  useEffect(() => {

    const formatCurrentDateTime = () => {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return new Date().toLocaleDateString('en-US', options);
    };

    setFormattedDate(formatCurrentDateTime());


    // Fetch radar data from the API 
    axios.get('https://m2.protectedseas.net/api/tybee/active.php')
      .then((response) => {
        // Extract vessel data from the "tracks" node
        const tracks = response.data[0].tracks;
        // console.log(response.data[0].tracks); // Log the tracks to the console
        setVesselData(tracks);

        console.log("tracks---");
        console.log(tracks);


        console.log("response.data.viewshed----" + response.data[0].viewshed);
        axios.get("https://whalealert.conserve.io/zones/mid-atlantic-sma.json")
          .then((response) => {
            setGeojsonData(response.data);

            console.log("geojsonData---" + response.data);
          }).catch((error) => {
            console.error('Error fetching GeoJSON data:', error);
          });

      })
      .catch((error) => {
        console.error('Error fetching radar data:', error);
      });
    axios.get('https://m2.protectedseas.net/api/tybee/getPhotos.php')
      .then((response) => {
        setVesselDdetail(response.data);
      })
      .catch((error) => {
        console.error('Error fetching radar data:', error);
      });

    axios.get('https://maplify.com/waseak/php/search-all-sightings.php?BBOX=-81.22630622,31.45,-77.525000001,34.175366764&limit=20&start=2023-01-01&moderated=1')
      .then((response) => {
        setwhaleDetail(response.data.results);
      })
      .catch((error) => {
        console.error('Error fetching radar data:', error);
      });

  }, []);


  if (geojsonData) {
    const bounds = bbox(geojsonData);
    console.log(`Bounding Box: ${bounds}`);
  } else {

  }
  function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const formattedDate = new Date(dateString).toLocaleString('en-US', options);
    return formattedDate;
  }

  return (

    <div className="mainWrapper">
      <div className="radar-map">
        <MapContainer
          center={[32.20, -80.66]}
          zoom={9.4} // Initial zoom level
          style={{ height: '100vh', align: 'center' }}

        >
          <TileLayer
            url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50aGluc3QxIiwiYSI6ImNpbXJ1aGRtYTAxOGl2aG00dTF4ZTBlcmcifQ.k95ENmlDX1roCRKSFlgCNw" // Example tile layer 
          />
          {geojsonData && (
            <GeoJSON data={geojsonData} style={{ fillColor: 'yellow', stroke: false }} />
          )}
          <Marker position={[32.10, -80.86]}
            icon={new Icon({
              iconUrl: require(`./images/yellowpin.png`),
              iconSize: [35],
              iconAnchor: [15, 15]
            })}>
            <Tooltip direction="left" offset={[0, 0]} opacity={1} permanent>
              <div className="tooltip_vessel_title_yourhere">
                <span className="vessel_title_yourhere">YOU ARE HERE</span>
              </div>
            </Tooltip>
          </Marker>
          {/* Plot vessels as markers if vesselData is defined */}
          {vesselData &&
            vesselData.map((vessel, index) => (
              vessel.id ? (
                <Marker
                  ref={(el) => (markerRefs.current[index] = el)}
                  position={[parseFloat(vessel.lat), parseFloat(vessel.lon)]}
                  icon={new Icon({
                    //iconUrl: './vessel_icon/'+vessel.vessel_type+'_'+getSpeedCategory(vessel.speed)+'.svg',
                    //iconUrl: require(`./vessel_icon/${vessel.vessel_type}_${getSpeedCategory(vessel.speed)}.svg`),
                    iconUrl: require(`./vessel_icon/${vessel.vessel_type === "cargo_ship" ? "cargo_ship" : "sailboat"}_${getSpeedCategory(vessel.speed)}.svg`),
                    iconSize: [75], // Adjust the size as needed
                    iconAnchor: [15, 15], // Adjust the anchor point as needed                                            
                  })}
                  rotationAngle={vessel.heading}
                  rotationOrigin={['center', 'center']}

                >
                  <Popup>
                    <div>
                      <h3>Vessel Name: {vessel.vessel_name}</h3>
                      <p>Latitude: {vessel.lon}</p>
                      <p>Longitude: {vessel.lat}</p>
                      <p>Speed/Course: {vessel.speed} kn / {vessel.heading} &deg;</p>
                      <p>Timestamp: {formatDate(vessel.created)}</p>
                      {/* Add more vessel information here */}
                    </div>
                  </Popup>
                  <Tooltip direction="" offset={[10, 10]} opacity={1} permanent><div className="tooltip_vessel_title"><span className="vessel_title">{vessel.vessel_name}</span><span className="vessel_detail">{vessel.speed} kt</span><span className="vessel_detail_speed">{vessel.heading} &deg;</span></div></Tooltip>
                </Marker>
              ) : null
            ))}

          {whaleDetail && whaleDetail.map((whaledata) => (
            <Marker
              key={whaledata.id}
              position={[parseFloat(whaledata.latitude), parseFloat(whaledata.longitude)]}
              icon={new Icon({
                //iconUrl: customMarkerIconWhale,
                iconUrl: require(`./sightingIcons/${whaledata.icon}.png`),
                iconSize: whaledata.icon.includes('-R') ? [15, 15] : [45, 45],
                iconAnchor: whaledata.icon.includes('-R') ? [7.5, 7.5] : [22.5, 22.5],
              })}
              opacity={whaledata.icon.includes('-R') ? 0.8 : 1.0}
            >
              <Popup>
                <div>
                  <h3>ID: {whaledata.id}</h3>
                  <p>Name: {whaledata.name}</p>
                  <p>Latitude: {whaledata.latitude}</p>
                  <p>Longitude: {whaledata.longitude}</p>
                  <p>Timestamp: {formatDate(whaledata.created)}</p>
                  {/* Add more vessel information here */}
                </div>
              </Popup>
              {/* <Tooltip direction="" offset={[10, 10]} opacity={1} permanent>{whaledata.name}</Tooltip> */}
            </Marker>
          ))}

        </MapContainer>
      </div>
      <div className="vesselDetails">
        <div className="rightsidebar"><span className="rightsidebarheadig">NEARBY SHIPS</span></div>
        <ul>
          {vesselDdetail &&
            vesselDdetail.map((vesseld, index) => (
              vesseld.key ? (
                <li key={index} onClick={() => markerRefs.current[index].openPopup()}>
                  <img src={vesseld.key} alt={vesseld.vessel_name} />
                  <div className="imageoverlay">
                    <h3>{vesseld.vessel_name}</h3>
                    <span>{formatDate(vesseld.created)}</span>
                  </div>
                </li>
              ) : null
            ))}
        </ul>
      </div>
      <div className="infotooltipbox" style={{ top: position.top, left: position.left }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <div className="tooltipheading">
          <h3>SHIPS NEAR<br />TYBEE ISLAND</h3>
          <span id="formattedDate">{formattedDate}</span>
          <div className="vesselsdetails">
            <h4>Total Vessels: 67</h4>
            <div className="tableformat">
              <table className="vesselssummary">
                <tr>
                  <td>12</td>
                  <td>Cargo</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Tanker</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Passenger</td>
                </tr>
                <tr>
                  <td>12</td>
                  <td>Pleasure Craft</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>Fishing Boat</td>
                </tr>
                <tr>
                  <td>-</td>
                  <td>Tug</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Towing</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function getSpeedCategory(speed) {
  if (speed <= 10) {
    return 'slow';
  } else if (speed > 10 && speed < 12) {
    return 'medium';
  } else {
    return 'fast';
  }
}

export default NearByShips;
