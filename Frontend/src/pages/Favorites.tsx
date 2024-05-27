import { useEffect, useState } from 'react';
import exercises from '../data/exercises';

function Favorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(favs);
  }, []);

  const removeFavorite = (id: number) => {
    const updatedFavorites = favorites.filter(favId => favId !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    window.dispatchEvent(new Event('storage'));
  };

  if (favorites.length === 0) {
    return (
      <div>
        <h1>Your Favorites</h1>
        <p style={{marginTop: '45px', fontSize:'20px'}}>Your favourite page is empty.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '50px' }}>
      <h1 style={{ fontSize: '30px', marginTop: '10px' }}>Your Favorites</h1>
      <div>
        {exercises.filter(exercise => favorites.includes(exercise.id)).map(exercise => (
          <div key={exercise.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <img src={exercise.imageUrl} alt={exercise.title} style={{ width: '100px', height: '100px', marginRight: '10px' }} />
            <div>
              <h2>{exercise.title}</h2>
              <p>{exercise.description}</p>
            </div>
            <button onClick={() => removeFavorite(exercise.id)} style={{ marginLeft: 'auto', padding: '5px 10px', cursor: 'pointer' }}>
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
