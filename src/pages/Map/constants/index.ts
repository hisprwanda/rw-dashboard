import osm from '../../../assets/osm.png';
import osmlight from '../../../assets/osmlight.png';

export const BASEMAPS = {
  'osm-light': {
    imgUrl: osmlight,
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    name: 'OSM Light',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  'osm-detailed': {
    imgUrl: osm,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    name: 'OSM Detailed',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};