// NoneInteractiveShips.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip, ScaleControl } from 'react-leaflet';
import axios from 'axios';
import bbox from '@turf/bbox';
import './css/NoneInteractiveShips.css';
import { Icon, DivIcon } from 'leaflet';
import customMarkerIcon from './vessel_icon/cargo_ship_fast.svg';
import customMarkerIconWhale from './images/whale.png';
import marineFooterIcon from './images/m2-icon.jpg';
import whaleFooterIcon from './images/m3-icon.png';
import whaleAlertQrmobileImg from './images/wle-img-2.png';
import rightWhaleGeo from './data/corridors/North_Atlantic_Right_Whale_optimized.geojson';
import humpbackWhaleGeo from './data/corridors/Humpback_Whale_optimized.geojson';
import finWhaleGeo from './data/corridors/Fin_Whale_optimized.geojson';
import minkeWhaleGeo from './data/corridors/Minke_Whale_optimized.geojson';
import cameraIcon from './images/camera_icon.png';

import 'leaflet-rotatedmarker';
import { getSpeedColor } from './Utils';

import MarkerClusterGroup from './MarkerClusterGroup';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

function NoneInteractiveShips() {

  const [, setRefresh] = useState();
  const [staticVesselData, setStaticVesselData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vesselData, setVesselData] = useState([]);
  const [vesselDdetail, setVesselDdetail] = useState([]);
  const [whaleDetail, setwhaleDetail] = useState([]);
  const [geojsonData, setGeojsonData] = useState(null);
  const [formattedDate, setFormattedDate] = useState('');

  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ top: 25, left: 25 });
  const [initialPosition, setInitialPosition] = useState({ top: 25, left: 25 });
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

        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      return new Date().toLocaleDateString('en-US', options);
    };

    setFormattedDate(formatCurrentDateTime());

    const fetchData = async () => {
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

      axios.get('https://maplify.com/waseak/php/tybee_2.php?period=90&region=tybee')
        .then((response) => {
          setwhaleDetail(response.data.results);
        })
        .catch((error) => {
          console.error('Error fetching radar data:', error);
        });

      axios.get('https://m2.protectedseas.net/api/tybee/ais_stats.php')
        .then((response) => {
          setStaticVesselData(response.data);
          setIsLoading(false); // Set loading state to false when data is fetched
        })
        .catch((error) => {
          console.error('Error fetching radar data:', error);
          setIsLoading(false); // Set loading state to false even if there's an error
        });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);

  }, []);


  useEffect(() => {
    // Function to format the current date and time
    const formatCurrentDateTime = () => {
      const options = {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      return new Date().toLocaleDateString('en-US', options);
    };

    // Update the formatted date every 30 seconds
    const intervalIdFormatted = setInterval(() => {
      const formatted = formatCurrentDateTime();
      setFormattedDate(formatted);
    }, 15000);

    // Call formatCurrentDateTime initially to set the formatted date
    setFormattedDate(formatCurrentDateTime());

    // Cleanup
    return () => clearInterval(intervalIdFormatted);
  }, []);

  if (geojsonData) {
    const bounds = bbox(geojsonData);
    console.log(`Bounding Box: ${bounds}`);
  } else {

  }
  function formatDate(dateString) {
    const date = new Date(dateString);

    // Get individual date components
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Add leading zero if needed
    const day = ('0' + date.getDate()).slice(-2); // Add leading zero if needed
    const hours = date.getHours(); // Add leading zero if needed
    const minutes = ('0' + date.getMinutes()).slice(-2); // Add leading zero if needed
    const period = hours >= 12 ? 'PM' : 'AM'; // Determine period (AM/PM)
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

    // Construct formatted date string
    const formattedDate = `${displayHours}:${minutes} ${period}`;

    return `${year}-${month}-${day} ${formattedDate}`;
  }
  function formatTypeClass(typeClass) {
    const words = typeClass.split('_')[0];
    // Capitalize the first letter of the first word
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  const totalVessels = staticVesselData.reduce((total, vessel) => total + parseInt(vessel.type_count), 0);

  const calculateRotationAngle = (headingchange) => {
    //console.log("headingnew-0-"+vesselaws.heading);
    let headingnew = (parseFloat(headingchange) + parseInt(90));
    //console.log("headingnew-1-"+headingnew);
    if (parseFloat(headingnew) > parseFloat(360)) {
      headingnew = (parseFloat(headingnew) - parseInt(360));
      //console.log("headingnew---ADjust---"+headingnew);
    }
    return headingnew;
  };

  // Default pin location: Tybee Island
  const userLocation = null;
  const tybeeMarkerPosition = [32.02278559728223, -80.8438064757624];
  const miamiMarkerPosition = [25.7947607, -80.1363613];

  const searchParams = new URLSearchParams(window.location.search);
  const isMiami = searchParams.get('region') === 'miami' || window.location.href.includes('miami');

  const [rightWhaleData, setRightWhaleData] = useState(null);
  const [humpbackWhaleData, setHumpbackWhaleData] = useState(null);
  const [finWhaleData, setFinWhaleData] = useState(null);
  const [minkeWhaleData, setMinkeWhaleData] = useState(null);

  useEffect(() => {
    if (isMiami) {
      fetch(rightWhaleGeo).then(r => r.json()).then(setRightWhaleData);
      fetch(humpbackWhaleGeo).then(r => r.json()).then(setHumpbackWhaleData);
      fetch(finWhaleGeo).then(r => r.json()).then(setFinWhaleData);
      fetch(minkeWhaleGeo).then(r => r.json()).then(setMinkeWhaleData);
    }
  }, [isMiami]);

  const markerPosition = userLocation || (isMiami ? miamiMarkerPosition : tybeeMarkerPosition);
  const mapCenter = isMiami ? miamiMarkerPosition : [32.00, -80.66];

  return (

    <div className="mainWrapper noneInteractiveShips">
      <div className="radar-map">
        <MapContainer
          center={isMiami ? [26.15, -80.0] : [32.0, -80.0]}
          zoom={isMiami ? 8 : 9.2}
          maxZoom={12}
          minZoom={isMiami ? 7 : 7}
          style={{ height: '100%', width: '100%' }}
        >
          <ScaleControl position="bottomright" />
          <TileLayer
            url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50aGluc3QxIiwiYSI6ImNpbXJ1aGRtYTAxOGl2aG00dTF4ZTBlcmcifQ.k95ENmlDX1roCRKSFlgCNw"
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {isMiami && rightWhaleData && <GeoJSON data={rightWhaleData} style={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} />}
          {isMiami && humpbackWhaleData && <GeoJSON data={humpbackWhaleData} style={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />}
          {isMiami && finWhaleData && <GeoJSON data={finWhaleData} style={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }} />}
          {isMiami && minkeWhaleData && <GeoJSON data={minkeWhaleData} style={{ color: 'purple', fillColor: 'purple', fillOpacity: 0.2 }} />}
          {geojsonData && <GeoJSON data={geojsonData} style={{ fillColor: 'yellow', stroke: false }} />}


          {/* Plot vessels as markers if vesselData is defined */}
          {vesselData &&
            vesselData.map((vesselaws, index) => {
              const latitude = parseFloat(vesselaws.lat).toFixed(6);
              const longitude = parseFloat(vesselaws.lon).toFixed(6);
              if (!isNaN(latitude) && !isNaN(longitude)) {
                console.log('Latitude:', latitude);
                console.log('Longitude:', longitude);
                return vesselaws.server_track_id ? (
                  <Marker
                    key={vesselaws.server_track_id}
                    ref={(el) => (markerRefs.current[index] = el)}
                    position={[latitude, longitude]}
                    icon={new Icon({
                      iconUrl: require(`./vessel_icon/${vesselaws.vessel_type === "cargo_ship" ? "cargo_ship" : "sailboat"}_${getSpeedCategory(vesselaws.speed)}.svg`),
                      iconSize: [75], // Adjust the size as needed
                      iconAnchor: [10, 10], // Adjust the anchor point as needed                                            
                    })}
                    rotationAngle={calculateRotationAngle(vesselaws.heading)}
                    rotationOrigin={['center', 'center']}
                  >

                    <Tooltip direction="right" offset={[-15, 10]} opacity={1} permanent><div className="tooltip_vessel_title" style={{ whiteSpace: 'nowrap' }}><span className="vessel_title">{vesselaws.vessel_name}<span style={{ backgroundColor: getSpeedColor(vesselaws.speed), padding: '2px 4px', borderRadius: '3px', display: 'inline-block', marginLeft: '4px' }}>{vesselaws.speed} kt</span></span><span className="vessel_detail_speed">{vesselaws.heading} &deg;</span></div></Tooltip>
                  </Marker>
                ) : null;
              } else {
                console.warn('Invalid latitude or longitude:', vesselaws.lat, vesselaws.lon);
                return null; // Skip rendering if latitude or longitude is invalid
              }
            })}

          <MarkerClusterGroup chunkedLoading>
            {whaleDetail && whaleDetail.map((whaledata) => (
              <Marker
                key={whaledata.id}
                position={[parseFloat(whaledata.latitude), parseFloat(whaledata.longitude)]}
                icon={new DivIcon({
                  className: 'custom-div-icon',
                  html: `
                  <div style="position: relative; width: ${whaledata.icon.includes('-R') ? '22.5px' : '15px'}; height: ${whaledata.icon.includes('-R') ? '22.5px' : '15px'};">
                    ${whaledata.photo_url ? `<img src="${cameraIcon}" style="position: absolute; top: -8px; right: -8px; width: 16px; height: 16px; filter: brightness(0) invert(1); z-index: 1;" />` : ''}
                    <img src="${require(`./sightingIcons/${whaledata.icon}.png`)}" style="width: 100%; height: 100%; display: block; position: relative; z-index: 2;" />
                  </div>
                `,
                  iconSize: whaledata.icon.includes('-R') ? [22.5, 22.5] : [15, 15],
                  iconAnchor: whaledata.icon.includes('-R') ? [11.25, 11.25] : [7.5, 7.5],
                })}
                opacity={whaledata.icon.includes('-R') ? 1.0 : 0.8}
                interactive={false}
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
          </MarkerClusterGroup>

          <Marker
            position={markerPosition}
            icon={new Icon({
              iconUrl: require(`./images/yellowpin.png`),
              iconSize: [25],
              iconAnchor: [12, 12]
            })}
            zIndexOffset={1000}
            interactive={false}
          >
            <Tooltip direction="left" offset={[0, 0]} opacity={1} permanent>
              <div className="tooltip_vessel_title_yourhere">
                <span className="vessel_title_yourhere">YOU ARE HERE</span>
              </div>
            </Tooltip>
          </Marker>
        </MapContainer>
        <div className="qrcodeonmobile_nearbyship">
          <div className="qrcodeimage">
            <img src={whaleAlertQrmobileImg} alt="QR" />
          </div>
        </div>
      </div>
      <div className="vesselDetails">
        <div className="rightsidebar"><span className="rightsidebarheadig">NEARBY SHIPS</span></div>
        <ul className="">
          {vesselDdetail &&
            vesselDdetail.map((vesseld, index) => (
              vesseld.key ? (
                <li key={index} onClick={() => markerRefs.current[index].openPopup()}>
                  <img src={vesseld.key} alt={vesseld.vessel_name} />
                  <div className="imageoverlay">
                    <div className="vesselstitleanddate">
                      <h3>{vesseld.vessel_name}</h3>
                      <span>{formatDate(vesseld.created)}</span>
                    </div>
                    <div className="speedlimitbotomright">
                      <span style={{ backgroundColor: getSpeedColor(vesseld.speed), padding: '2px 6px', borderRadius: '3px' }}>{vesseld.speed} knots</span>
                    </div>
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
            <h4>{totalVessels} Total Vessels</h4>
            <span>last 24 hours</span>
            <div className="tableformat">
              <table className="vesselssummary">
                <tbody>
                  {staticVesselData.map((vessel) => (
                    <tr key={vessel.type_class}>
                      <td>{vessel.type_count}</td>
                      <td>{formatTypeClass(vessel.type_class)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      <div className="footermenuicon">
        <div className="mainwarpforicon">
          <a className="marineics" href="#!"><img src={marineFooterIcon} alt="Marine" className="footerimgcls" /></a>
          <a className="whaleics" href="#!"><img src={whaleFooterIcon} alt="Whale" className="footerimgclswhale" /></a>
        </div>
        <div className="uptimeMonitoring">site is up</div>
      </div>

      <div className="speedlimitbox_master">
        <div className="speedlimitbox">
          <div className="left">
            <div className="leftmain">
              <div className="limittext">
                SPEED LIMIT
              </div>
              <div className="limitdigit">
                10
              </div>
              <div className="limittext">
                KNOTS
              </div>
            </div>
          </div>
          <div className="right">
            <div className="rightmain">
              <span>CALVING AND</span>
              <span>MIGRATORY GROUNDS</span>
              <span className="smalltext">November - April</span>
              <span>VESSELS OVER 65'</span>
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

export default NoneInteractiveShips;
