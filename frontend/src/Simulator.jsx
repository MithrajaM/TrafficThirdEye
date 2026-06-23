import React from 'react';

function Simulator({ initialData, clearInitialData }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>AI Traffic Impact Simulator</h3>
      </div>
      <div className="card-body">
        <p>Simulator component is under construction.</p>
        {initialData && (
          <div>
            <h4>Initial Data Received:</h4>
            <pre>{JSON.stringify(initialData, null, 2)}</pre>
            <button onClick={clearInitialData}>Clear Data</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Simulator;