export function getData(key, offset, seed){
      noise.seed(seed * key);
      let data = [];
      for (let i = 0; i < 10; i++) {
        let value = noise.perlin2(i / 10, offset);
        data.push(Math.floor((value + 1) * 100));
      }
      return data;
}