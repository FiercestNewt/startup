import { useEffect, useState } from "react";

// fetches from frontend to comply with instructions per the assignment

const url = "https://pokeapi.co/api/v2/pokemon/%s/";

function getPokemonID() {
      const today = new Date();
      const seed =
            today.getFullYear() * 10000 +
            (today.getMonth() + 1) * 100 +
            today.getDate();

      const random = Math.sin(seed) * 10000;
      const normalized = random - Math.floor(random);
      
      return Math.floor(normalized) + 1;
}

async function getPokemon(id) {
      const response = await fetch(url.replace("%s", id));
      if (!response.ok) {
            throw new Error(`Pokemon request failed: ${response.status}`);
      }
      return await response.json();
}

async function pokemonStat() {
      const pokemon = await getPokemon(getPokemonID());
      var sprites = pokemon.sprites;
      var sprite = sprites.front_default;
      const officialArtwork = sprites.other?.["official-artwork"]?.front_default;
      if (officialArtwork) {
            sprite = officialArtwork;
      }
      let data = {
            name: pokemon.name,
            id: pokemon.id,
            sprite: sprite,
            sound: pokemon.cries?.latest
      }
      return data;
}
let lastPlay = 0;
export function PokemonOfTheDay() {
      const [pokemon, setPokemon] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(false);

      useEffect(() => {
            pokemonStat()
                  .then((data) => setPokemon(data))
                  .catch((requestError) => {
                        console.error("Unable to load Pokemon of the day", requestError);
                        setError(true);
                  })
                  .finally(() => setLoading(false));
      }, []);

      function playCry() {
            if (Date.now() - lastPlay < 1000) return;
            lastPlay = Date.now();
            if (!pokemon?.sound) return;

            const audio = new Audio(pokemon.sound);
            audio.volume = 0.01;
            audio.play().catch(console.error);
      }

      if (loading || error || !pokemon) {
            return null;
      }

      return (
            <div className="pokemon-of-the-day" onMouseEnter={playCry}>
                  <img src={pokemon.sprite} alt={pokemon.name} />

                  <div className="pokemon-info">
                        <span className="pokemon-name">{pokemon.name}</span>
                        <span className="pokemon-label">
                              Pokemon of the day: {pokemon.name}
                        </span>
                  </div>
            </div>
      );
}
