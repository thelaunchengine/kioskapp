// NoneInteractiveWhales.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip } from 'react-leaflet';
import axios from 'axios';
import bbox from '@turf/bbox';
import './css/NoneInteractiveWhales.css';
import { Icon } from 'leaflet';
import customMarkerIcon from './vessel_icon/cargo_ship_fast.svg';
import customMarkerIconWhale from './images/whale.png';
import marineFooterIcon from './images/m2-icon.jpg';
import whaleFooterIcon from './images/m3-icon.png';
import whaleAlertQrmobileImg from './images/wle-img-2.png';
import { getSpeedColor } from './Utils';

import Slideshow from './Slideshow';
import 'leaflet-rotatedmarker';
import rightWhaleGeo from './data/corridors/North_Atlantic_Right_Whale_optimized.geojson';
import humpbackWhaleGeo from './data/corridors/Humpback_Whale_optimized.geojson';
import finWhaleGeo from './data/corridors/Fin_Whale_optimized.geojson';
import minkeWhaleGeo from './data/corridors/Minke_Whale_optimized.geojson';
function NoneInteractiveWhales() {
  const [, setRefresh] = useState();
  const [staticWhalesData, setStaticWhalesData] = useState([]);
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
        hour: '2-digit',
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
          setStaticWhalesData(response.data.stats);
          setwhaleDetail(response.data.results);
        })
        .catch((error) => {
          console.error('Error fetching radar data:', error);
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

  const checkImageExists = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const getRandomNonImage = async () => {
    const randomNonImage = Math.floor(Math.random() * 4) + 1; // Generates a random number between 1 and 4
    try {
      for (let i = 1; i <= 4; i++) {
        const imageName = `non-${randomNonImage}.jpg`;
        const imageSrc = 'https://wackypuppy.com/tybee/whales/bottlenose-whale-2.jpg';
        const exists = await checkImageExists(imageSrc);

        if (exists) {
          return imageSrc;
        }
      }
    } catch (error) {
      console.error(error);
    }

    return ''; // Return an empty string if none of the random non-images are found
  };

  const getRandomImage = async (name) => {
    const formattedName = name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '');
    const randomNonImages = ['non-sp�cifi�', 'fin-whale', 'other-(specify-in-comments)'];

    if (randomNonImages.includes(formattedName)) {
      const nonImage = await getRandomNonImage();
      return nonImage;
    }

    for (let i = 1; i <= 10; i++) {
      const imageName = `${formattedName}-${i}.jpg`;
      try {
        const imageSrc = 'https://wackypuppy.com/tybee/whales/bottlenose-whale-2.jpg';
        const exists = await checkImageExists(imageSrc);

        if (exists) {
          return imageSrc;
        }
      } catch (error) {
        console.error(error);
      }
    }

    return await getRandomNonImage(); // Return random non-image if specific images are not found
  };

  const renderWhaleDetails = () => {
    return whaleDetail.map((whaleld, index) => {
      let listItem;

      console.log("123-----" + getRandomImage(whaleld.name));

      const imageUrl = whaleld.photo_url || getRandomImage(whaleld.name);

      listItem = (
        <li key={index} onClick={() => markerRefs.current[index].openPopup()}>
          <img src={imageUrl} alt={whaleld.name} />
          <div className="imageoverlay">
            <div className="vesselstitleanddate">
              <h3>{whaleld.name}</h3>
              <span>{formatDate(whaleld.created)}</span>
            </div>
          </div>
        </li>
      );

      return listItem;
    });
  };
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
  // const totalWhales = Object.values(setStaticWhalesData).reduce((acc, curr) => acc + curr, 0);

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
  const mapCenter = isMiami ? miamiMarkerPosition : [32.20, -78.66];

  return (

    <div className="mainWrapper noneInteractiveWhales">
      <div className="radar-map">
        <MapContainer
          center={isMiami ? [26.15, -80.0] : [32.0, -80.0]}
          zoom={isMiami ? 8 : 9}
          maxZoom={12}
          minZoom={isMiami ? 7 : 7}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50aGluc3QxIiwiYSI6ImNpbXJ1aGRtYTAxOGl2aG00dTF4ZTBlcmcifQ.k95ENmlDX1roCRKSFlgCNw"
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {isMiami && rightWhaleData && <GeoJSON data={rightWhaleData} style={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} />}
          {isMiami && humpbackWhaleData && <GeoJSON data={humpbackWhaleData} style={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />}
          {isMiami && finWhaleData && <GeoJSON data={finWhaleData} style={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }} />}
          {isMiami && minkeWhaleData && <GeoJSON data={minkeWhaleData} style={{ color: 'purple', fillColor: 'purple', fillOpacity: 0.2 }} />}

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
        <div className="qrcodeonmobile_nearbyship">
          <div className="qrcodeimage">
            <img src={whaleAlertQrmobileImg} alt="QR" />
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

      <div className="infotooltipbox" style={{ top: position.top, left: position.left }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <div className="tooltipheading">
          <h3>WHALE STATS</h3>
          <span id="formattedDate">SIGHTINGS: last 90 days</span>
          <div className="vesselsdetails">
            <div className="tableformat">
              <table className="vesselssummary">
                <tbody>
                  {Object.entries(staticWhalesData).map(([key, value]) => (
                    <tr key={key}>
                      <td>{value}</td>
                      <td>{key}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>14</td>
                    <td>North Atlantic right whales were killed or severely injured in ship collisions since 2017.</td>
                  </tr>
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
      <Slideshow />
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

export default NoneInteractiveWhales;
