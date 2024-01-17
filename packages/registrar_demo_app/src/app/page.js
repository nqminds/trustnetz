'use client';
import React, { useState } from 'react';
import './MyComponent.css';

const MyComponent = () => {
  const [listItems, setListItems] = useState([]);

  const handleButtonClick = (value) => {
    setListItems([...listItems, value]);
  };

  const signClaim = async (body, schemaName) => {
		try {
      let options = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(body),
      }
      let res = await fetch(`http://localhost:3000/sign/${schemaName}`, options);
      let response = null;
      try {
        response = await res.clone().json();
      }
      catch {
        response = await res.text();
      }
      return response;
		} catch (err) {
			console.log(err);
		}
	};

  const submitVC = async (vc, schemaName) => {
		try {
      let options = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(vc),
      }
      let res = await fetch(`http://localhost:3001/submit-vc/${schemaName}`, options);
      let response = null;
      try {
        response = await res.clone().json();
      }
      catch {
        response = await res.text();
      }
      return response;
		} catch (err) {
			console.log(err);
		}
	};

  const signAndSubmitClaim = async (claim, schemaName) => {
    try {
      // Create a new Date object
      const now = new Date();
      // Format the current time in ISO 8601 format
      const iso8601TimeString = now.toISOString();
      claim.issuanceDate = iso8601TimeString;
      const vc = await signClaim(claim, schemaName);
      const response = await submitVC(vc, schemaName);
      handleButtonClick(`VC Claim: ${JSON.stringify(claim)}, Response: ${response}`);
		} catch (err) {
			console.log(err);
		}
  }

  const trustManufacturer = async () => {
		try {
      const claim = {
        "user": "Nick",
        "manufacturer": "www.manufacturer.com",
        "trust": true,
      };
      await signAndSubmitClaim(claim, "manufacturer_trust");
		} catch (err) {
			console.log(err);
		}
	};

  const distrustManufacturer = async () => {
    try {
      const claim = {
        "user": "Nick",
        "manufacturer": "www.manufacturer.com",
        "trust": false,
      };
      await signAndSubmitClaim(claim, "manufacturer_trust");
		} catch (err) {
			console.log(err);
		}
  }

  return (
    <div className="container">
      {/* Left side with buttons */}
      <div className="button-container">
        <button onClick={trustManufacturer}>Trust Manufacturer</button>
        <button onClick={distrustManufacturer}>Distrust Manufacturer</button>
        {/* Add more buttons as needed */}
      </div>

      {/* Vertical line */}
      <div className="vertical-line"></div>

      {/* Right side with list */}
      <div className="list-container">
        <h3>List of Strings:</h3>
        <ul>
          {listItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyComponent;

