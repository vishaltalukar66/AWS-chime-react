import React, { useState } from 'react';
import axios from 'axios';
import { AudioInputControl, ContentShareControl, DeviceLabels, useMediaStreamMetrics, useMeetingManager, VideoInputControl } from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import { VideoTileGrid } from 'amazon-chime-sdk-component-library-react';
import dropCall from "./assets/dropCall.svg";


const App: React.FC = () => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const meetingManager = useMeetingManager();
  const metrics = useMediaStreamMetrics();

  const handleEndCall = async () => {
    await axios.post('http://localhost:8092/endCall', {
      title: meetingTitle,
    })
    window.location.reload();
  }

  const handleJoinMeeting = async () => {
    try {
      const data = await axios.post('http://localhost:8092/join', {
        title: meetingTitle,
        attendeeName: attendeeName,
      });

      const configuration = new MeetingSessionConfiguration(
        data.data.JoinInfo.Meeting,
        data.data.JoinInfo.Attendee
      );

      const options = {
        deviceLabels: DeviceLabels.AudioAndVideo,
      };

      await meetingManager.join(configuration, options);

      await meetingManager.start();

    } catch (error) {
      console.error('Error joining meeting:', error);
    }
  };

  return (
    <div className="App w-screen flex flex-col gap-5 p-5">
      <div className='flex flex-col gap-3 justify-start'>
        <h1>Join Meeting</h1>
        <div className='flex gap-5'>
          <input
            type="text"
            placeholder="Meeting Title"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            className='w-40 text-black p-1 rounded-md pl-2'
          />
          <input
            type="text"
            placeholder="Your Name"
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
            className='w-40 text-black p-1 rounded-md pl-2'
          />
          <button onClick={handleJoinMeeting} className='w-40 bg-white text-black p-2
        hover:bg-black hover:text-white  rounded-lg
        ' >Join</button>
        </div>
      </div>
      <div className='flex  flex-col items-center'>
        <div style={{ height: "95vh", width: "95%" }}>
          <VideoTileGrid
            noRemoteVideoView={<div>No one is sharing their video</div>}
          />
        </div>
        <div className='flex gap-5 mt-5 mb-5'>
          <VideoInputControl />
          <AudioInputControl />
          <ContentShareControl />
          <div className='w-7 h-7 hover:bg-[#29dcf8] rounded-full justify-center items-center flex cursor-pointer ' onClick={handleEndCall}>
            <img src={dropCall} alt="dropCall" className='w-5 h-5 ' />
          </div>
        </div>
        <div >
          <p className='mt-3'>Incoming Bandwidth: {metrics.availableIncomingBandwidth}</p>
          <p className='mt-3'>Bandwidth Outgoing: {metrics.availableOutgoingBandwidth}</p>
        </div>
      </div>

    </div>
  );
};

export default App;
