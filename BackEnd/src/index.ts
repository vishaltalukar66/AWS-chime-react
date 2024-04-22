const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { ChimeSDKMeetings } = require('@aws-sdk/client-chime-sdk-meetings');
import { Request, Response } from "express";
const cors = require("cors");

const port = 8092;
const region = 'us-east-1';

// AWS credentials
const credentials = {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
};

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:5176", "http://localhost:5174", "http://localhost:5175"]
};
app.use(cors(corsOptions));

// Initialize Chime SDK Meetings
const chimeSDKMeetings = new ChimeSDKMeetings({
    region,
    credentials
});

// Define meeting and attendee caches
interface MeetingCache {
    [title: string]: any;
}

interface AttendeeCache {
    [title: string]: { [attendeeId: string]: any };
}

const meetingCache: MeetingCache = {};
const attendeeCache: AttendeeCache = {};

// API endpoint for joining a meeting
app.post('/join', async (req: Request, res: Response) => {
    try {
        const { title, attendeeName, region = 'us-east-1', ns_es } = req.body;

        if (!meetingCache[title]) {
            const { Meeting } = await chimeSDKMeetings.createMeeting({
                ClientRequestToken: uuidv4(),
                MediaRegion: region,
                ExternalMeetingId: title.substring(0, 64),
                MeetingFeatures: ns_es === 'true' ? { Audio: { EchoReduction: 'AVAILABLE' } } : undefined,
            });

            meetingCache[title] = Meeting;
            attendeeCache[title] = {};
        }

        const { Attendee } = await chimeSDKMeetings.createAttendee({
            MeetingId: meetingCache[title].MeetingId,
            ExternalUserId: uuidv4(),
        });

        attendeeCache[title][Attendee.AttendeeId] = { ...Attendee, Name: attendeeName };

        const joinInfo = {
            JoinInfo: {
                Title: title,
                Meeting: meetingCache[title],
                Attendee: attendeeCache[title][Attendee.AttendeeId],
            },
        };

        res.status(201).json(joinInfo);
    } catch (err) {
        console.error(`Error creating/joining meeting: ${err}`);
        res.status(403).json({ error: err });
    }
});

// API endpoint for retrieving attendee information
app.get('/attendee', (req: Request, res: Response) => {
    try {
        const { title, attendeeId } = req.query;
        const attendee = attendeeCache[title as string][attendeeId as string];
        res.status(200).json(attendee);
    } catch (err) {
        console.error(`Error getting attendee information: ${err}`);
        res.status(403).json({ error: err });
    }
});

// API endpoint for ending a call
app.post('/endCall', async (req: Request, res: Response) => {
    try {
        const { title } = req.body;

        if (meetingCache[title]) {
            await chimeSDKMeetings.deleteMeeting({
                MeetingId: meetingCache[title].MeetingId,
            });

            // Clear the meeting and attendee caches for the ended call
            delete meetingCache[title];
            delete attendeeCache[title];
        }

        res.status(200).end();
    } catch (err) {
        console.error(`Error ending meeting: ${err}`);
        res.status(403).json({ error: err });
    }
});

// Route to receive logs
app.post('/logs', (req: Request, res: Response) => {
    console.log('Received logs in the local server');
    res.end('Received logs in the local server');
});

// Handle unsupported requests
app.all('*', (req: Request, res: Response) => {
    res.status(400).json({ error: 'Bad Request - Unsupported Endpoint' });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
