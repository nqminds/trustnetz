'use client';
import React, {useState, useEffect} from 'react';
import '@/app-css.css';
import fetchJson from '@/utilities/fetch-json';
import { RegistrarAPIAddress } from '@/config';

const ListItem = ({ leftContent, rightContent }) => (
  <div className="list-item">
    <div className="left-content">{leftContent}</div>
    <div className="right-content">{rightContent}</div>
  </div>
);

const VCLog = () => {
  const [vcLog, setVcLog] = useState([]);

  const fetchVcLog = async () => {
    const vcLog = await fetchJson(`${RegistrarAPIAddress}/vc-logs`);
    setVcLog(vcLog.map(({log}) => log));
  };


  useEffect(() => {
    // Fetch initial inputValue from an API route when the component mounts
    const fetchData = async () => {
      await fetchVcLog();
    };

    fetchData();

    // Set up an interval to run the function every 2 seconds
    const intervalId = setInterval(fetchData, 2000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts


  return (
    <div className="list-container">
      <h3>List of submitted VC and Registrar&#39;s Responses:</h3>
      <ul className="scrollable-list">
        {vcLog.slice().reverse().map((item, index) => (
          <li key={index}>
            <ListItem
              leftContent={item.split(", ")[0]}  // Left-aligned content
              rightContent={item.split(", ")[1]}  // Right-aligned content
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VCLog;
