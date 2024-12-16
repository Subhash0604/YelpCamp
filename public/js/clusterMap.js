// maptilersdk.config.apiKey = maptilerApiKey;

// const map = new maptilersdk.Map({
//     container: 'map',
//     style: maptilersdk.MapStyle.BRIGHT,
//     center: [-103.59179687498357, 40.66995747013945],
//     zoom: 3
// });

// map.on('load', function () {
//     map.addSource('campgrounds', {
//         type: 'geojson',
//         data: campgrounds,
//         cluster: true,
//         clusterMaxZoom: 14, // Max zoom to cluster points on
//         clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
//     });

// map.addLayer({
//         id: 'clusters',
//         type: 'circle',
//         source: 'campgrounds',
//         filter: ['has', 'point_count'],
//         paint: {
//             // Use step expressions (https://docs.maptiler.com/gl-style-specification/expressions/#step)
//             // with three steps to implement three types of circles:
//             'circle-color': [
//                 'step',
//                 ['get', 'point_count'],
//                 '#00BCD4',
//                 10,
//                 '#2196F3',
//                 30,
//                 '#3F51B5'
//             ],
//             'circle-radius': [
//                 'step',
//                 ['get', 'point_count'],
//                 15,
//                 10,
//                 20,
//                 30,
//                 25
//             ]
//         }
//     });

// map.addLayer({
//         id: 'cluster-count',
//         type: 'symbol',
//         source: 'campgrounds',
//         filter: ['has', 'point_count'],
//         layout: {
//             'text-field': '{point_count_abbreviated}',
//             'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
//             'text-size': 12
//         }
//     });

// map.addLayer({
//         id: 'unclustered-point',
//         type: 'circle',
//         source: 'campgrounds',
//         filter: ['!', ['has', 'point_count']],
//         paint: {
//             'circle-color': '#11b4da',
//             'circle-radius': 4,
//             'circle-stroke-width': 1,
//             'circle-stroke-color': '#fff'
//         }
//     });

//     // inspect a cluster on click
// map.on('click', 'clusters', async (e) => {
//         const features = map.queryRenderedFeatures(e.point, {
//             layers: ['clusters']
//         });
//         const clusterId = features[0].properties.cluster_id;
//         const source = map.getSource('campgrounds');
//         const zoom = await source.getClusterExpansionZoom(clusterId);
//         map.easeTo({
//             center: features[0].geometry.coordinates,
//             zoom
//         });
//     });

//     // When a click event occurs on a feature in
//     // the unclustered-point layer, open a popup at
//     // the location of the feature, with
//     // description HTML from its properties.
// map.on('click', 'unclustered-point', function (e) {
//         const { popUpMarkup } = e.features[0].properties;
//         const coordinates = e.features[0].geometry.coordinates.slice();

//         // Ensure that if the map is zoomed out such that
//         // multiple copies of the feature are visible, the
//         // popup appears over the copy being pointed to.
//         while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//             coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
//         }

//         new maptilersdk.Popup()
//             .setLngLat(coordinates)
//             .setHTML(popUpMarkup)
//             .addTo(map);
//     });

// map.on('mouseenter', 'clusters', () => {
//         map.getCanvas().style.cursor = 'pointer';
//     });
// map.on('mouseleave', 'clusters', () => {
//         map.getCanvas().style.cursor = '';
//     });
// });



maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
        container: 'map',
        zoom: 0.3,
        center: [0, 20],
        style: maptilersdk.MapStyle.DATAVIZ.DARK
    });

      map.on('load', function () {
        // add a clustered GeoJSON source for a sample set of earthquakes
        map.addSource('campgrounds', {
          'type': 'geojson',
          'data': campgrounds,
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'campgrounds',
          filter: ['has', 'point_count'],
          paint: {
            // Use step expressions (https://docs.maptiler.com/gl-style-specification/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100,
              '#f1f075',
              750,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40
            ]
          }
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'campgrounds',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });

        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'campgrounds',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        // inspect a cluster on click
        map.on('click', 'clusters', async function (e) {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          const clusterId = features[0].properties.cluster_id;
          const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId);
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom
          });
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on('click', 'unclustered-point', function (e) {
          var coordinates = e.features[0].geometry.coordinates.slice();
          var mag = e.features[0].properties.mag;
          var tsunami;

          if (e.features[0].properties.tsunami === 1) {
            tsunami = 'yes';
          } else {
            tsunami = 'no';
          }

          // Ensure that if the map is zoomed out such that
          // multiple copies of the feature are visible, the
          // popup appears over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new maptilersdk.Popup()
            .setLngLat(coordinates)
            .setHTML(
              'magnitude: ' + mag + '<br>Was there a tsunami?: ' + tsunami
            )
            .addTo(map);
        });

        map.on('mouseenter', 'clusters', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', function () {
          map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'unclustered-point', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point', function () {
          map.getCanvas().style.cursor = '';
        });
      });