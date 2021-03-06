import CONFIG from 'config/common'
import uuid from 'uuid/v4'
import bbox from '@turf/bbox'

// This is mostly copied from 'lib/helpers/basic_map'
// It's been duplicated in order to experiment with a new approach to composing maps

export function render_map(map_container_id) {
  // TODO: Fix this
  // Need to require, an import will break the tests....
  const mapboxgl = require('mapbox-gl')

  return new Promise((resolve) => {

    const map = new mapboxgl.Map({
      container: map_container_id,
      style: CONFIG.basemap.default.style,
      center: CONFIG.basemap.default.coords,
      zoom: CONFIG.basemap.default.zoom
    })
    
    // disable zooming with mouse scroll. now you can scroll
    map.scrollZoom.disable()
    
    map.on('error', (e) => {
      console.warn('🗺 Basic map error:', e)
      if (e.error) console.log(e.error)
      // TODO: handle errors better
    })
    
    map.addControl(new mapboxgl.NavigationControl())
    
    map.on('load', () => {
      resolve(map)  
    }) 
  })
}

export function remove_map(map) {
  map.remove()
}

export function add_polygon_layer(map, feature_collection) {
  // Could check if feature collection has points, or polygons
  // Then we only need one function
  const id = uuid()

  map.addLayer({
    id: id,
    type: 'fill',
    source: {
      type: 'geojson',
      data: feature_collection
    },
    paint: {
      'fill-opacity': 0.2,
      'fill-color': [
        'match',
          ['get', 'status'],
          'active', '#F44336',
          'inactive', '#FFB300',
          'cleared', '#4CAF50',
          /* other */ '#ccc'
      ]
    }
  })
  return id
}

export function add_points_layer(map, feature_collection) {
  const id = uuid()

  map.addLayer({
    id: id,
    type: 'circle',
    source: {
      type: 'geojson',
      data: feature_collection
    },
    paint: {
      'circle-opacity': 0.7,
    }
  })
  return id
}

export function update_layer(map, layer_id, feature_collection) {
  map.getSource(layer_id).setData(feature_collection);
}

export function add_click_handler(map, layer_id, click_handler) {
  // wrapping the handler makes for a simpler api
  // it is however a bit confusing as 
  // you will have to call remote_click_handler with the result of add_click_handler
  // and not the original click_handler passed in
  // we don't have to worry about for now though.
  const handler = function (e) {
    const feature = e.features[0]
    if (feature) {
      click_handler(feature)
    }
  }

  map.on('click', layer_id, handler);

  return handler
}

// will be nice to have later
export function remove_click_handler(map, layer_id, click_handler) {
  map.off('click', layer_id, click_handler);
}

export function zoom_to_feature(map, feature) {
  // feature can be a geojson feature or feature_collection, bboz takes any valid geojson
  const bounding_box = bbox(feature)
  map.fitBounds(bounding_box, { padding: 20 })
}