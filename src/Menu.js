// Menu.js
import React, { useState, useEffect, useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import 'bootstrap/dist/css/bootstrap.min.css';
import customMarkerIcon from './vessel_icon/cargo_ship_fast.svg';
import customMarkerIconWhale from './images/whale.png';
import plusIcon from './images/plus-icon-b.jpg';
import shipsIcon from './images/wle-img-5.png';
import whaleIconB from './images/icon-b2.png';
import marineFooterIcon from './images/m2-icon.jpg';
import whaleFooterIcon from './images/m3-icon.png';
import whaleAlertQrmobileImg from './images/wle-img-2.png';
import { motion } from "framer-motion"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Menu({
    isVisible,
    isVisibleLayers,
    isVisibleStats,
    isVisibleResources,
    isVisibleHelp,
    whaleDetail,
    vesselData,
    setIsVisible,
    setIsVisibleLayers,
    setIsVisibleStats,
    setIsVisibleResources,
    setIsVisibleHelp,
    setwhaleDetail,
    setVesselData,
    formattedDate,
    totalVessels,
    staticVesselData,
    formatTypeClass,
    staticWhalesData,
    isMiami,
    showRightWhaleCorridor,
    setShowRightWhaleCorridor,
    showHumpbackWhaleCorridor,
    setShowHumpbackWhaleCorridor,
    showFinWhaleCorridor,
    setShowFinWhaleCorridor,
    showMinkeWhaleCorridor,
    setShowMinkeWhaleCorridor
}) {

    const popupRef = useRef(null);
    const popupRefMenu = useRef(null);
    const popupRefResources = useRef(null);
    const popupRefHelp = useRef(null);
    const popupRefStats = useRef(null);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
    const toggleVisibilityLayers = () => {
        setIsVisibleLayers(!isVisibleLayers);
    };
    const toggleVisibilityStats = () => {
        setIsVisibleStats(!isVisibleStats);
    };

    const toggleVisibilityResources = () => {
        setIsVisibleResources(!isVisibleResources);
    };
    const toggleVisibilityHelp = () => {
        setIsVisibleHelp(!isVisibleHelp);
    };


    const navigate = useNavigate();

    const handleLinkClick = () => {
        navigate('/interactive-ships');
    };
    const handleLinkClickWhale = () => {
        navigate('/interactive-whales');
    };
    const handleLinkClickResources = () => {
        window.location.href = 'https://www.fisheries.noaa.gov/species/north-atlantic-right-whale';
    };

    /* Checkbox Code Start */
    const [allWhalesSelected, setAllWhalesSelected] = useState(true);
    const [selectedSubData, setSelectedSubData] = useState(['Right', 'Humpback', 'Blue', 'Unidentified']);
    const [selectedOtherData, setSelectedOtherData] = useState(['MigratoryCalvingGrounds']);

    const handleAllWhalesChange = async (event) => {

        setAllWhalesSelected(!allWhalesSelected);
        if (!allWhalesSelected) {
            setSelectedSubData(['Right', 'Humpback', 'Blue', 'Unidentified']);
            try {
                var valdefault = 90;
                if (selectedOption === "last30days") {
                    valdefault = 30;
                }
                if (selectedOption === "last90days") {
                    valdefault = 90;
                }
                if (selectedOption === "currentyear") {
                    valdefault = "current_year";
                }
                if (selectedOption === "lastyear") {
                    valdefault = "last_year";
                }
                axios.get('https://maplify.com/waseak/php/tybee_2.php?period=' + valdefault + '&region=tybee')
                    .then((response) => {
                        setwhaleDetail(response.data.results);
                    }).catch((error) => {
                        console.error('Error fetching radar data:', error);
                    });
            } catch (error) {
                console.error('Error fetching data IF: ', error);
            }
        } else {
            setSelectedSubData([]);
            try {
                var valdefault = 90;
                if (selectedOption === "last30days") {
                    valdefault = 30;
                }
                if (selectedOption === "last90days") {
                    valdefault = 90;
                }
                if (selectedOption === "currentyear") {
                    valdefault = "current_year";
                }
                if (selectedOption === "lastyear") {
                    valdefault = "last_year";
                }

                axios.get('https://maplify.com/waseak/php/tybee_2.php?period=' + valdefault + '&region=tybee')
                    .then((response) => {
                        const filteredResults = response.data.results.filter(item => {
                            // Check if item name is included in selectedSubData or not
                            if (selectedSubData.includes(item.name)) {
                                return false; // Include if found in selectedSubData
                            } else {
                                // Check if any selectedSubData item is a substring of item name
                                return !selectedSubData.some(selectedItem => item.name.includes(selectedItem));
                            }
                        });
                        setwhaleDetail(filteredResults);
                    }).catch((error) => {
                        console.error('Error fetching radar data:', error);
                    });
            }
            catch (error) {
                console.error('Error fetching data ELSE: ', error);
            }
        }
    };

    const [vesselDdetail, setVesselDdetail] = useState([]);

    const handleSubDataChange = async (event) => {
        const selectedSub = event.target.value;
        const updatedSubData = [...selectedSubData];

        if (updatedSubData.includes(selectedSub)) {
            const index = updatedSubData.indexOf(selectedSub);
            updatedSubData.splice(index, 1);
        } else {
            updatedSubData.push(selectedSub);
        }

        setSelectedSubData(updatedSubData);
        setAllWhalesSelected(updatedSubData.length === 4);


        // console.error('Call Function Value is :', event.target);
        const { value, checked } = event.target;

        // Update selectedSubData state
        if (checked) {
            setSelectedSubData([...selectedSubData, value]);
        } else {
            setSelectedSubData(selectedSubData.filter(item => item !== value));
        }
        try {

            // console.error('Call Function Value is :', value);

            var valdefault = 90;
            if (selectedOption === "last30days") {
                valdefault = 30;
            }
            if (selectedOption === "last90days") {
                valdefault = 90;
            }
            if (selectedOption === "currentyear") {
                valdefault = "current_year";
            }
            if (selectedOption === "lastyear") {
                valdefault = "last_year";
            }

            axios.get('https://maplify.com/waseak/php/tybee.php?period=' + valdefault + '&region=tybee')
                .then((response) => {
                    //const filteredData = response.data.results.filter(item => updatedSubData.includes(item.name));

                    const filteredResults = response.data.results.filter(item => {
                        // Check if item name is included in selectedSubData or not
                        if (updatedSubData.includes(item.name)) {
                            return true; // Include if found in selectedSubData
                        } else {
                            // Check if any selectedSubData item is a substring of item name
                            return updatedSubData.some(selectedItem => item.name.includes(selectedItem));
                        }
                    });

                    /* 
                    if(value==="Right"){
                        const filteredData = response.data.results.filter(item => item.name !== "Right Whale");
                    }
                    if(value==="Humpback"){
                        const filteredData = response.data.results.filter(item => item.name !== "Humpback");
                    }
                    if(value==="Blue"){
                        const filteredData = response.data.results.filter(item => item.name !== "Blue Whale");
                    }
                    if(value==="Unidentified"){
                        
                    }          
                    */
                    // Set the filtered data to the state variable
                    setwhaleDetail(filteredResults);
                })
                .catch((error) => {
                    console.error('Error fetching radar data:', error);
                });

        } catch (error) {
            console.error('Error fetching data: ', error);
        }

    };



    const handleOtherDataChange = async (event) => {
        const selectedData = event.target.value;
        const updatedSubData = [...selectedOtherData];

        if (updatedSubData.includes(selectedData)) {
            const index = updatedSubData.indexOf(selectedData);
            updatedSubData.splice(index, 1);
        } else {
            updatedSubData.push(selectedData);
        }

        setSelectedOtherData(updatedSubData);
        // setAllWhalesSelected(false);

        const { value, checked } = event.target;

        if (checked) {
            if (value === "NearbyShips") {
                axios.get('https://m2.protectedseas.net/api/tybee/active.php')
                    .then((response) => {
                        // Extract vessel data from the "tracks" node
                        const tracks = response.data[0].tracks;
                        setVesselData(tracks);
                    }).catch((error) => {
                        console.error('Error fetching radar data:', error);
                    });
            }
        } else {
            if (value === "NearbyShips") {
                setVesselData();
            }
        }
    };

    const [selectedOption, setSelectedOption] = useState('last90days');

    const handleRadioChange = async (event) => {

        setSelectedOption(event.target.value);
        // console.error('Call Function Value is :', event.target);
        const { value, checked } = event.target;

        // Update selectedSubData state
        if (checked) {
            //setSelectedOption([...selectedOption, value]);
        } else {
            //setSelectedOption(selectedOption.filter(item => item !== value));
        }

        try {
            var passval = "90";
            if (value === "last30days") {
                passval = 30;
            }
            if (value === "last90days") {
                passval = 90;
            }
            if (value === "currentyear") {
                passval = "current_year";
            }
            if (value === "lastyear") {
                passval = "last_year";
            }
            console.error('handleRadioChange:', passval);

            axios.get('https://maplify.com/waseak/php/tybee_2.php?period=' + passval + '&region=tybee')
                .then((response) => {
                    setwhaleDetail(response.data.results);
                })
                .catch((error) => {
                    console.error('Error fetching radar data:', error);
                });

        } catch (error) {
            console.error('Error fetching data: ', error);
        }


    };
    const handleResetReload = () => {
        window.location.reload(); // Reload the page
    };
    /* Checkbox Code End */


    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setIsVisibleLayers(false);
        }
        if (popupRefMenu.current && !popupRefMenu.current.contains(event.target)) {

            // Check if the clicked element or its ancestor has the class "box1"
            if (event.target.closest('.box1.explorerNearByShips')) {
                handleLinkClick(); // Handle click on box1 or its descendants
            } else if (event.target.closest('.box2.explorerWhaleSightings')) {
                handleLinkClickWhale(); // Handle click on box2 or its descendants
            } else if (event.target.closest('.box3')) {
            } else {
                setIsVisible(false);
            }

        }
        if (popupRefResources.current && !popupRefResources.current.contains(event.target)) {
            setIsVisibleResources(false);
        }
        if (popupRefHelp.current && !popupRefHelp.current.contains(event.target)) {
            setIsVisibleHelp(false);
        }
        if (popupRefStats.current && !popupRefStats.current.contains(event.target)) {
            setIsVisibleStats(false);
        }


    };

    document.addEventListener('mousedown', handleClickOutside);


    return (

        <div>
            <div className="dynamicmenu">
                <div className="menu">
                    <div className="mainmenu">
                        <a id="mainmenuid" href="#!" className="" onClick={toggleVisibility}>
                            <label>MENU</label>
                            <span className={`menuics ${isVisible ? 'minus' : 'plus'}`}></span>
                        </a>
                        <a id="mainmenuid2" href="#!" className="" onClick={toggleVisibilityLayers}>
                            <label>LAYERS</label>
                            <span className="layers"></span>
                        </a>
                        <a id="mainmenuid3" href="#!" className="" onClick={toggleVisibilityStats}>
                            <label>STATS</label>
                            <span className="stats"></span>
                        </a>
                    </div>
                </div>
            </div>
            <div className="infosection">
                <a id="mainmenuid3" href="#!" className="" onClick={toggleVisibilityHelp}>
                    <label>HELP</label>
                    <span className="stats"></span>
                </a>
            </div>

            <div className={`menumainexploreships ${isVisible ? 'fadeIn' : 'fadeOut'} ${isVisibleResources ? 'fadeOut' : ''} ${isVisibleHelp ? 'fadeOut' : ''}`}>
                <div className="mianwrap">
                    <div className="boxesmain">
                        <div className="box1 explorerNearByShips" ref={popupRefMenu}>
                            <div className="icon">
                                <img src={shipsIcon} alt="Ships" className="imgclsbig" />
                            </div>
                            <div className="text">
                                <span>EXPLORE NEARBY SHIPS</span>
                            </div>
                            <div className="plus">
                                <img src={plusIcon} alt="Plus" className="imgcls" />
                            </div>
                        </div>

                        <div className="box2 explorerWhaleSightings" ref={popupRefMenu}>
                            <div className="icon">
                                <img src={whaleIconB} alt="Whale" className="imgclsbig" />
                            </div>
                            <div className="text">
                                <span>EXPLORE WHALE SIGHTINGS</span>
                            </div>
                            <div className="plus">
                                <img src={plusIcon} alt="Plus" className="imgcls" />
                            </div>
                        </div>
                    </div>
                    <div className="box3" ref={popupRefMenu} onClick={toggleVisibilityResources}>
                        <div className="text">
                            <span>MORE RESOURCES</span>
                        </div>
                        <div className="plus">
                            <img src={plusIcon} alt="Plus" className="imgcls" />
                        </div>
                    </div>

                </div>
            </div>


            <div className={`menumainexplorelayers ${isVisibleLayers ? 'fadeIn' : 'fadeOut'}`}>
                <div className="mianwrap">
                    <div className="boxesmain">
                        <div className="box1" ref={popupRef}>
                            <div className="closedbtn"><a id="closedbtnid" href="#!" onClick={toggleVisibilityLayers}>X</a></div>
                            <div className="icon">
                                <img src={shipsIcon} alt="Ships" className="imgclsbig" />
                            </div>

                            <div className="text">
                                <span>SELECT WHAT IS DISPLAYED ON THE MAP</span>
                            </div>
                            <div className="radiomaster">
                                <div className="radiogroups">
                                    <div className="radiogroupsmaster">
                                        <div className="checkboxmainwrap">
                                            <div className="radiogroupmain">
                                                <a className="button resetBtn" href="#!" onClick={handleResetReload}>Reset</a>
                                                <div className="textlabel">
                                                    <span>Display whales reported in the:</span>
                                                </div>
                                                <div className="radiomain">
                                                    <input
                                                        type="radio"
                                                        id="last30days"
                                                        name="reportedindays"
                                                        value="last30days"
                                                        checked={selectedOption === 'last30days'}
                                                        onChange={handleRadioChange}
                                                    />
                                                    <label htmlFor="last30days">Last 30 days</label>
                                                </div>
                                                <div className="radiomain">
                                                    <input
                                                        type="radio"
                                                        id="last90days"
                                                        name="reportedindays"
                                                        value="last90days"
                                                        checked={selectedOption === 'last90days'}
                                                        onChange={handleRadioChange}
                                                    />
                                                    <label htmlFor="last90days">Last 90 days</label>
                                                </div>
                                                <div className="radiomain">
                                                    <input
                                                        type="radio"
                                                        id="currentyear"
                                                        name="reportedindays"
                                                        value="currentyear"
                                                        checked={selectedOption === 'currentyear'}
                                                        onChange={handleRadioChange}
                                                    />
                                                    <label htmlFor="currentyear">Current year</label>
                                                </div>
                                                <div className="radiomain">
                                                    <input
                                                        type="radio"
                                                        id="lastyear"
                                                        name="reportedindays"
                                                        value="lastyear"
                                                        checked={selectedOption === 'lastyear'}
                                                        onChange={handleRadioChange}
                                                    />
                                                    <label htmlFor="lastyear">Last year</label>
                                                </div>
                                            </div>
                                            <div className="checkboxmain">
                                                <input
                                                    type="checkbox"
                                                    id="allWhales"
                                                    checked={allWhalesSelected}
                                                    onChange={handleAllWhalesChange}
                                                />
                                                <label htmlFor="allWhales">All Whales</label>
                                            </div>
                                            <div className="subData">
                                                {/* Whales checkboxes */}
                                                <input
                                                    type="checkbox"
                                                    id="rightWhale"
                                                    value="Right"
                                                    checked={selectedSubData.includes('Right')}
                                                    onChange={handleSubDataChange}
                                                />
                                                <label htmlFor="rightWhale">Right</label>
                                                <br />
                                                <input
                                                    type="checkbox"
                                                    id="humpbackWhale"
                                                    value="Humpback"
                                                    checked={selectedSubData.includes('Humpback')}
                                                    onChange={handleSubDataChange}
                                                />
                                                <label htmlFor="humpbackWhale">Humpback</label>
                                                <br />
                                                <input
                                                    type="checkbox"
                                                    id="blueWhale"
                                                    value="Blue"
                                                    checked={selectedSubData.includes('Blue')}
                                                    onChange={handleSubDataChange}
                                                />
                                                <label htmlFor="blueWhale">Blue</label>
                                                <br />
                                                <input
                                                    type="checkbox"
                                                    id="unidentifiedWhale"
                                                    value="Unidentified"
                                                    checked={selectedSubData.includes('Unidentified')}
                                                    onChange={handleSubDataChange}
                                                />
                                                <label htmlFor="unidentifiedWhale">Unidentified</label>
                                            </div>
                                            {/* Other data categories */}
                                            <div className="checkboxmain">
                                                <input
                                                    type="checkbox"
                                                    id="nearbyShips"
                                                    value="NearbyShips"
                                                    checked={selectedOtherData.includes('NearbyShips')}
                                                    onChange={handleOtherDataChange}
                                                />
                                                <label htmlFor="nearbyShips">Nearby Ships</label>
                                            </div>
                                            <div className="checkboxmain">
                                                <input
                                                    type="checkbox"
                                                    id="migratoryCalvingGrounds"
                                                    value="MigratoryCalvingGrounds"
                                                    checked={selectedOtherData.includes('MigratoryCalvingGrounds')}
                                                    onChange={handleOtherDataChange}
                                                />
                                                <label htmlFor="migratoryCalvingGrounds">Migratory, Calving and Calving Grounds</label>
                                            </div>

                                            {isMiami && (
                                                <div className="checkboxwhalescorridor">
                                                    <div className="textlabel">
                                                        <span>Whale Corridors:</span>
                                                    </div>
                                                    <div className="checkboxmain">
                                                        <input
                                                            type="checkbox"
                                                            id="rightWhaleCorridor"
                                                            checked={showRightWhaleCorridor}
                                                            onChange={(e) => setShowRightWhaleCorridor(e.target.checked)}
                                                        />
                                                        <label htmlFor="rightWhaleCorridor">Right Whale Corridor</label>
                                                    </div>
                                                    <div className="checkboxmain">
                                                        <input
                                                            type="checkbox"
                                                            id="humpbackWhaleCorridor"
                                                            checked={showHumpbackWhaleCorridor}
                                                            onChange={(e) => setShowHumpbackWhaleCorridor(e.target.checked)}
                                                        />
                                                        <label htmlFor="humpbackWhaleCorridor">Humpback Whale Corridor</label>
                                                    </div>
                                                    <div className="checkboxmain">
                                                        <input
                                                            type="checkbox"
                                                            id="finWhaleCorridor"
                                                            checked={showFinWhaleCorridor}
                                                            onChange={(e) => setShowFinWhaleCorridor(e.target.checked)}
                                                        />
                                                        <label htmlFor="finWhaleCorridor">Fin Whale Corridor</label>
                                                    </div>
                                                    <div className="checkboxmain">
                                                        <input
                                                            type="checkbox"
                                                            id="minkeWhaleCorridor"
                                                            checked={showMinkeWhaleCorridor}
                                                            onChange={(e) => setShowMinkeWhaleCorridor(e.target.checked)}
                                                        />
                                                        <label htmlFor="minkeWhaleCorridor">Minke Whale Corridor</label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`menumainexplorestats ${isVisibleStats ? 'fadeIn' : 'fadeOut'}`} >
                <div className="mianwrap">
                    <div className="boxesmain mainboxcls popupRefStats" ref={popupRefStats}>
                        <div className="closedbtn"><a id="closedbtnid" href="#!" onClick={toggleVisibilityStats}>X</a></div>
                        <div className="box1">
                            <div className="text">
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
                        </div>
                        <div className="box2">
                            <div className="text">
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
                        </div>
                    </div>




                </div>
            </div>

            <div className={`menumainexploreresources ${isVisibleResources ? 'fadeIn' : 'fadeOut'}`} >
                <div className="mianwrap">
                    <div className="boxesmain">
                        <div className="box1 rspop-wide" ref={popupRefResources}>
                            <div className="closedbtn"><a id="closedbtnid" href="#!" onClick={toggleVisibilityResources}>X</a></div>
                            <div className="text">
                                <h2 className="rs-poptitle">Resources</h2>
                                <div className="resourcespopupmaster">
                                    <div className="rs-pop-left-col">
                                        <div className="rs-item-list">
                                            <div className="rs-item">
                                                <div className="rsi-left">
                                                    <img src="" alt="" />
                                                </div>
                                                <div className="rsi-right">
                                                    <h3>Learn more about North Atlantic Right Whale</h3>
                                                    <p>The North Atlantic right whale is one of the world’s most endangered large whale species; the latest preliminary estimate suggests there are fewer than 350 remaining.</p>
                                                    <p className="btn-wrap">https://www.fisheries.noaa.gov/species/north-atlantic-right-whale</p>
                                                </div>
                                            </div>
                                            <div className="rs-item">
                                                <div className="rsi-left">
                                                    <img src="" alt="" />
                                                </div>
                                                <div className="rsi-right">
                                                    <h3>Go Slow, Whales Below: Vessel Strikes Continue To Threaten North Atlantic Right Whales</h3>
                                                    <p>REPORT Oceana October 2023</p>
                                                    <p>North Atlantic right whales are swimming on the edge of extinction. These large whales are prone to vessel strikes because they are dark in color, lack a dorsal fin, and tend to swim slowly near the water’s surface, making them very difficult to spot.</p>
                                                    <p className="btn-wrap">https://usa.oceana.org/reports/go-slow-whales-below-vessel-strikes-continue-to-threaten-north-atlantic-right-whales/</p>
                                                </div>
                                            </div>
                                            <div className="rs-item">
                                                <div className="rsi-left">
                                                    <img src="" alt="" />
                                                </div>
                                                <div className="rsi-right">
                                                    <h3>NOAA Fisheries North Atlantic Right Whale Active Seasonal Speed Zone Vessel Traffic Dashboard</h3>
                                                    <p>Endangered North Atlantic right whales are at heightened risk for vessel strikes because they spend a lot of time at the water surface. Vessel strikes are a primary threat to the species, and collisions with vessels going faster than 10 knots are up to 90% more likely to cause death or serious injury. Explore the speeds of different vessel types from over 10 years of data collection.</p>
                                                    <p className="btn-wrap">https://experience.arcgis.com/experience/315a0a2c4e084cf6ae8babd8c81b07b3</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rs-pop-right-col">
                                        <h2>What You Can Do</h2>
                                        <div className="rs-item-list">
                                            <div className="rs-item">
                                                <div className="rsi-right">
                                                    <h3>Go slow for the whales below!</h3>
                                                    <p>All boaters can help save right whales by slowing down in Right Whale Slow Zones. Maintaining speeds of 10 knots or less helps protect right whales from vessel collisions. Help spread the word to the boaters you know!</p>
                                                    <p className="btn-wrap">https://www.fisheries.noaa.gov/feature-story/help-endangered-whales-slow-down-slow-zones</p>
                                                </div>
                                            </div>
                                            <div className="rs-item">
                                                <div className="rsi-right">
                                                    <h3>Download the free Whale Alert app</h3>
                                                    <p>See what whales have been reported recently, and be ready to report a sighting when you see a whale.</p>
                                                    <p className="btn-wrap">https://www.whalealert.org</p>
                                                </div>
                                            </div>
                                            <div className="rs-item">
                                                <div className="rsi-right">
                                                    <h3>Donate</h3>
                                                    <p>Donate to provide critical support for further development of technology, education, research, and outreach.</p>
                                                    <p className="btn-wrap">https://www.ifaw.org/projects/21st-century-shipping</p>
                                                </div>
                                            </div>
                                            <div className="rs-item">
                                                <div className="rsi-right">
                                                    <h3>Tell your community</h3>
                                                    <p>Share the resources on this page with boaters and your family and community. Together we can stay informed about the science and best management practices to keep whales safe.</p>
                                                    <p className="btn-wrap">https://seereportsave.org/resources</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`menumainexploreHelp ${isVisibleHelp ? 'fadeIn' : 'fadeOut'}`} >
                <div className="mianwrap">
                    <div className="boxesmain">
                        <div className="box1 rs-help-wrap" ref={popupRefHelp}>
                            <div className="closedbtn"><a id="closedbtnid" href="#!" onClick={toggleVisibilityHelp}>X</a></div>
                            <div className="text">
                                <h2>Help</h2>
                            </div>
                            <Accordion defaultActiveKey="1">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Having trouble? Do you have questions?</Accordion.Header>
                                    <Accordion.Body>
                                        <p>Contact us at support@wackypuppy.com</p>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Information about the exhibit</Accordion.Header>
                                    <Accordion.Body>
                                        <ul>
                                            <li>
                                                <p>Ships data is provided by M2 Marine Monitor. Learn more at m2marinemonitor.com</p>
                                            </li>
                                            <li>
                                                <p>Whale sightings data is provided by the Whale Alert app. Learn more at whalealert.org</p>
                                            </li>
                                            <li>
                                                <p>User experience and design by Wackypuppy Design. Learn more at wackypuppy.com</p>
                                            </li>
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footermenuicon" onClick={toggleVisibilityHelp}>
                <div className="mainwarpforicon">
                    <a className="marineics" href="#!"><img src={marineFooterIcon} alt="Marine" className="footerimgcls" /></a>
                    <a className="whaleics" href="#!"><img src={whaleFooterIcon} alt="Whale" className="footerimgclswhale" /></a>
                </div>
                <div className="uptimeMonitoring">site is up</div>
            </div>
        </div>
    );
}

export default Menu;
