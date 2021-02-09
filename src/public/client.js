let store = Immutable.Map({
    user: Immutable.Map({
      name: 'Earthling'
    }),
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit'])
  });

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = store.merge(newState);
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    const rovers = state.get('rovers');
    const photos = state.get('photos');

    return `
        <header>
            <h1>Mars Dashboard</h1>
            <p>${Greeting(state.getIn(['user', 'name']))}</p>
        </header>
        <main>
            ${showRovers(rovers)}
            ${photos && showRoverDetails(photos) || ''}
        </main>
        <footer>
            <p class="fine-print">Data Sourced from <a href="https://api.nasa.gov/#browseAPI">NASA API</a>.</p>
        </footer>
    `
}
// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

const handleCardButtonClick = (roverName) => getRoverData(roverName);

// ------------------------------------------------------  COMPONENTS
const Greeting = (name) => {
    if (name) {
        return `
            <p>Welcome, ${name}!</p>
        `
    }

    return `
        <p>Hello!</p>
    `
}

const showRovers = (rovers) => {
    return `
        <div class="cards">
            ${showRoverCard(rovers.get(0))}
            ${showRoverCard(rovers.get(1))}
            ${showRoverCard(rovers.get(2))}
        </div>
    `;  
};

const showRoverCard = (roverName) => {
    return `
            <article class="card">
                <img src="/assets/images/${roverName}.jpg" alt="${roverName} photo">
                <div class="text">
                <h3>${roverName}</h3>
                <button onclick="handleCardButtonClick('${roverName}')">View Info</button>
                </div>
            </article>
    `;  
};  

const showRoverDetails = (photos) => {
    const roverData = photos.find(roverData => roverData.get('rover'));
    return getRoverDetails(roverData, photos);  
};

const getRoverDetails = (roverData, photos) => {
    return `
        <hr />
        <div class="details">
            <h2>${roverData.getIn(['rover', 'name'])} Rover Info</h2>
            <p><strong>Launch Date:</strong> ${roverData.getIn(['rover', 'launch_date'])}</p>
            <p><strong>Landing Date:</strong> ${roverData.getIn(['rover', 'landing_date'])}</p>
            <p><strong>Status:</strong> ${roverData.getIn(['rover', 'status'])}</p>
            <p>Latest Photos taken on Earth Date: ${roverData.get('earth_date')}</p>
        </div>
        <div class="cards">
            ${roverImages(photos)}
        </div>
    `
}  

const roverImages = (photos) => {
    return (photos)
      .slice(0, 30)
      .map(photo => RoverImg(photo.get('img_src'))
      ).reduce((acc, curr) => acc + curr);
  };

const RoverImg = (src) => `
    <article class="card">
        <img src="${src}" alt="Rover photo">
    </article>
`;

// ------------------------------------------------------  API CALLS
const getRoverData = async (roverName) => {
    try {
      await fetch(`http://localhost:3000/rovers/${roverName}`)
        .then(res => res.json())
        .then(data => updateStore(store, data))
    } catch (error) {
      console.log('error:', err);
    }
  };
