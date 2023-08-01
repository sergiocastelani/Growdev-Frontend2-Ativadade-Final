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

await fillEpisodes();
await fillLocations();

//Get characters

axios.get("https://rickandmortyapi.com/api/character")
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
  })
  .catch(function(error) {
    console.log(error);
  });