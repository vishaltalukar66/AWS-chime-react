// src/MeetingRoom.tsx

import React, { useEffect, useRef } from 'react';
import { ConsoleLogger, DefaultDeviceController, DefaultMeetingSession, LogLevel } from 'amazon-chime-sdk-js';

interface MeetingRoomProps {
    joinInfo: any;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ joinInfo }) => {
    const videoElementRef = useRef<HTMLVideoElement>(null);
    const audioDeviceRef = useRef<any>(null);
    const meetingSessionRef = useRef<any>(null);

    useEffect(() => {
        const initChime = async () => {
            try {
                // Initialize Chime meeting session
                const logger = new ConsoleLogger('ChimeMeeting', LogLevel.INFO);
                const deviceController = new DefaultDeviceController(logger);
                const configuration = new DefaultMeetingSession.Configuration(
                    joinInfo.Meeting,
                    joinInfo.Attendee
                );
                const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);

                meetingSessionRef.current = meetingSession;

                // Start audio
                await meetingSession.audioVideo.start();
                audioDeviceRef.current = await meetingSession.audioVideo.chooseAudioInputDevice(null);

                // Display video
                if (videoElementRef.current) {
                    meetingSession.audioVideo.bindVideoElement(videoElementRef.current);
                    await meetingSession.audioVideo.chooseVideoInputDevice(null);
                    meetingSession.audioVideo.startLocalVideoTile();
                }
            } catch (error) {
                console.error('Error initializing Chime:', error);
            }
        };

        initChime();

        return () => {
            // Clean up
            if (meetingSessionRef.current) {
                meetingSessionRef.current.audioVideo.stop();
            }
        };
    }, [joinInfo]);

    const toggleVideo = async () => {
        if (meetingSessionRef.current) {
            const videoIsOn = meetingSessionRef.current.audioVideo.videoTileController.hasStartedLocalVideoTile();
            if (videoIsOn) {
                await meetingSessionRef.current.audioVideo.stopLocalVideoTile();
            } else {
                await meetingSessionRef.current.audioVideo.startLocalVideoTile();
            }
        }
    };

    const toggleAudio = async () => {
        if (meetingSessionRef.current) {
            const audioIsOn = meetingSessionRef.current.audioVideo.realtimeIsLocalAudioMuted();
            if (audioIsOn) {
                await meetingSessionRef.current.audioVideo.realtimeUnmuteLocalAudio();
            } else {
                await meetingSessionRef.current.audioVideo.realtimeMuteLocalAudio();
            }
        }
    };

    return (
        <div>
            <h1>Meeting Room: {joinInfo.Title}</h1>
            <p>Welcome, {joinInfo.Attendee.Name}!</p>
            <div>
                <video ref={videoElementRef} autoPlay playsInline />
            </div>
            <button onClick={toggleVideo}>Toggle Video</button>
            <button onClick={toggleAudio}>Toggle Audio</button>
        </div>
    );
};

export default MeetingRoom;
