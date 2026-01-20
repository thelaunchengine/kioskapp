// InteractiveWhales.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip } from 'react-leaflet';
import axios from 'axios';
import bbox from '@turf/bbox';
import './css/InteractiveWhales.css';
import { Icon } from 'leaflet';
import he from 'he';
import Menu from './Menu';
import vesselsIconforPopup from './images/getS3Photo.jpeg';
import whaleAlertQrmobileImg from './images/wle-img-2.png';
import { getSpeedColor } from './Utils';


function InteractiveWhales() {

  const [staticVesselData, setStaticVesselData] = useState([]);
  const [staticWhalesData, setStaticWhalesData] = useState([]);
  const [vesselData, setVesselData] = useState([]);
  const [vesselDdetail, setVesselDdetail] = useState([]);
  const [whaleDetail, setwhaleDetail] = useState([]);
  const [geojsonData, setGeojsonData] = useState(null);
  const [formattedDate, setFormattedDate] = useState('');

  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ top: 75, left: 10 });
  const [initialPosition, setInitialPosition] = useState({ top: 75, left: 10 });
  const markerRefs = useRef([]);

  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleLayers, setIsVisibleLayers] = useState(false);
  const [isVisibleStats, setIsVisibleStats] = useState(false);
  const [isVisibleResources, setIsVisibleResources] = useState(false);
  const [isVisibleHelp, setIsVisibleHelp] = useState(false);

  const [activeIndex, setActiveIndex] = useState(null);

  const selectedOtherData = ['MigratoryCalvingGrounds'];


  useEffect(() => {

    const formatCurrentDateTime = () => {
      const options = {
        year: 'numeric',
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
      try {
        // Fetch radar data from the API 
        axios.get('https://m2.protectedseas.net/api/tybee/active.php')
          .then((response) => {
            // Extract vessel data from the "tracks" node
            const tracks = response.data[0].tracks;
            const recentPhotos = response.data[0].recent_photos.reduce((acc, photo) => {
              acc[photo.track_id] = photo.key;
              return acc;
            }, {});

            const tracksWithPhotos = tracks.map(track => ({
              ...track,
              recent_photo_key: recentPhotos[track.server_track_id] || null
            }));

            console.log("tracksWithPhotos---" + JSON.stringify(tracksWithPhotos));

            setVesselData(tracksWithPhotos);


            // console.log("response.data.viewshed----"+response.data[0].viewshed);        
            axios.get("https://whalealert.conserve.io/zones/mid-atlantic-sma.json")
              .then((response) => {
                setGeojsonData(response.data);

                // console.log("geojsonData---"+response.data);            
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
            setStaticWhalesData(response.data.stats);
            setwhaleDetail(response.data.results);
            // https://maplify.com/waseak/php/search-all-sightings.php?BBOX=-81.22630622,31.45,-77.525000001,34.175366764&limit=20&start=2023-10-21&moderated=1
          })
          .catch((error) => {
            console.error('Error fetching radar data:', error);
          });

      } catch (error) {
        console.error('Error fetching data:', error);
      }

      axios.get('https://m2.protectedseas.net/api/tybee/ais_stats.php')
        .then((response) => {
          setStaticVesselData(response.data);
          //setIsLoading(false); // Set loading state to false when data is fetched
        })
        .catch((error) => {
          console.error('Error fetching radar data:', error);
          //setIsLoading(false); // Set loading state to false even if there's an error
        });

    };
    fetchData();
    const intervalId = setInterval(fetchData, 3600000);
    return () => clearInterval(intervalId);

  }, []);

  const [selectedMarker, setSelectedMarker] = useState(null);

  const handleMarkerClick = (whaledata) => {
    setSelectedMarker(whaledata);
  };


  if (geojsonData) {
    const bounds = bbox(geojsonData);
    console.log(`Bounding Box: ${bounds}`);
  } else {

  }

  function formatTypeClass(typeClass) {
    const words = typeClass.split('_')[0];
    // Capitalize the first letter of the first word
    return words.charAt(0).toUpperCase() + words.slice(1);
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
  function formatFullDate(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    let hour = date.getHours();
    const minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    const period = hour >= 12 ? 'pm' : 'am';

    // Convert the hour to 12-hour format
    hour = hour % 12 || 12;

    const formattedDate = `${month} ${day}, ${year} at ${hour}:${minute} ${period}`;

    return formattedDate;
  }
  const imageExtensions = {
    'humpback': 'svg',
    'right-whale': 'svg',
    'unspecified': 'svg',
    'other': 'svg'
  };

  const getImageFileName = (whaleName) => {
    const nameLowerCase = whaleName.toLowerCase().replace(/\s/g, '-');
    const specificWhaleNames = ['right-whale', 'humpback', 'unspecified'];
    return specificWhaleNames.includes(nameLowerCase)
      ? nameLowerCase
      : 'other';
  };


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

  const totalVessels = staticVesselData.reduce((total, vessel) => total + parseInt(vessel.type_count), 0);

  // Default pin location: Tybee Island
  const userLocation = null;
  const defaultPosition = [32.02278559728223, -80.8438064757624];
  const markerPosition = userLocation || defaultPosition;

  return (

    <div className={`mainWrapper interactiveWhales ${isVisible ? 'overlay' : ''} ${isVisibleLayers ? 'overlay' : ''} ${isVisibleStats ? 'overlay' : ''} ${isVisibleHelp ? 'overlay' : ''}`} >
      <div className="radar-map">
        <MapContainer
          center={[32.20, -78.66]}
          zoom={7} // Initial zoom level
          style={{ height: '100vh', align: 'center' }}

        >
          <TileLayer
            url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50aGluc3QxIiwiYSI6ImNpbXJ1aGRtYTAxOGl2aG00dTF4ZTBlcmcifQ.k95ENmlDX1roCRKSFlgCNw" // Example tile layer 
          />

          {geojsonData && (
            <GeoJSON data={geojsonData} style={{ fillColor: 'yellow', stroke: false }} />
          )}




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
                    <Popup className="vesselpopupcls">
                      <div className="mainwrappopup">
                        <img src={require(`./vessel_icon/${vesselaws.vessel_type === "towing_ship" || vesselaws.vessel_type === "wing_in_ground_effect" ? "cargo_ship" : vesselaws.vessel_type}_side.svg`)} alt={vesselaws.vessel_name} />
                        <h3>{vesselaws.vessel_name}</h3>
                        <div className="vesselsdetailwithimg">
                          <div className="left">
                            {vesselaws.recent_photo_key ? (
                              <img src={vesselaws.recent_photo_key} alt={vesselaws.vessel_name} />
                            ) : (
                              <img src={vesselsIconforPopup} alt={vesselaws.vessel_name} />
                            )}
                          </div>
                          <div className="right">
                            <div className="vesselsdetailformat">
                              <p>SPEED: <span style={{ backgroundColor: getSpeedColor(vesselaws.speed), padding: '2px 6px', borderRadius: '3px' }}>{vesselaws.speed} knots</span></p>
                            </div>
                            <div className="vesselsdetailformat">
                              <p>TYPE:</p>
                              <p className="capitalize">{vesselaws.vessel_type.replace(/_/g, ' ')}</p>
                            </div>
                            <div className="vesselsdetailformat">
                              <p>LAST UPDATED:</p>
                              <p>{formatFullDate(vesselaws.last_update_disp)}</p>
                            </div>
                          </div>
                        </div>
                        {/* Add more vessel information here */}
                      </div>
                    </Popup>
                    <Tooltip direction="right" offset={[-15, 10]} opacity={1} permanent><div className="tooltip_vessel_title" style={{ whiteSpace: 'nowrap' }}><span className="vessel_title">{vesselaws.vessel_name}<span style={{ backgroundColor: getSpeedColor(vesselaws.speed), padding: '2px 4px', borderRadius: '3px', display: 'inline-block', marginLeft: '4px' }}>{vesselaws.speed} kt</span></span><span className="vessel_detail_speed">{vesselaws.heading} &deg;</span></div></Tooltip>
                  </Marker>
                ) : null;
              } else {
                console.warn('Invalid latitude or longitude:', vesselaws.lat, vesselaws.lon);
                return null; // Skip rendering if latitude or longitude is invalid
              }
            })}

          {whaleDetail && whaleDetail.map((whaledata, index) => (
            <Marker
              ref={(el) => (markerRefs.current[index] = el)}
              key={whaledata.id}
              position={[parseFloat(whaledata.latitude), parseFloat(whaledata.longitude)]}
              icon={new Icon({
                //iconUrl: customMarkerIconWhale,
                iconUrl: require(`./sightingIcons/${whaledata.icon}.png`),
                iconSize: whaledata.icon.includes('-R') ? [22.5, 22.5] : [15, 15],
                iconAnchor: whaledata.icon.includes('-R') ? [15, 15] : [10, 10],
              })}
              opacity={whaledata.icon.includes('-R') ? 1.0 : 0.8}
              eventHandlers={{
                click: () => handleMarkerClick(whaledata.id)
              }}
              className={selectedMarker === whaledata.id ? 'active-marker' : ''}
            >
              <Popup>
                <div className="whalemainwrappopup">
                  <img src={require(`./images/whales/icon/${getImageFileName(whaledata.name)}-2.svg`)} alt={whaledata.name} />
                  <h3>{whaledata.moderated === 1 ? 'CONFIRMED SIGHTING' : 'UNCONFIRMED SIGHTING'}</h3>
                  <h5 className="whaledateformator">{formatDate(whaledata.created)}</h5>
                  <div className="whalevesselsdetailwithimg">
                    <div className="whaleleft">
                      {whaledata.photo_url ? (
                        <img src={whaledata.photo_url} alt={whaledata.name} />
                      ) : (
                        <img src={require(`./images/whales/${getImageFileName(whaledata.name)}-1.svg`)} alt={whaledata.name} />
                      )}
                    </div>
                    <div className="whaleright">
                      <div className="detailformat">
                        <p>SPECIES:</p>
                        <p>{whaledata.name}</p>
                      </div>
                      <div className="detailformat">
                        <p>NUMBER SEEN: {whaledata.number_sighted}</p>
                      </div>
                      {whaledata.comments && (
                        <div className="detailformat">
                          <p>NOTES:</p>
                          {whaledata.comments.split('<br>').map((part, partIndex) => (
                            <p key={partIndex}>{he.decode(part)}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
              {/* <Tooltip direction="" offset={[10, 10]} opacity={1} permanent>{whaledata.name}</Tooltip> */}
            </Marker>
          ))}

          <Marker
            position={markerPosition}
            icon={new Icon({
              iconUrl: require(`./images/yellowpin.png`),
              iconSize: [25],
              iconAnchor: [12, 12]
            })}
            interactive={false}
          >
            <Tooltip direction="left" offset={[0, 0]} opacity={1} permanent>
              <div className="tooltip_vessel_title_yourhere">
                <span className="vessel_title_yourhere">YOU ARE HERE</span>
              </div>
            </Tooltip>
          </Marker>
        </MapContainer>

        <div className="qrcodeonmobile">
          <div className="qrcodeimage">
            <img src={whaleAlertQrmobileImg} alt="QR" />
          </div>
          <div className="qrcodetext">
            Download the Free App
          </div>
        </div>

      </div>
      <div className="vesselDetails">
        <div className="rightsidebar"><span className="rightsidebarheadig">RECENT SIGHTINGS</span></div>
        <ul>
          {whaleDetail &&
            whaleDetail.map((whaleld, index) => (
              whaleld.photo_url ? (
                <li key={index} onClick={() => markerRefs.current[index].openPopup()}>
                  <img src={whaleld.photo_url} alt={whaleld.name} />
                  <div className="imageoverlay">
                    <div className="vesselstitleanddate">
                      <h3>{whaleld.name}</h3>
                      <span>{formatDate(whaleld.created)}</span>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={index} onClick={() => markerRefs.current[index].openPopup()}>
                  <img src={require(`./images/whales/${getImageFileName(whaleld.name)}-1.svg`)} alt={whaleld.name} />
                  <div className="imageoverlay">
                    <div className="vesselstitleanddate">
                      <h3>{whaleld.name}</h3>
                      <span>{formatDate(whaleld.created)}</span>
                    </div>
                  </div>
                </li>
              )
            ))}
        </ul>
      </div>

      <Menu
        isVisible={isVisible}
        isVisibleLayers={isVisibleLayers}
        isVisibleStats={isVisibleStats}
        isVisibleResources={isVisibleResources}
        isVisibleHelp={isVisibleHelp}
        whaleDetail={whaleDetail}
        vesselData={vesselData}
        setIsVisible={setIsVisible}
        setIsVisibleLayers={setIsVisibleLayers}
        setIsVisibleStats={setIsVisibleStats}
        setIsVisibleResources={setIsVisibleResources}
        setIsVisibleHelp={setIsVisibleHelp}
        setwhaleDetail={setwhaleDetail}
        setVesselData={setVesselData}
        selectedOtherData={selectedOtherData}
        formattedDate={formattedDate}
        totalVessels={totalVessels}
        staticVesselData={staticVesselData}
        formatTypeClass={formatTypeClass}
        staticWhalesData={staticWhalesData}
      />
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

export default InteractiveWhales;
