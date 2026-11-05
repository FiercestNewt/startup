import { useEffect, useState } from "react";

const url = "https://pokeapi.co/api/v2/pokemon/%s/";

function getID() {
      const today = new Date().getTime();
      const seed = Math.floor(today / (1000 * 60 * 60 * 24));
      return Math.floor(Math.random() * 600) + 1;
}

async function getPokemon(id) {
      const response = await fetch(url.replace("%s", id));
      return await response.json();
}

async function pokemonStat() {
      const pokemon = await getPokemon(getID());
      var sprites = pokemon.sprites;
      var sprite = sprites.front_default;
      if (sprites.other != null && sprites.other.official_artwork.front_default != null) {
            sprite = sprites.other.official_artwork.front_default;
      }
      let data = {
            name: pokemon.name,
            id: pokemon.id,
            sprite: sprite,
            sound: pokemon.sounds.latest
      }
      return data;
}

export function PokemonOfTheDay() {
      const [pokemon, setPokemon] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            pokemonStat().then((data) => {
                  setPokemon(data);
                  setLoading(false);
            });
      }, []);

      function playCry() {
            if (!pokemon?.sound) return;

            const audio = new Audio(pokemon.sound);
            audio.play().catch(console.error);
      }

      if (loading || !pokemon) {
            return null;
      }

      return (
            <div className="pokemon-of-the-day" onMouseEnter={playCry}>
                  <img src={pokemon.sprite} alt={pokemon.name} />

                  <div className="pokemon-info">
                        <span className="pokemon-name">{pokemon.name}</span>
                        <span className="pokemon-label">
                              Pokemon of the day
                        </span>
                  </div>
            </div>
      );
}
