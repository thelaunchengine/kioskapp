// Utility function to get speed background color
export const getSpeedColor = (speed) => {
    if (!speed || speed === null || speed === undefined) {
        return 'transparent'; // or a default color
    }
    const speedNum = parseFloat(speed);
    if (speedNum <= 10) {
        return '#11a75c'; // green
    } else if (speedNum > 10 && speedNum <= 12.5) {
        return '#e9b90b'; // yellow
    } else {
        return '#ff3838'; // red
    }
};
