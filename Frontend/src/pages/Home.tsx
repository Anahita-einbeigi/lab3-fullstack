import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import exercises from '../data/exercises';

function Home() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  function handleCardClick(id: number) {
    navigate(`/exercise/${id}`);
  }

  function toggleFavorite(id: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.stopPropagation();
    setFavorites((favs) => {
      const updatedFavorites = favs.includes(id) ? favs.filter(favId => favId !== id) : [...favs, id];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      window.dispatchEvent(new Event('storage'));
      return updatedFavorites;
    });
  }

  return (
    <div className="main-content">
      <div style={{ flex: 1, marginLeft: '20px', marginTop: '30px' }}>
        <h1 style={{ color: 'red', fontWeight: 'normal' }}>Fitness club</h1>
        <p style={{ fontSize: '20px' }}>Sweat, Smile and Repeat</p>
        <p>Check out the most effective exercises</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {exercises.map(exercise => (
          <div key={exercise.id} onClick={() => handleCardClick(exercise.id)} style={{
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            margin: '20px',
            width: '300px',
            overflow: 'hidden',
            cursor: 'pointer'
          }}>
            <div style={{
              backgroundImage: `url(${exercise.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              <h2>{exercise.title}</h2>
            </div>
            <p style={{ padding: '10px', color: 'black' }}>{exercise.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px' }}>
              <button onClick={(event) => toggleFavorite(exercise.id, event)}>
                {favorites.includes(exercise.id) ? '❤️' : '🤍'} Favorite
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
