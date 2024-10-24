import { useState, useEffect } from 'react'

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/items')
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(error => console.error('Error feching data', error));
  }, []);

  return (
    <>
      <div>
        <h1>Items List</h1>
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default App
