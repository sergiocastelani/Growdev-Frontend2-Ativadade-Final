let episodes = JSON.parse(sessionStorage.getItem('episodes'));
let locations = JSON.parse(sessionStorage.getItem('locations'));

async function fillEpisodes()
{
  if (! episodes)
  {
    episodes = {};
    let count = 0;

    let link = "https://rickandmortyapi.com/api/episode?page=1";
    while (link !== null)
    {
      let response = await axios.get(link);
      response.data.results.forEach(episode => {
        episodes[episode.id] = episode.name;
        ++count;
      });
      link = response.data.info.next;
    }

    episodes.size = count;
    sessionStorage.setItem('episodes', JSON.stringify(episodes));
  }

  document.getElementById('counterEpisodes').innerHTML = "EPISÓDIOS: " + episodes.size;
}

async function fillLocations()
{
  if (! locations)
  {
    locations = {};
    let count = 0;

    let link = "https://rickandmortyapi.com/api/location?page=1";
    while (link !== null)
    {
      let response = await axios.get(link);
      response.data.results.forEach(location => {
        locations[location.id] = location.name;
        ++count;
      });
      link = response.data.info.next;
    }

    locations.size = count;
    sessionStorage.setItem('locations', JSON.stringify(locations));
  }

  document.getElementById('counterLocations').innerHTML = "LOCALIZAÇÕES: " + locations.size;
}

function fillPagination(apiInfo)
{
  const nextPage = apiInfo.next;
  const prevPage = apiInfo.prev;

  const nextPageNumberMatch = nextPage?.match(/page=(\d+)/);
  const currentPageNumber = nextPageNumberMatch ? parseInt(nextPageNumberMatch[1]) - 1 : 1;

  let paginationContent = "Páginas: ";
  let currentURL = new URL(window.location.href);

  if (prevPage)
  {
    currentURL.searchParams.set('page', currentPageNumber - 1);
    paginationContent += `<a href="${currentURL.href}"> &lt; ${currentPageNumber - 1} </a>`;
  }
  
  paginationContent += ` &nbsp;&nbsp; ${currentPageNumber} &nbsp;&nbsp; `;

  if(nextPage)
  {
    currentURL.searchParams.set('page', currentPageNumber + 1);
    paginationContent += `<a href="${currentURL.href}"> ${currentPageNumber + 1} &gt; </a>`;
  }

  document.getElementById('pagination').innerHTML = paginationContent;
}

await fillEpisodes();
await fillLocations();

//Get characters

let currentURL = new URL(window.location.href);
let apiURL = new URL("https://rickandmortyapi.com/api/character");
apiURL.searchParams.set('page', currentURL.searchParams.get('page') || 1);
const searchValue = currentURL.searchParams.get('search');
if (searchValue)
{
  apiURL.searchParams.set('name', searchValue);
  document.getElementById('search').value = searchValue;
}

axios.get(apiURL.href)
  .then(function(response) {
    let cards = "";
    let count = 0;
    let total = response.data.results.length;

    response.data.results.forEach(character => {
      let lastEpisodeId = character.episode.length ? character.episode.pop().split('/').pop() : null;
      let lastEpisode = lastEpisodeId ? episodes[lastEpisodeId] : 'Unknown';

      let statusColor = '#858585';
      if (character.status === 'Dead')
        statusColor = 'red';
      else if (character.status === 'Alive')
        statusColor = 'limegreen';

      cards += `
<div class="card">
  <img src="${character.image}" alt="${character.name} image">
  <div class="cardData">
    
    <div class="cardTitle">
      <h2>${character.name}</h2>
      <div>
        <span class="statusIcon" style="color: ${statusColor}">&#x25cf;</span>
        <span>${character.status === "unknown" ? 'Unknown' : character.status} - ${character.species}</span>
      </div>
    </div>

    <div class="cardInfo">
      <h4>Última localização conhecida</h4>
      <p>${character.location.name === "unknown" ? 'Unknown' : character.location.name}</p>
    </div>

    <div class="cardInfo">
      <h4>Visto a última vez em</h4>
      <p>${lastEpisode === "unknown" ? 'Unknown' : lastEpisode}</p>
    </div>
  </div>
</div>
      `;

      ++count;
      if (!(count % 2) && count < total)
        cards += "<hr>";
      
    });

    document.querySelector("main").innerHTML = cards;
    document.getElementById('counterCharacters').innerHTML = "PERSONAGENS: " + response.data.info.count;

    fillPagination(response.data.info);
  })
  .catch(function(error) {
    console.log(error);
  });

  //
  window.searchListener = (event) =>
  {
    if (event.keyCode !== 13 )
      return;

    let currentURL = new URL(window.location.href);
    currentURL.searchParams.set('page', 1);

    let searchValue = document.getElementById('search').value;
    if (searchValue)
      currentURL.searchParams.set('search', searchValue);
    else
      currentURL.searchParams.delete('search');

    window.location.href = currentURL.href;
  }
  

  