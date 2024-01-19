'use client';
import React, {useState, useEffect} from 'react';
import ControlPanel from '@/components/control-panel';
import VCLog from '@/components/vc-log';
import InfoPanel from '@/components/info-panel';
import '@/app-css.css';

const Page = () => {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');

  return (
    <div className="container">
      <ControlPanel selectedDevice={selectedDevice} selectedDeviceType={selectedDeviceType} selectedManufacturer={selectedManufacturer} 
        setSelectedDevice={setSelectedDevice} setSelectedDeviceType={setSelectedDeviceType} setSelectedManufacturer={setSelectedManufacturer} 
      />
      <div className="vertical-line"></div>
      <VCLog />
      <div className="vertical-line"></div>
      <InfoPanel selectedDevice={selectedDevice} selectedDeviceType={selectedDeviceType} selectedManufacturer={selectedManufacturer} />
    </div>
  );
};

export default Page;

