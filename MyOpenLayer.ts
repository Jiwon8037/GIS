import { Feature, Map, Overlay, View } from 'ol';
import { defaults } from 'ol/control';
import { FeatureLike } from 'ol/Feature';
import MultiLineString from 'ol/geom/MultiLineString';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/layer/Vector';
import { transform, fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { Tile } from 'ol/layer';
import XYZ from 'ol/source/XYZ';

interface MarkerOption {
  position: number[];
  image?: {
    opacity?: number | undefined; //투명도
    scale?: number | undefined; //크기
    anchor?: number[] | undefined; //오프셋
    src?: string; //이미지 url
  };
  popupId?: string;
}
class Marker {
  constructor(markerOption: MarkerOption) {
    const source = new VectorSource();
    const geometry = new Point(markerOption.position).transform('EPSG:4326', 'EPSG:3857');
    const feature = new Feature({ geometry });
    feature.setId(markerOption.popupId);
    source.addFeature(feature);

    const image = new Icon(markerOption.image);
    const style = new Style({ image });
    const layer = new Vector({ source, style });

    return layer;
  }
}

interface PhaseOption extends MarkerOption {
  showPhase: any;
  scale?: number;
  popupId?: string;
}
class PhaseMarker {
  constructor(markerOption: PhaseOption) {
    const source = new VectorSource();
    const geometry = new Point(markerOption.position).transform('EPSG:4326', 'EPSG:3857');
    const feature = new Feature({ geometry });
    feature.setId(markerOption.popupId);
    source.addFeature(feature);
    const cycleStyle = new Style({
      image: new Icon({
        opacity: 1,
        scale: markerOption.scale,
        anchor: markerOption.image?.anchor,
        rotation: markerOption.showPhase.degree * (Math.PI / 180),
        src: '/marker/phaseIcon/cycle.png',
      }),
      zIndex: 10,
    });
    const aRingStyle = new Style({
      image: new Icon({
        opacity: 1,
        scale: markerOption.scale,
        anchor: markerOption.image?.anchor,
        rotation: markerOption.showPhase.degree * (Math.PI / 180),
        src: `/marker/phaseIcon/72px/${markerOption.showPhase.ringA.arrow_image}`,
      }),
      zIndex: 10,
    });
    const bRingStyle = new Style({
      image: new Icon({
        opacity: 1,
        scale: markerOption.scale,
        anchor: markerOption.image?.anchor,
        rotation: markerOption.showPhase.degree * (Math.PI / 180),
        src: `/marker/phaseIcon/72px/${markerOption.showPhase.ringB.arrow_image}`,
      }),
      zIndex: 10,
    });
    const style = [cycleStyle, aRingStyle, bRingStyle];
    const layer = new Vector({ source, style });
    // style: (feature, resolution) => {
    //   return [cycleStyle, aRingStyle, bRingStyle].map(markerStyle => {
    //       markerStyle.getImage().setScale(0.5 / (resolution*3.5 / 10));
    //       return markerStyle;
    //   })
    // },
    return layer;
  }
}

interface LineOption {
  points: string[][];
  color: string;
  width: number;
  zoom?: boolean;
}
class LineString {
  constructor(lineOption: LineOption) {
    const points = lineOption.points.map((item) => transform([parseFloat(item[1]), parseFloat(item[0])], 'EPSG:4326', 'EPSG:3857'));
    const source = new VectorSource({});
    const geometry = new MultiLineString([points]);
    const feature = new Feature({ geometry });
    source.addFeature(feature);

    const stroke = new Stroke({ color: lineOption.color, width: lineOption.width });
    const style = new Style({ stroke });
    const zoomStyle = (feature: FeatureLike, resolution: number) =>
      new Style({
        stroke: new Stroke({
          color: lineOption.color,
          width: lineOption.width * ((1 / resolution) * 4),
        }),
      });

    const layer = new VectorLayer({
      source,
      style: lineOption.zoom ? zoomStyle : style,
    });

    return layer;
  }
}

interface MapOption {
  target: string | HTMLElement;
  center: number[];
  dragAndDrop: boolean;
  markerPopup: boolean;
  zoom: {
    level: number;
    min: number;
    max: number;
  };
  extent?: number[];
}
class MyMap {
  constructor(mapOption: MapOption) {
    const popup = new Overlay({});
    const map = new Map({
      controls: defaults({ zoom: false, rotate: false }).extend([]),
      layers: [
        new Tile({
          source: new XYZ({
            url: '/test/Tile/{z}/{x}/{y}.png',
          }),
        }),
      ],
      target: mapOption.target,
      view: new View({
        projection: 'EPSG:3857',
        center: fromLonLat(mapOption.center, 'EPSG:3857'),
        zoom: mapOption.zoom.level,
        minZoom: mapOption.zoom.min,
        maxZoom: mapOption.zoom.max,
        extent: mapOption.extent, //범위제한
      }),
      interactions: !mapOption.dragAndDrop ? [] : undefined,
      overlays: mapOption.markerPopup ? [popup] : undefined,
    });
    map.on('singleclick', function (e) {
      // Check if a marker was clicked
      const feature = map.forEachFeatureAtPixel(e.pixel, (feature) => feature);
      if (feature) {
        // Get the clicked marker's coordinates
        const point = feature.getGeometry() as Point;
        const coordinates = point.getCoordinates();

        const locationName = String(feature.getId() || '');
        const popupHTML = `<h4 style="
            background: #293042; 
            padding: 6px; 
            border: 1px solid; 
            border-radius: 10px;"
          >
            <a href="/monitoring/intersection/${Number(locationName.split('.')[0]) - 1}"
              style=
              "text-decoration: none;
              color: white;"
            >
              ${locationName}
            </a>
          </h4>`;
        const div = document.createElement('div');
        div.innerHTML = locationName ? popupHTML : '';
        popup.setElement(div);
        popup.setPosition(coordinates);
        popup.setOffset([0, -25]); // Set the offset to move the popup above the marker
        popup.setPositioning('bottom-center'); // Set the positioning to align the bottom-center of the popup with the marker
        popup.set('visible', true);
      } else {
        popup.set('visible', false);
      }
    });

    return map;
  }
}

interface openlayerWindow extends Window {
  MyOpenLayer?: any;
}
const openlayerWindow: openlayerWindow = window;
openlayerWindow.MyOpenLayer = {};
openlayerWindow.MyOpenLayer.Marker = Marker;
openlayerWindow.MyOpenLayer.Map = MyMap;
openlayerWindow.MyOpenLayer.LineString = LineString;
openlayerWindow.MyOpenLayer.PhaseMarker = PhaseMarker;
