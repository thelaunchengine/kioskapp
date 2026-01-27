import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster';

const MarkerClusterGroup = createPathComponent(({ children: _c, ...props }, ctx) => {
    const clusterProps = {};
    const clusterEvents = {};

    // Split props and events
    Object.entries(props).forEach(([propName, propValue]) => {
        if (propName.startsWith('on')) {
            clusterEvents[propName] = propValue;
        } else {
            clusterProps[propName] = propValue;
        }
    });

    const instance = new L.MarkerClusterGroup(clusterProps);

    return {
        instance,
        context: { ...ctx, layerContainer: instance },
    };
});

export default MarkerClusterGroup;
