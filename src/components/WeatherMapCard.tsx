import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { fetchGeocode } from "../lib/api";
import { Colors } from "../theme/colors";
import { CONFIG } from "../lib/config";
import { Lang } from "../lib/i18n";

interface Props {
  city:    string;
  country: string;
  lang:    Lang;
}

type RadarLabels = {
  radar: string; sat: string; temp: string; wind: string; clouds: string; pressure: string; precip: string;
  legW: string; legM: string; legH: string; legS: string; legX: string;
};

const RADAR_LABELS: Record<Lang, RadarLabels> = {
  en: { radar: "Radar", sat: "Satellite", temp: "Temp",     wind: "Wind",   clouds: "Clouds", pressure: "Pressure", precip: "Precip",
        legW: "Light", legM: "Moderate", legH: "Heavy", legS: "Severe", legX: "Extreme" },
  az: { radar: "Radar", sat: "Uydu",      temp: "Temp",     wind: "Külək",  clouds: "Bulud",  pressure: "Təzyiq",   precip: "Yağıntı",
        legW: "Zəif", legM: "Orta", legH: "Güclü", legS: "Şiddətli", legX: "Həddindən artıq" },
  tr: { radar: "Radar", sat: "Uydu",      temp: "Sıcaklık", wind: "Rüzgar", clouds: "Bulut",  pressure: "Basınç",   precip: "Yağış",
        legW: "Zayıf", legM: "Orta", legH: "Güçlü", legS: "Şiddetli", legX: "Aşırı" },
  ru: { radar: "Радар", sat: "Спутник",   temp: "Темп.",    wind: "Ветер",  clouds: "Облака", pressure: "Давление", precip: "Осадки",
        legW: "Слабый", legM: "Умеренный", legH: "Сильный", legS: "Оч. сильный", legX: "Экстрим" },
};

