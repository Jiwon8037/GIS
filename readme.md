## GIS 서버

---

OpenLayer, vworld map data 기반 GIS 서버.

openlayer 함수 수정 필요 시 MyOpenLayer.ts에서 수정.

---  

1. 타입스크립트 컴파일  
```npm run tsc ```
2. 웹팩으로 빌드  
```npm run build```

타입스크립트 사용 시 선언 추가
```
declare global {
  interface Window {
    MyOpenLayer: any;
  }
}
const { MyOpenLayer } = window;
```

마커 생성 샘플 
```
  const markerLayer = new MyOpenLayer.Marker({
        position: [long, lat],
        zIndex: 2,
        image: {
          src: imageName,
          opacity: 1,
          scale: 0.6,
          anchor: [0.4, 1],
        },
      });
```
