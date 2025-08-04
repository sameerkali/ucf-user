import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
      <h1>Counter: {count}</h1>
      <div>
        <button onClick={decrement} style={{ fontSize: "20px", marginRight: "10px" }}>-</button>
        <button onClick={increment} style={{ fontSize: "20px" }}>+</button>
      </div>
    </div>
  );
}

export default App;
