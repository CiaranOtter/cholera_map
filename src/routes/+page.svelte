<script>

    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import {  province_locations } from '$data/province_locations.js'
    import { provinces } from '$data/province_lines_geojson.js';
    import * as d3 from 'd3';
    
    
     
    export let data;
    let max = d3.max(data.data, d => {
        if (d.name != "Total") return +d.Cases
    }); 
    let map_data = data.data.map(a => {
        let name = a.name;
        let cases = a.Cases;
        let deaths = a.Deaths;

        let lat = province_locations[name].lat;
        let lng = province_locations[name].lng;
        return {name, cases, deaths, lat, lng}
    });

    console.log(map_data)

    let color = d3.scaleLinear()
        .domain([0, max])
        .range(["#064C8D", "#FC7A57"]);


    let Total_el = data.data.filter(a => a.name == "Total")[0];
    map_data = map_data.filter(a => a.name != "Total");
    
    // console.log(provinces)


    console.log(max);
    let mapElement;
    let map;

    let chart;

    let width = 200;

    onMount(async () => {

        const gen_tt = (data, heading = false) => {

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
                // attributionControl: false,
                zoomSnap: 0.1,
                zoomControl:false, 
                dragging: false,
                closePopupOnClick: false, 
                boxZoom: false,
                trackResize: true
            }).setView([-28.2921561,24.9005021],5.7);

            let provinceLines = L.geoJSON(provinces, {
                style: function(feature) {

                    let name = feature.properties.ADM1_EN;
                    if (name == "Nothern Cape") {
                        name = "Northern Cape"
                    }
                    let data = map_data.filter(a => {
                            return a.name == name;
                    });

                    return {
                        color: (+data[0].cases > 0 ) ? '#ffffff' : "#e0e0e0",
                        weight: 1,
                        // opacity: 0.8,
                        fillOpacity: 1,
                        fillColor: (+data[0].cases > 0 ) ? "#064C8D" : "#ffffff"
                    }
                },
                onEachFeature: (feature, layer) => {

                    console.log(feature)

                    
                    
                    let name = feature.properties.ADM1_EN;
                    if (name == "Nothern Cape") {
                        name = "Northern Cape"
                    }
                    let offset = [0,0];
                    switch(name) {
                        case "Western Cape":
                            offset = [40, -45]
                            break;
                        case "North West":
                            offset = [-20, -15] 
                            break;
                        case "Mpumalanga":
                            offset = [45, 20]
                            break;
                        case "KwaZulu-Natal":
                            offset = [25, 20] 
                            break;
                    } 
                    let data = map_data.filter(a => {
                            return a.name == name;
                    });

                    let content = gen_tt(data[0]);
                    // feature.setStyle()
                    layer.bindTooltip(
                        content,
                     {
                        direction: 'center',
                        permanent: true,
                        color: '#000',
                        weight: 1,
                        className: 'box-thing',
                        offset: offset
                    })
                    
                    // layer.on('mouseover', (e) => {

                        
                    //     console.log(feature)

                    //     console.log("layer is: ", layer._tooltip);

                    //     content = gen_tt(data[0]);

                        

                    // });
                    // layer.on('mouseout', (e) => {
                    //     layer.setStyle({
                    //         fillColor: '#8C8C8C'
                    //     })
                    // })
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
       height: 100%;
       width: 100%
    }

    :global(.leaflet-container) {
        /* background: #F5F5F5 */
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
        font-size: 1.25rem;
        margin: auto;
        width: fit-content;
        font-family: 'Roboto', sans-serif;
    }

    :global(.tt-text) {
        /* color: grey; */
        font-family: 'Roboto', sans-serif;
        font-weight: 400;
        font-size: 1rem;
        margin: auto;
        width:  fit-content;
        line-height: 20px;
        
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

    :global(.tt-highlight) {
        color: #000;
        font-weight: 700;
        font-size: 1.2rem;;
        font-family: 'Roboto', sans-serif;
    }

    :global(.box-thing) {
        background-color: #fffffff0;
        box-shadow: none;
        border: none;
        color: black;
        /* align-self: center; */
        font-weight: 700;
        padding: 5px 10px
    } 

    :global(body) {
        font-family: 'Roboto', sans-serif;
        padding: 0;
        margin: 0;
        height: 680px;
        width: 640px;
    }
</style>