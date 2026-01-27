// InteractiveShips.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip, useMapEvents, ScaleControl } from 'react-leaflet';
import axios from 'axios';
import bbox from '@turf/bbox';
import './css/InteractiveShips.css';
import { Icon, DivIcon } from 'leaflet';
import he from 'he';
import Menu from './Menu';
import vesselsIconforPopup from './images/getS3Photo.jpeg';
import whaleAlertQrmobileImg from './images/wle-img-2.png';
import cameraIcon from './images/camera_icon.png';
import { getSpeedColor } from './Utils';
import rightWhaleGeo from './data/corridors/North_Atlantic_Right_Whale_optimized.geojson';
import humpbackWhaleGeo from './data/corridors/Humpback_Whale_optimized.geojson';
import finWhaleGeo from './data/corridors/Fin_Whale_optimized.geojson';
import minkeWhaleGeo from './data/corridors/Minke_Whale_optimized.geojson';
import MarkerClusterGroup from './MarkerClusterGroup';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


function InteractiveShips() {
    const [, setRefresh] = useState();
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


    const selectedOtherData = ['MigratoryCalvingGrounds', 'NearbyShips'];

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


                        console.log("vesselData---" + JSON.stringify(vesselData));

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

                axios.get('https://maplify.com/waseak/php/tybee_2.php?period=90&region=tybee') // 'https://maplify.com/waseak/php/search-all-sightings.php?BBOX=-124,48,-122,50&limit=20&start=2023-01-01&moderated=1'
                    .then((response) => {
                        setStaticWhalesData(response.data.stats);
                        setwhaleDetail(response.data.results);
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
        const intervalId = setInterval(fetchData, 30000);
        return () => clearInterval(intervalId);

    }, []);

    const [activeMarker, setActiveMarker] = useState(null);
    const handleWhaleMarkerClick = (id) => {
        setActiveMarker(id);
    };

    function formatTypeClass(typeClass) {
        const words = typeClass.split('_')[0];
        // Capitalize the first letter of the first word
        return words.charAt(0).toUpperCase() + words.slice(1);
    }

    function ClickHandler() {
        useMapEvents({
            click() {
                setActiveMarker(null); // Reset active marker when map is clicked
            }
        });
        return null;
    }

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




    const [selectedMarker, setSelectedMarker] = useState(null);

    const handleMarkerClick = (whaledata) => {
        setSelectedMarker(whaledata);
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
    const totalVessels = staticVesselData.reduce((total, vessel) => total + parseInt(vessel.type_count), 0);

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

    const [showRightWhaleCorridor, setShowRightWhaleCorridor] = useState(false);
    const [showHumpbackWhaleCorridor, setShowHumpbackWhaleCorridor] = useState(false);
    const [showFinWhaleCorridor, setShowFinWhaleCorridor] = useState(false);
    const [showMinkeWhaleCorridor, setShowMinkeWhaleCorridor] = useState(false);

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
        <div className={`mainWrapper ${isVisible ? 'overlay' : ''} ${isVisibleLayers ? 'overlay' : ''} ${isVisibleStats ? 'overlay' : ''} ${isVisibleHelp ? 'overlay' : ''}`} >
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
                    {isMiami && rightWhaleData && showRightWhaleCorridor && <GeoJSON data={rightWhaleData} style={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} />}
                    {isMiami && humpbackWhaleData && showHumpbackWhaleCorridor && <GeoJSON data={humpbackWhaleData} style={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />}
                    {isMiami && finWhaleData && showFinWhaleCorridor && <GeoJSON data={finWhaleData} style={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }} />}
                    {isMiami && minkeWhaleData && showMinkeWhaleCorridor && <GeoJSON data={minkeWhaleData} style={{ color: 'purple', fillColor: 'purple', fillOpacity: 0.2 }} />}
                    {geojsonData && <GeoJSON data={geojsonData} style={{ fillColor: 'yellow', stroke: false }} />}
                    {/* Plot vessels as markers if vesselData is defined */}
                    {vesselData &&
                        vesselData.map((vesselaws, index) => {
                            const latitude = parseFloat(vesselaws.lat).toFixed(6);
                            const longitude = parseFloat(vesselaws.lon).toFixed(6);

                            // console.log("headingnew---"+headingnew);

                            if (!isNaN(latitude) && !isNaN(longitude)) {
                                // console.log('Latitude:', latitude);
                                // console.log('Longitude:', longitude);
                                return vesselaws.server_track_id ? (
                                    <Marker
                                        key={vesselaws.server_track_id}
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
                                        <Tooltip direction="right" offset={[-15, 10]} opacity={1} permanent><div className="tooltip_vessel_title" style={{ whiteSpace: 'nowrap' }}><span className="vessel_title">{vesselaws.vessel_name}{vesselaws.speed ? <span style={{ backgroundColor: getSpeedColor(vesselaws.speed), padding: '2px 4px', borderRadius: '3px', display: 'inline-block', marginLeft: '4px' }}>{vesselaws.speed} kt</span> : ''}</span><span className="vessel_detail_speed">{vesselaws.heading} &deg;</span></div></Tooltip>
                                    </Marker>
                                ) : null;
                            } else {
                                console.warn('Invalid latitude or longitude:', vesselaws.lat, vesselaws.lon);
                                return null; // Skip rendering if latitude or longitude is invalid
                            }
                        })}

                    <MarkerClusterGroup chunkedLoading>
                        {whaleDetail && whaleDetail.map((whaledata, index) => (
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
                                eventHandlers={{
                                    click: () => handleMarkerClick(whaledata.id)
                                }}
                                className={selectedMarker === whaledata.id ? 'active-marker' : ''}
                            >
                                <Popup
                                    className="vesselpopupcls"
                                >
                                    <div className="whalemainwrappopup">
                                        <img src={require(`./images/whales/icon/${getImageFileName(whaledata.name)}-2.svg`)} alt={whaledata.name} />
                                        <h3>
                                            {whaledata.moderated === 1 ? 'CONFIRMED SIGHTING' : 'UNCONFIRMED SIGHTING'}
                                        </h3>
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
                    </MarkerClusterGroup>

                    {vesselDdetail &&
                        vesselDdetail.map((vesseld, index) => (
                            vesseld.key ? (
                                <Marker
                                    key={vesseld.key}
                                    ref={(el) => (markerRefs.current[index] = el)}
                                    position={[31.72278559728223, -80.6038064757624]}
                                    rotationAngle={calculateRotationAngle(vesseld.course)}
                                    rotationOrigin={['center', 'center']}
                                    icon={new Icon({
                                        iconUrl: require(`./vessel_icon/sailboat_slow.svg`),
                                        iconSize: [0], // Adjust the size as needed
                                        iconAnchor: [0, 0], // Adjust the anchor point as needed                                            
                                    })}
                                >
                                    <Popup className="vesselpopupcls">
                                        <div className="mainwrappopup">
                                            <img src={require(`./vessel_icon/${vesseld.vessel_type === "towing_ship" || vesseld.vessel_type === "wing_in_ground_effect" ? "cargo_ship" : vesseld.vessel_type}_side.svg`)} alt={vesseld.vessel_name} />
                                            <h3>{vesseld.vessel_name}</h3>
                                            <div className="vesselsdetailwithimg">
                                                <div className="left">
                                                    <img src={vesseld.key} alt={vesseld.vessel_name} />
                                                </div>
                                                <div className="right">
                                                    <div className="vesselsdetailformat">
                                                        <p>SPEED: <span style={{ backgroundColor: getSpeedColor(vesseld.speed), padding: '2px 6px', borderRadius: '3px' }}>{vesseld.speed} knots</span></p>
                                                    </div>
                                                    <div className="vesselsdetailformat">
                                                        <p>TYPE:</p>
                                                        <p className="capitalize">{vesseld.vessel_type.replace(/_/g, ' ')}</p>
                                                    </div>
                                                    <div className="vesselsdetailformat">
                                                        <p>LAST UPDATED:</p>
                                                        <p>{formatFullDate(vesseld.created)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : null
                        ))}

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
                <div className="rightsidebar"><span className="rightsidebarheadig">NEARBY SHIPS</span></div>
                <ul>
                    {vesselDdetail &&
                        vesselDdetail.map((vesseld, index) => (
                            vesseld.key ? (
                                <li key={index} onClick={() => markerRefs.current[index].openPopup()} className={activeIndex === index ? 'active' : ''}>
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
                isMiami={isMiami}
                showRightWhaleCorridor={showRightWhaleCorridor}
                setShowRightWhaleCorridor={setShowRightWhaleCorridor}
                showHumpbackWhaleCorridor={showHumpbackWhaleCorridor}
                setShowHumpbackWhaleCorridor={setShowHumpbackWhaleCorridor}
                showFinWhaleCorridor={showFinWhaleCorridor}
                setShowFinWhaleCorridor={setShowFinWhaleCorridor}
                showMinkeWhaleCorridor={showMinkeWhaleCorridor}
                setShowMinkeWhaleCorridor={setShowMinkeWhaleCorridor}
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

export default InteractiveShips;
