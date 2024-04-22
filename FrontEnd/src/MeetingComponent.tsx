import React, { useEffect, useRef } from 'react';

interface MeetingComponentProps {
    meetingSession: any; // Replace 'any' with the correct type
}

const MeetingComponent: React.FC<MeetingComponentProps> = ({ meetingSession }) => {
    const videoElementRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videoTileDidUpdate = (tileState: any) => {
            if (!tileState.boundAttendeeId || !tileState.localTile) return;

            meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElementRef.current);
        };

        meetingSession.audioVideo.addObserver({
            videoTileDidUpdate,
        });

        meetingSession.audioVideo.startLocalVideoTile();

        return () => {
            meetingSession.audioVideo.removeObserver({
                videoTileDidUpdate,
            });
            meetingSession.audioVideo.stopLocalVideoTile();
        };
    }, [meetingSession]);

    return (
        <div>
            <h2>Meeting</h2>
            <video ref={videoElementRef} autoPlay muted playsInline style={{ width: '320px', height: '240px' }} />
        </div>
    );
};

export default MeetingComponent;