function buildHtml(lat: number, lon: number, city: string, owmKey: string, lang: Lang): string {
  const L = RADAR_LABELS[lang] ?? RADAR_LABELS.en;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html, body, #map { width:100%; height:100%; background:#080d22; }
  body { font-family:-apple-system,system-ui,sans-serif; overflow:hidden; }
  .leaflet-control-attribution, .leaflet-control-zoom { display:none !important; }
  .leaflet-container { background:#080d22 !important; }

  #header {
    position:absolute; top:0; left:0; right:0; z-index:900;
    padding:10px 14px; pointer-events:none;
    background:linear-gradient(to bottom,rgba(8,13,34,0.82) 0%,transparent 100%);
  }
  #header .t1 { font-size:10px; color:rgba(238,242,255,0.55); text-transform:uppercase; letter-spacing:1.5px; font-weight:700; }
  #header .t2 { font-size:12px; color:rgba(238,242,255,0.75); font-weight:600; margin-top:2px; }

  #anim {
    position:absolute; top:12px; right:12px; z-index:900;
    display:flex; align-items:center; gap:6px;
    background:rgba(8,13,34,0.78); border:1px solid rgba(255,255,255,0.12);
    border-radius:12px; padding:5px 9px;
  }
  #playBtn {
    width:24px; height:24px; border-radius:12px; border:none;
    background:#4b8eef; color:#fff; font-size:12px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
  }
  #frameLbl { font-size:10px; color:rgba(255,255,255,0.6); min-width:28px; }

  #layers {
    position:absolute; bottom:42px; left:0; right:0; z-index:900;
    display:flex; gap:6px; padding:0 10px; overflow-x:auto; -webkit-overflow-scrolling:touch;
  }
  #layers::-webkit-scrollbar { display:none; }
  .lbtn {
    flex:0 0 auto; display:flex; align-items:center; gap:5px;
    padding:7px 13px; border-radius:20px; cursor:pointer; white-space:nowrap;
    background:rgba(8,13,34,0.78); border:1px solid rgba(255,255,255,0.10);
    color:rgba(238,242,255,0.6); font-size:12px; font-weight:600;
  }
  .lbtn.active { background:#4b8eef; border-color:#4b8eef; color:#fff; }

  #legend {
    position:absolute; bottom:10px; left:10px; z-index:900;
    display:flex; align-items:center; gap:7px; pointer-events:none;
    background:rgba(8,13,34,0.80); border:1px solid rgba(255,255,255,0.10);
    border-radius:10px; padding:5px 9px;
  }
  #legend.hidden { display:none; }
  .lg { display:flex; flex-direction:column; align-items:center; gap:2px; }
  .lg i { width:12px; height:5px; border-radius:3px; display:block; }
  .lg span { font-size:7px; color:rgba(238,242,255,0.5); font-weight:600; white-space:nowrap; }

  .city-pin {
    background:linear-gradient(135deg,#4b8eef,#818cf8); color:#fff;
    padding:3px 9px; border-radius:20px; font-size:11px; font-weight:700;
    white-space:nowrap; box-shadow:0 2px 12px rgba(75,142,239,0.55);
  }
</style>
</head>
<body>
<div id="map"></div>

<div id="header">
  <div class="t1" id="layerName">${L.radar}</div>
  <div class="t2" id="timeLbl"></div>
</div>

<div id="anim">
  <button id="playBtn">▶</button>
  <span id="frameLbl">--</span>
</div>

<div id="layers"></div>

<div id="legend">
  <div class="lg"><i style="background:#00d4ff"></i><span>${L.legW}</span></div>
  <div class="lg"><i style="background:#00c853"></i><span>${L.legM}</span></div>
  <div class="lg"><i style="background:#ffd600"></i><span>${L.legH}</span></div>
  <div class="lg"><i style="background:#ff6d00"></i><span>${L.legS}</span></div>
  <div class="lg"><i style="background:#d50000"></i><span>${L.legX}</span></div>
</div>

<script>
  var OWM_KEY = "${owmKey}";
  var LAT = ${lat}, LON = ${lon};

  var map = L.map('map', { zoomControl:false, attributionControl:false, scrollWheelZoom:true, minZoom:1, maxZoom:10 })
            .setView([LAT, LON], 5);

  // Tünd əsas xəritə
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { subdomains:'abcd', maxZoom:19 }).addTo(map);

  // Şəhər markeri
  L.marker([LAT, LON], {
    icon: L.divIcon({ className:'', html:'<div class="city-pin">📍 ${city}</div>', iconSize:[90,24], iconAnchor:[45,12] })
  }).addTo(map);

  var LAYERS = [
    { id:'radar',        label:'${L.radar}',    anim:true,  legend:true },
    { id:'satellite',    label:'${L.sat}',      anim:false, legend:false },
    { id:'temp',         label:'${L.temp}',     owm:'temp_new',          legend:false },
    { id:'wind',         label:'${L.wind}',     owm:'wind_new',          legend:false },
    { id:'clouds',       label:'${L.clouds}',   owm:'clouds_new',        legend:false },
    { id:'pressure',     label:'${L.pressure}', owm:'pressure_new',      legend:false },
    { id:'precipitation',label:'${L.precip}',   owm:'precipitation_new', legend:true },
  ];

  // NASA GIBS — dünənki true-color peyk (tam qlobal örtük üçün)
  var gd = new Date(Date.now() - 86400000);
  var GIBS_DATE = gd.getUTCFullYear() + '-' + pad2(gd.getUTCMonth()+1) + '-' + pad2(gd.getUTCDate());
  function pad2(n){ return (n<10?'0':'')+n; }

  var radarFrames = [], radarIdx = 0;
  var active = 'radar';
  var overlay = null;
  var playing = false;
  var timer = null;

  function pad(n){ return (n<10?'0':'')+n; }
  function timeLabel(ts){ var d=new Date(ts*1000); return pad(d.getHours())+':'+pad(d.getMinutes()); }

  function buildButtons(){
    var c = document.getElementById('layers');
    LAYERS.forEach(function(l){
      var b = document.createElement('div');
      b.className = 'lbtn' + (l.id===active?' active':'');
      b.textContent = l.label;
      b.onclick = function(){ setLayer(l.id); };
      b.setAttribute('data-id', l.id);
      c.appendChild(b);
    });
  }

  function setActiveButton(){
    document.querySelectorAll('.lbtn').forEach(function(b){
      b.className = 'lbtn' + (b.getAttribute('data-id')===active?' active':'');
    });
  }

  function currentTileUrl(){
    var l = LAYERS.find(function(x){ return x.id===active; });
    if(active==='radar'){
      var f = radarFrames[radarIdx];
      return f ? 'https://tilecache.rainviewer.com'+f.path+'/256/{z}/{x}/{y}/2/1_1.png' : null;
    }
    if(active==='satellite'){
      // NASA GIBS VIIRS true-color (GIBS tile sırası z/y/x)
      return 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/'
             + GIBS_DATE + '/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';
    }
    if(l.owm){
      return 'https://tile.openweathermap.org/map/'+l.owm+'/{z}/{x}/{y}.png?appid='+OWM_KEY;
    }
    return null;
  }

  function updateOverlay(){
    var url = currentTileUrl();
    if(overlay){ map.removeLayer(overlay); overlay = null; }
    if(url){
      var op = active==='satellite' ? 1.0 : 0.8;
      var mz = active==='satellite' ? 9 : 19;
      overlay = L.tileLayer(url, { opacity:op, maxZoom:mz, maxNativeZoom: active==='satellite' ? 9 : 19 });
      overlay.addTo(map);
    }
    // Vaxt / tarix
    var lbl = '';
    if(active==='radar' && radarFrames[radarIdx]) lbl = timeLabel(radarFrames[radarIdx].time);
    if(active==='satellite') lbl = GIBS_DATE;
    document.getElementById('timeLbl').textContent = lbl;
  }

  function updateFrameLabel(){
    var total = active==='radar' ? radarFrames.length : 0;
    var cur = radarIdx;
    document.getElementById('frameLbl').textContent = total ? (cur+1)+'/'+total : '--';
    var animBox = document.getElementById('anim');
    var hasAnim = active==='radar' && total>0;
    animBox.style.display = hasAnim ? 'flex' : 'none';
  }

  function setLayer(id){
    active = id;
    setActiveButton();
    var l = LAYERS.find(function(x){ return x.id===active; });
    document.getElementById('layerName').textContent = l.label;
    document.getElementById('legend').className = l.legend ? '' : 'hidden';
    stop();
    updateOverlay();
    updateFrameLabel();
  }

  function play(){
    if(playing) return;
    playing = true;
    document.getElementById('playBtn').textContent = '❚❚';
    timer = setInterval(function(){
      if(active==='radar'){ radarIdx = (radarIdx+1) % (radarFrames.length||1); }
      updateOverlay();
      updateFrameLabel();
    }, 500);
  }
  function stop(){
    playing = false;
    document.getElementById('playBtn').textContent = '▶';
    if(timer){ clearInterval(timer); timer = null; }
  }
  document.getElementById('playBtn').onclick = function(){ playing ? stop() : play(); };

  // RainViewer frames
  fetch('https://api.rainviewer.com/public/weather-maps.json')
    .then(function(r){ return r.json(); })
    .then(function(d){
      var past = (d.radar && d.radar.past) || [];
      var now  = (d.radar && d.radar.nowcast) || [];
      radarFrames = past.concat(now);
      radarIdx = past.length>0 ? past.length-1 : 0;
      updateOverlay();
      updateFrameLabel();
    })
    .catch(function(){});

  buildButtons();
  setLayer('radar');
</script>
</body>
</html>`;
}

export default function WeatherMapCard({ city, country, lang }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGeocode(city).then((r: any[]) => {
      if (cancelled || !r?.length) return;
      setCoords({ lat: r[0].lat ?? 40, lon: r[0].lon ?? 49 });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [city]);

  return (
    <View style={styles.card}>
      {!coords ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <WebView
          style={styles.webview}
          originWhitelist={["*"]}
          source={{ html: buildHtml(coords.lat, coords.lon, city, CONFIG.owmApiKey, lang) }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          androidLayerType="hardware"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card:    { height: 320, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 20, overflow: "hidden", marginBottom: 14, backgroundColor: "rgba(8,13,34,0.6)" },
  loader:  { flex: 1, justifyContent: "center", alignItems: "center" },
  webview: { flex: 1, backgroundColor: "transparent" },
});
