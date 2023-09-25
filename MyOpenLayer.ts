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
import GeoJSON from 'ol/format/GeoJSON';

interface MarkerOption {
  position: number[];
  image?: {
    opacity?: number | undefined; //투명도
    scale?: number | undefined; //크기
    anchor?: number[] | undefined; //오프셋
    src?: string; //이미지 url
  };
  zIndex?: number;
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
    const layer = new Vector({ source, style, zIndex: markerOption.zIndex });

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
    const layer = new Vector({ source, style, zIndex: 10, });
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
  zIndex?: number;
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
      zIndex: lineOption.zIndex,
    });

    return layer;
  }
}

interface MapOption {
  target: string | HTMLElement;
  center: number[];
  dragAndDrop: boolean;
  markerPopup: boolean;
  url: string;
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
            url: mapOption.url + '/Tile/{z}/{x}/{y}.png',
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
        const ip = feature.getProperties();
        const popupHTML = `<div id="location-modal" style="background: #293042; padding: 6px; border: 1px solid; border-radius: 10px;">
        <div style="display: flex;">
          <h4>
            <a href="/monitoring/intersection/?location=${locationName.split('.')[0]}" style="text-decoration: none; color: white;">
              ${locationName}
            </a>
          </h4>
          <h4 style="margin-left: auto; font-size: 18px;"><span id="close-button" style="color: white; cursor: pointer;">×</span></h4>
        </div>
        ${
          ip.북
            ? `<div style="margin-bottom: 5px;">
          <span id="camera-button" style="color: white; font-size: 12px">실시간 영상</span>
            <select id="camera" style="font-size: 12px">
              <option>--</option>
              <option value=${ip.북}>북</option>
              <option value=${ip.동}>동</option>
              <option value=${ip.남}>남</option>
              <option value=${ip.서}>서</option>
            </select>
        </div>
        <div>
          <video id="cctv-video" controls autoplay loop width="640" height="400">
            <source type="video/webm" />
          </video>
        </div>`
            : ''
        }
      </div>`;
        const div = document.createElement('div');
        div.innerHTML = locationName ? popupHTML : '';
        popup.setElement(div);
        popup.setPosition(coordinates);
        popup.setOffset([0, -25]); // Set the offset to move the popup above the marker
        popup.setPositioning('bottom-center'); // Set the positioning to align the bottom-center of the popup with the marker
        popup.set('visible', true);
        document.getElementById('close-button')?.addEventListener('click', () => {
          div.remove();
        });
        document.getElementById('camera')?.addEventListener('change', (e) => {
          const video = document.getElementById('cctv-video') as HTMLVideoElement;
          const ip = (e.currentTarget as HTMLSelectElement).value;
          video.src = `${process.env.CCTV_URL}/streaming?ip=${ip}`;
        });
      } else {
        popup.set('visible', false);
      }
    });
    return map;
  }
}

interface ViewOption {
  center: number[];
  zoom: number;
  extent?: number[];
}
class MyView {
  constructor(option: ViewOption) {
    const view = new View({
      projection: 'EPSG:3857',
      center: fromLonLat(option.center, 'EPSG:3857'),
      zoom: option.zoom,
      extent: option.extent, //범위제한
    })
    return view;
  }
}

interface LinkOption {
  geoJson: any;
  trafficData: {
    roadName: string;
    linkId: number;
    speed: string;
  }[];
}
class LinkLayer {
  constructor(option: LinkOption) {
    const feature = new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(option.geoJson);
    const smoothSource = new VectorSource();
    const slowSource = new VectorSource();
    const delaySource = new VectorSource();

    //도로등급(고속 101, 국도 102, 103, 104, 105, 108, 지방도 106, 107) 별 링크아이디분류
    const roadRankFilter = (rank: string[]): number[] => feature.filter((el) => rank.includes(el.getProperties().ROAD_RANK)).map((el) => el.getProperties().LINK_ID);
    const expresswayFeatures: number[] = roadRankFilter(['101']);
    const nationalHighwayFeatures: number[] = roadRankFilter(['102', '103', '104', '105', '108']);
    const localwayFeatures: number[] = roadRankFilter(['106', '107']);

    //도로등급별 교통데이터분류
    const expresswayData = option.trafficData.filter((el) => expresswayFeatures.includes(el.linkId));
    const nationalHighwayData = option.trafficData.filter((el) => nationalHighwayFeatures.includes(el.linkId));
    const localwayData = option.trafficData.filter((el) => localwayFeatures.includes(el.linkId));

    //등급별 속도
    const expressSmooth = expresswayData.filter((el) => Number(el.speed) > 80).map((el) => el.linkId);
    const expressSlow = expresswayData.filter((el) => 40 < Number(el.speed) && Number(el.speed) <= 80).map((el) => el.linkId);
    const expressDelay = expresswayData.filter((el) => Number(el.speed) <= 40).map((el) => el.linkId);

    const nationalSmooth = nationalHighwayData.filter((el) => Number(el.speed) > 50).map((el) => el.linkId);
    const nationalSlow = nationalHighwayData.filter((el) => 30 < Number(el.speed) && Number(el.speed) <= 50).map((el) => el.linkId);
    const nationalDelay = nationalHighwayData.filter((el) => Number(el.speed) <= 30).map((el) => el.linkId);

    const localwaySmooth = localwayData.filter((el) => Number(el.speed) > 25).map((el) => el.linkId);
    const localwaySlow = localwayData.filter((el) => 15 < Number(el.speed) && Number(el.speed) <= 25).map((el) => el.linkId);
    const localwayDelay = localwayData.filter((el) => Number(el.speed) <= 15).map((el) => el.linkId);

    //색상처리
    const smooth = [...expressSmooth, ...nationalSmooth, ...localwaySmooth];
    const slow = [...expressSlow, ...nationalSlow, ...localwaySlow];
    const delay = [...expressDelay, ...nationalDelay, ...localwayDelay];

    const green = feature.filter((el) => smooth.includes(el.getProperties().LINK_ID));
    const orange = feature.filter((el) => slow.includes(el.getProperties().LINK_ID));
    const red = feature.filter((el) => delay.includes(el.getProperties().LINK_ID));

    smoothSource.addFeatures(green);
    slowSource.addFeatures(orange);
    delaySource.addFeatures(red);

    const setStlye = (color: string) => (feature: any, resolution: number) =>
      new Style({
        stroke: new Stroke({
          color,
          width: 1 * ((1 / resolution) * 4) + 0.5,
        }),
      });
    const layer1 = new VectorLayer({ source: smoothSource, style: setStlye('green'), zIndex: 0 });
    const layer2 = new VectorLayer({ source: slowSource, style: setStlye('orange'), zIndex: 0 });
    const layer3 = new VectorLayer({ source: delaySource, style: setStlye('red'), zIndex: 0 });
    return [layer1, layer2, layer3];
  }
}

declare global {
  interface Window {
    MyOpenLayer: any;
  }
}

window.MyOpenLayer = {
  Marker,
  Map: MyMap,
  LineString,
  PhaseMarker,
  View: MyView,
  Link: LinkLayer,
};
