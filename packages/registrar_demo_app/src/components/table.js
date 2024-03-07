import React from 'react';

const divStyle = {
  overflow: 'auto',
  maxHeight: '150px',
  maxWidth: '500px',
  border: '1px solid #ccc',
  padding: '10px',
};

const Table = ({ data }) => {
  const cellStyle = {
    border: '1px solid #000', // Add a 1px solid black border
    padding: '1px', // Add padding for better spacing
  };
  if (!data || Object.keys(data).length === 0) {
    return <p>No data available</p>;
  }

  const headers = Object.keys(data);

  return (
    <table style={{width: '-webkit-fill-available'}}>
      <tbody>
        {headers.map((header) => (
          <tr key={header}>
            <th style={cellStyle}>{header}</th>
            <td style={cellStyle}>{renderValue(data[header])}</td>
        </tr>
        ))}
      </tbody>
    </table>
  );
};

const renderValue = (value) => {
  let returnComponent = null;

  // Check if the value is boolean
  if (typeof value === 'boolean') {
    returnComponent = (
      <div style={divStyle}>
        <pre>{value ? 'True' : 'False'}</pre>
      </div>
    );
  }
  else {
    // Handle other types if needed
    returnComponent = (
      <div style={divStyle}>
        <pre>{value}</pre>
      </div>
    );
  }

  return returnComponent;
};

export default Table;