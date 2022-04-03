/* eslint-disable max-len */
function getRandomIntInclusive(min, max) {
  newMin = Math.ceil(min);
  newMax = Math.floor(max);
  return Math.floor(
    Math.random() * (newMax - newMin + 1) + min
  ); // The maximum is inclusive and the minimum is inclusive
}

function resotArrayMake(dataArray) {
  // console.log('fired dataHandler');
  // console.table(dataArray); // this is called "dot notation"
  const range = [...Array(15).keys()];
  const listItems = range.map((item, index) => {
    const restNum = getRandomIntInclusive(0, dataArray.length - 1);
    return dataArray[restNum];
  });

  // console.log(listItems);
  return listItems;
}

// Injection function
function createHtmlList(collection) {
  // console.log('fired HTML creator');
  // console.log('createHtml', collection);
  const targetList = document.querySelector('.resto-list');
  targetList.innerHTML = '';
  collection.forEach((item) => {
    const {name} = item;
    const displayName = name.toLowerCase();
    const injectThisItem = `<li>${displayName}</li> ${item.zip}<br></li>`;
    targetList.innerHTML += injectThisItem;
  });
}

// Map function
function initMap(targetId) {
  const latLong = [38.784, -76.872];
  const map = L.map(targetId).setView(latLong, 17);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
  }).addTo(map);
  return map;
}

function addMapMarkers(map, collection) {
  collection.forEach((item) => {
    const point = item.geocoded_column_1?.coordinates;
    console.log(item.geocoded_column_1?.coordinates);
    L.marker([point[1], point[0]]).addTo(map);
  });
}

// As the last step of your lab, hook this up to index.html
async function mainEvent() { // the async keyword means we can make API requests
  console.log('script loaded'); // This is substituting for a "breakpoint"
  const form = document.querySelector('.food-form');
  const submit = document.querySelector('.submit_button');

  const resto = document.querySelector('#resto_name');
  const zipcode = document.querySelector('#zipcode');
  const map = initMap('map');
  const retrievalVar = 'restaurants';
  submit.style.display = 'none'; // it's better not to display this until the data has loaded

  if (localStorage.getItem(retrievalVar) === undefined) {
    const results = await fetch('https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json'); // This accesses some data from our API
    const arrayFromJson = await results.json(); // This changes it into data we can use - an object
    console.log(arrayFromJson);
    localStorage.setItem(retrievalVar, JSON.stringify(arrayFromJson));
  }

  const storedDataString = localStorage.getItem(retrievalVar);
  const storedDataArray = JSON.parse(storedDataString);
  console.log(storedDataArray);
  // const arrayFromJson = {data: []};

  // This if statement is to prevent a race condition on data load
  if (storedDataArray.length > 0) {
    submit.style.display = 'block';
    // this allows us to change the var to anything we want, but pre-sets it as an array for reasoning
    let currentArray = [];

    resto.addEventListener('input', (event) => {
      if (currentArray.length < 1) { return; }
      console.log(event.target.value);
      console.log(currentArray);
      // console.log(resto.value);
      const restaurants = currentArray.filter((item) => {
        const lowerName = item.name.toLowerCase();
        const lowerValue = event.target.value.toLowerCase();
        return lowerName.includes(lowerValue);
      });
      createHtmlList(restaurants);
    });

    // A filter for zipcode input
    zipcode.addEventListener('input', (event) => {
      if (!currentArray.length) { return; }
      console.log(event.target.value);
      console.log(currentArray);
      // console.log(zipcode.value);
      const zip = currentArray.filter((item) => item.zip.includes(event.target.value));
      createHtmlList(zip);
    });

    form.addEventListener('submit', async (submitEvent) => { // async has to be declared all the way to get an await
      submitEvent.preventDefault(); // This prevents your page from refreshing!
      // console.log('form submission'); // this is substituting for a "breakpoint"
      // arrayFromJson.data - we're accessing a key called 'data' on the returned object
      // it contains all 1,000 records we need
      currentArray = resotArrayMake(storedDataArray);
      console.log(currentArray);
      createHtmlList(currentArray);
      addMapMarkers(map, currentArray);
    });
  }
}

// this actually runs first! It's calling the function above
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests