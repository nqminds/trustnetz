import React from 'react';

const Table = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p>No data available</p>;
  }

  const headers = Object.keys(data);

  return (
    <table>
      <tbody>
        {headers.map((header) => (
          <tr key={header}>
            <th>{header}</th>
            <td>{renderValue(data[header])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const renderValue = (value) => {
  // Check if the value is boolean
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }

  // Handle other types if needed
  return value;
};

export default Table;