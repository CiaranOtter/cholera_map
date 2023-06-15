<script>

    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import {  province_locations } from '$data/province_locations.js'
    import { provinces } from '$data/province_lines_geojson.js';
    import { get } from 'svelte/store';
    
    export let data;
    console.log(data.data);
    let map_data = data.data.map(a => {
        let name = a.name;
        let cases = a.Cases;
        let deaths = a.Deaths;
        let lat = province_locations[name].lat;
        let lng = province_locations[name].lng;
        return {name, cases, deaths, lat, lng}
    });

    let Total_el = data.data.filter(a => a.name == "Total")[0];
    map_data = map_data.filter(a => a.name != "Total");
    
    console.log(map_data);
    // console.log(provinces)

    let mapElement;
    let map;

    let chart;

    let width = 200;

    onMount(async () => {

        const gen_tt = (data, heading = false) => {
            console.log(data)

            let tt = "<div class='tooltip'>";
            tt += `<div class='tt-title'>${data.name}</div>`;
            if (!heading) {
                tt += `<div class='tt-text'>Cases: <span class='tt-highlight'>${data.cases}</span></div>`;
                tt += `<div class='tt-text'>Deaths: <span class='tt-highlight'>${data.deaths}</span></div>`;
            }
            tt += "</div>";

            return tt;
        }
        if (browser) {
            const leaflet = await import('leaflet');

            map = leaflet.map(mapElement, {
                doubleClickZoom: false,
                scrollWheelZoom: false,
                attributionControl: false,
                zoomControl:false, 
                dragging: false,
                closePopupOnClick: false, 
                boxZoom: false,
            }).setView([-29.2921561,24.4095021],6);

            let provinceLines = L.geoJSON(provinces, {
                style: function(feature) {
                    return {
                        color: '#8C8C8C',
                        weight: 1,
                        opacity: 0.8,
                        fillOpacity: 0,
                        fillColor: '#000'
                    }
                },
                onEachFeature: (feature, layer) => {
                    console.log(feature);
                    let name = feature.properties.ADM1_EN;
                    if (name == "Nothern Cape") {
                        name = "Northern Cape"
                    }
                    let data = map_data.filter(a => {
                            console.log(a.name, name)
                            return a.name == name;
                    });

                    console.log(data)
                    let content = gen_tt(data[0], true);
                    layer.bindTooltip(
                        content,
                     {
                        direction: 'center',
                        opacity: 0.8,
                        permanent: true,
                        color: '#000',
                        weight: 1,
                        opacity: 1,
                        fillColor: '#000',
                        className: 'box-thing',
                    })

                    layer.on('mouseover', (e) => {
                        console.log(feature)

                        console.log("layer is: ", layer._tooltip);

                        content = gen_tt(data[0]);

                        layer.setStyle({
                            color: '#064C8D',
                        });

                        layer.bindTooltip(
                        gen_tt(data[0]),
                     {
                        direction: 'center',
                        // opacity: 0.8,
                        permanent: true,
                        color: '#000',
                        weight: 1,
                        opacity: 1,
                        fillColor: '#000',
                        className: 'box-thing',
                    })
                    });
                    layer.on('mouseout', (e) => {
                        layer.bindTooltip(
                        gen_tt(data[0], true),
                     {
                        direction: 'center',
                        opacity: 0.8,
                        permanent: true,
                        color: '#000',
                        weight: 1,
                        fillColor: '#000',
                        className: 'box-thing',
                    })
                        layer.setStyle({
                            color: '#8C8C8C'
                        })
                    })
                }
            })

            provinceLines.addTo(map);

        }
    })


    onDestroy(async () => {
        if(map) {
            map.remove();
        }
    });

  
    

</script>
    <div id="map" class="chart" bind:this={mapElement} >
        <div class="title">Cholera in South Africa</div>
    <div class="subtitle">Total cases: <span class="highlight">{Total_el.Cases}</span>  Deaths: <span class="highlight">{Total_el.Deaths}</span></div>
    
    </div>

<style>
    @import 'leaflet/dist/leaflet.css';
    #map {
        height: 100vh;
       width: 100%;
    }

    :global(.leaflet-container) {
        background: #FFFFFF
    }

    .highlight {
        color: #064C8D;
        font-weight: 700;
        font-size: 1.5rem;
        padding: 0px 5px;

    }

    .title-container {
        z-index: 500;
        padding: 10px;
    }

    :global(.tt-title){
        font-weight: 700;
        font-size: 1rem;
        color: #064C8D;
        margin: auto;
        width: fit-content
    }

    :global(.tt-text) {
        color: gray;
        margin: auto;
        width:  fit-content;
        
    }

    .title {
        text-align: center;
        /* color: #064C8D; */
        font-weight: 700;
        font-size: 2rem;
    }

    .subtitle {
        text-align: center;
        font-size: 1.2rem;
        font-weight: 400;
        display: flex;
        align-items: center; /* Vertical center alignment */
        justify-content: center;
        color: gray;
    }

    :global(.leaflet-control-attribution) { 
    position: fixed; 
    right: 0px; 
    bottom: 0px;
    width: 100%;
    background: none !important;
    text-align: right !important;
    }
    :global(.tt-title) { 
        font-weight: 700; 
        color: "#000";
        /* opacity: 0.2; */
        /* opacity: 0; */
    }

    :global(.tt-highlight) {
        color: #000;
        padding: 0px 5px;
    }

    :global(.box-thing) {
        background-color: #f5f5f5B0;
        box-shadow: none;
        color: black;
        /* align-self: center; */
        font-weight: 700;
        padding: 5px 10px
    } 

    :global(body) {
        padding: 0;
        margin: 0;
    }
</style>