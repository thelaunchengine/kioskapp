// NoneInteractiveWhales.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON,Tooltip} from 'react-leaflet';
import axios from 'axios';
import bbox from '@turf/bbox';
import './css/NoneInteractiveWhales.css'; 
import { Icon } from 'leaflet';
import customMarkerIcon from './vessel_icon/cargo_ship_fast.svg'; 
import customMarkerIconWhale from './images/whale.png';
import marineFooterIcon from './images/m2-icon.jpg';
import whaleFooterIcon from './images/m3-icon.png';
import whaleAlertQrmobileImg from './images/wle-img-2.png';
import Slideshow from './Slideshow';
import 'leaflet-rotatedmarker'; 
function NoneInteractiveWhales() {
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
      
  
    // Fetch radar data from the API 
    axios.get('https://m2.protectedseas.net/api/tybee/active.php')
      .then((response) => {
        // Extract vessel data from the "tracks" node
        const tracks = response.data[0].tracks;
       // console.log(response.data[0].tracks); // Log the tracks to the console
         setVesselData(tracks);     
         
        console.log("tracks---");    
        console.log(tracks);
                
                
        console.log("response.data.viewshed----"+response.data[0].viewshed);        
         axios.get("https://whalealert.conserve.io/zones/mid-atlantic-sma.json")
            .then((response) => {
              setGeojsonData(response.data);
      
                console.log("geojsonData---"+response.data);            
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
        
  }, []);
  

if (geojsonData) {
  const bounds = bbox(geojsonData);
  console.log(`Bounding Box: ${bounds}`);
} else {
 
}
function formatDate(dateString) {
  const options = { year: 'numeric',month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  const formattedDate = new Date(dateString).toLocaleString('en-US', options);
  return formattedDate;
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
  const randomNonImages = ['non-spã©cifiã©'];

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
    
        console.log("123-----"+getRandomImage(whaleld.name));
    
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

  return (
            
    <div className="mainWrapper noneInteractiveWhales">        
        <div className="radar-map"> 
            <MapContainer
              center={[32.20,-78.66]}
              zoom={7} // Initial zoom level
              style={{height: '100vh',align:'center' }} 

            >
              <TileLayer
                url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50aGluc3QxIiwiYSI6ImNpbXJ1aGRtYTAxOGl2aG00dTF4ZTBlcmcifQ.k95ENmlDX1roCRKSFlgCNw" // Example tile layer 
              />
              {geojsonData && (
                <GeoJSON data={geojsonData} style={{ fillColor: 'yellow',stroke: false }} />
              )}
      <Marker position={[32.10, -80.86]} 
                        opacity={whaledata.icon.includes('-R') ? 1.0 : 0.8} icon={new Icon({
                        iconUrl: require(`./images/yellowpin.png`),
                        iconSize: [35],
                        iconAnchor: [15, 15]
                })}>
        <Tooltip direction="left" offset={[0,0]} opacity={1} permanent>
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
                      opacity={whaledata.icon.includes('-R') ? 1.0 : 0.8} icon={new Icon({
                            //iconUrl: './vessel_icon/'+vessel.vessel_type+'_'+getSpeedCategory(vessel.speed)+'.svg',
                            //iconUrl: require(`./vessel_icon/${vessel.vessel_type}_${getSpeedCategory(vessel.speed)}.svg`),
                            iconUrl: require(`./vessel_icon/${vessel.vessel_type === "cargo_ship" ? "cargo_ship" : "sailboat"}_${getSpeedCategory(vessel.speed)}.svg`),
                            iconSize: [75], // Adjust the size as needed
                            iconAnchor: [15, 15], // Adjust the anchor point as needed                                            
                        })}                       
                        rotationAngle= {vessel.heading}
                        rotationOrigin= {['center', 'center']}

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
                  opacity={whaledata.icon.includes('-R') ? 1.0 : 0.8} icon={new Icon({
                      //iconUrl: customMarkerIconWhale,
                      iconUrl: require(`./sightingIcons/${whaledata.icon}.png`),
                      iconSize: [30, 30], // Adjust the size as needed
                      iconAnchor: [15, 15], // Adjust the anchor point as needed
                    })}
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
            <div className="qrcodeonmobile_nearbyship">
                <div className="qrcodeimage">
                    <img src={whaleAlertQrmobileImg} alt="QR"/>
                </div>                
            </div>
          </div>
          <div className="vesselDetails">
            <div className="rightsidebar"><span className="rightsidebarheadig">RECENT SIGHTINGS</span></div>
            <ul>{renderWhaleDetails()}</ul> 
        </div>
        
        <div className="infotooltipbox"  style={{ top: position.top, left: position.left }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <div className="tooltipheading">
                <h3>WHALE STATS</h3>
                <span id="formattedDate">SIGHTINGS: last 90 days</span>
                <div className="vesselsdetails">
                    <div className="tableformat"> 
                        <table className="vesselssummary">
                            <tr>
                                <td>12</td>
                                <td>North Atlantic Right Whales</td>
                            </tr>
                            <tr>
                                <td>14</td>
                                <td>Humpback</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Other</td>
                            </tr>
                            <tr>
                                <td>44</td>
                                <td>Unidentified</td>
                            </tr>
                            <tr>
                                <td>14</td>
                                <td>North Atlantic right whales were killed or severely injured in ship collisions since 2017.</td>
                            </tr>
                        </table>                        
                    </div>
                </div>
            </div>
        </div>
        
        
        <div className="footermenuicon">
            <div className="mainwarpforicon">
                <a className="marineics" target="_blank" href="https://m2.protectedseas.net/"><img src={marineFooterIcon} className="footerimgcls" /></a>
                <a className="whaleics" target="_blank" href="https://www.whalealert.org/"><img src={whaleFooterIcon} className="footerimgclswhale" /></a>
            </div>
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
